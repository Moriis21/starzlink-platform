import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// Force Node.js runtime (not Edge) — required for InsForge SDK fetch calls
export const runtime = "nodejs";

const GROQ_MODEL = "llama-3.3-70b-versatile";

let _cachedKey: string | null = null;
async function getGroqKey(): Promise<string> {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  if (_cachedKey) return _cachedKey;
  try {
    const { data } = await insforge.database
      .from("settings")
      .select("value")
      .eq("key", "groq_api_key")
      .single();
    _cachedKey = (data as any)?.value ?? "";
    return _cachedKey!;
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    // Accept pre-extracted text from client-side PDF.js
    const body = await req.json();
    const { extractedText, fileName, fileSize, fileUrl, userId } = body;

    if (!extractedText || !userId) {
      return NextResponse.json({ error: "Missing CV text or user ID" }, { status: 400 });
    }

    if (!extractedText.trim() || extractedText.trim().length < 50) {
      return NextResponse.json({
        error: "CV text is too short to analyze. Ensure your PDF contains readable text."
      }, { status: 400 });
    }

    // Look up previous analysis for this user
    const { data: prevAnalysis } = await insforge.database
      .from("cv_analysis")
      .select("overall_score, ats_score, weak_areas, missing_keywords, formatting_issues")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const prevScore = (prevAnalysis as any)?.overall_score ?? null;
    const prevAtsScore = (prevAnalysis as any)?.ats_score ?? null;
    const prevWeakAreas: string[] = (prevAnalysis as any)?.weak_areas ?? [];

    // ── Credit check (skip if Pro) ──────────────────────────────────────────
    const now = new Date().toISOString();

    const [subRes, grantRes] = await Promise.all([
      insforge.database.from("subscriptions").select("status,current_period_end").eq("user_id", userId).maybeSingle(),
      insforge.database.from("admin_pro_grants").select("is_active,expiry_date,plan_type").eq("user_id", userId).eq("is_active", true).maybeSingle(),
    ]);

    const isPaidPro = subRes.data?.status === "active" && subRes.data?.current_period_end > now;
    const isManualPro = grantRes.data?.is_active && (!grantRes.data?.expiry_date || grantRes.data.expiry_date > now);
    const isLifetime = grantRes.data?.plan_type === "pro_lifetime" && grantRes.data?.is_active;
    const userIsPro = isPaidPro || isManualPro || isLifetime;

    let creditBalance = 0;
    let currentUsed = 0;

    if (!userIsPro) {
      const { data: creditData } = await insforge.database
        .from("user_credits").select("credits_balance, credits_used").eq("user_id", userId).maybeSingle();

      creditBalance = (creditData as any)?.credits_balance ?? 0;
      currentUsed = (creditData as any)?.credits_used ?? 0;

      if (creditBalance < 5) {
        return NextResponse.json({
          error: "INSUFFICIENT_CREDITS",
          message: "You have used your free CV analysis credit. Upgrade to Pro to analyze more CVs.",
          balance: creditBalance,
        }, { status: 402 });
      }
    }

    // Save upload record — try with cv_version, fall back without it
    let uploadData: any = null;
    let uploadError: any = null;

    const baseUpload = {
      user_id: userId,
      file_name: fileName || "cv.pdf",
      file_size: fileSize || 0,
      file_url: fileUrl || "",
      extracted_text: extractedText,
      status: "processing",
    };

    // Try with cv_version first
    try {
      const { count: versionCount } = await insforge.database
        .from("cv_uploads").select("id", { count: "exact" }).eq("user_id", userId).limit(1);
      const res = await insforge.database
        .from("cv_uploads")
        .insert([{ ...baseUpload, cv_version: (versionCount ?? 0) + 1 }])
        .select("id").single();
      uploadData = res.data;
      uploadError = res.error;
    } catch {}

    // Fallback: insert without cv_version
    if (!uploadData || uploadError) {
      const res = await insforge.database
        .from("cv_uploads").insert([baseUpload]).select("id").single();
      uploadData = res.data;
      uploadError = res.error;
    }

    if (uploadError || !uploadData) {
      console.error("Upload record error:", uploadError);
      return NextResponse.json({ error: "Failed to save upload record" }, { status: 500 });
    }

    const uploadId = (uploadData as any).id;

    // Get Groq API key
    const apiKey = await getGroqKey();
    if (!apiKey) {
      await insforge.database.from("cv_uploads").update({ status: "failed" }).eq("id", uploadId);
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Truncate to 8000 chars to stay within token limits
    const cvText = extractedText.slice(0, 8000);

    // Call Groq for CV analysis
    const isReUpload = prevScore !== null;

    const systemPrompt = `You are an expert CV/Resume analyst and career coach. Your job is to produce accurate, specific, and UNIQUE analysis of the CV provided — never produce identical feedback for different documents.

CRITICAL RULES:
- Return ONLY valid JSON, no markdown, no text outside JSON
- NEVER use: *, **, #, ##, ###, _, __, backticks in string values
- Each analysis MUST be specific to the actual content provided
- NEVER copy or repeat the previous weaknesses if they have been fixed
- Scores MUST change if the CV content has improved or degraded
- Minimum score variation: if this is a different/improved CV, the score must reflect it
${isReUpload ? `
PREVIOUS ANALYSIS CONTEXT:
- Previous Overall Score: ${prevScore}/100
- Previous ATS Score: ${prevAtsScore}/100
- Previous Weak Areas: ${prevWeakAreas.slice(0, 5).join("; ")}

Compare the new CV against this baseline. If improvements are detected, INCREASE the scores accordingly. Only list a weakness if it STILL EXISTS in the new CV. Add an "improvement_summary" showing what changed.
` : ""}

Return ONLY a valid JSON object with exactly these fields:
{
  "overall_score": <integer 0-100, must accurately reflect this specific CV quality>,
  "ats_score": <integer 0-100, based on actual keyword density and ATS compatibility>,
  "cv_type": "<one of: student, graduate, professional, executive, technical, creative>",
  "experience_level": "<one of: entry, mid, senior, executive>",
  "strengths": [<3-6 specific strengths found in THIS CV>],
  "weak_areas": [<3-6 genuine weaknesses STILL present in this CV — empty if none>],
  "missing_keywords": [<5-10 industry keywords absent from THIS CV>],
  "formatting_issues": [<specific formatting problems found>],
  "grammar_issues": [<specific grammar or language problems found>],
  "section_review": {
    "summary": "<specific review of this CV's summary/objective>",
    "experience": "<specific review of this CV's experience section>",
    "education": "<specific review of this CV's education section>",
    "skills": "<specific review of this CV's skills section>",
    "other": "<review of any other sections>"
  },
  "recommended_job_titles": [<5-8 job titles matching this specific person's background>],
  "career_advice": "<2-3 sentences of personalized advice based on THIS person's actual background>",
  "score_breakdown": {
    "formatting": <0-20>,
    "keywords": <0-20>,
    "achievements": <0-20>,
    "readability": <0-20>,
    "ats_compatibility": <0-20>
  }${isReUpload ? `,
  "improvement_summary": {
    "previous_score": ${prevScore},
    "new_score": <same as overall_score>,
    "score_change": <new_score minus ${prevScore}>,
    "improvements_detected": [<list what actually improved from the previous version>],
    "still_needs_work": [<weaknesses that remain unfixed>],
    "verdict": "<one sentence summary of overall improvement or regression>"
  }` : ""}
}`;

    const userMessage = `Analyze this CV carefully and produce scoring based on its ACTUAL content quality:

${cvText}

${isReUpload ? `NOTE: This appears to be an updated/improved version of a previously analyzed CV. Compare against the previous analysis baseline provided in the system prompt and detect real changes.` : "NOTE: This is a fresh CV analysis. Produce honest, specific feedback based on what you actually find in the document."}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.35,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq error:", groqRes.status, errBody);
      await insforge.database.from("cv_uploads").update({ status: "failed" }).eq("id", uploadId);
      return NextResponse.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const rawResponse: string = groqData?.choices?.[0]?.message?.content ?? "";

    // Parse JSON from AI response (handle markdown code blocks)
    let analysis: any = {};
    try {
      // Strip markdown code fences if present
      const cleaned = rawResponse
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw:", rawResponse.slice(0, 500));
      // Use safe fallback — don't fail the request
      analysis = {
        overall_score: 60,
        ats_score: 55,
        strengths: ["CV submitted and processed successfully"],
        weak_areas: ["Detailed analysis unavailable — please try again"],
        missing_keywords: [],
        formatting_issues: [],
        grammar_issues: [],
        section_review: {
          summary: "Review pending",
          experience: "Review pending",
          education: "Review pending",
          skills: "Review pending",
          other: "N/A",
        },
        recommended_job_titles: [],
        career_advice: "Your CV was analyzed. For detailed feedback, please try re-uploading.",
      };
    }

    // Save analysis — try with new fields, fall back to original schema
    const baseAnalysis = {
      upload_id: uploadId,
      user_id: userId,
      overall_score: analysis.overall_score ?? 0,
      ats_score: analysis.ats_score ?? 0,
      strengths: analysis.strengths ?? [],
      weak_areas: analysis.weak_areas ?? [],
      missing_keywords: analysis.missing_keywords ?? [],
      formatting_issues: analysis.formatting_issues ?? [],
      grammar_issues: analysis.grammar_issues ?? [],
      section_review: analysis.section_review ?? {},
      recommended_job_titles: analysis.recommended_job_titles ?? [],
      career_advice: analysis.career_advice ?? "",
      raw_response: rawResponse,
    };

    let analysisData: any = null;
    let analysisError: any = null;

    // Try with new columns first
    try {
      const res = await insforge.database.from("cv_analysis").insert([{
        ...baseAnalysis,
        improvement_summary: analysis.improvement_summary ?? null,
        score_breakdown: analysis.score_breakdown ?? null,
        cv_type: analysis.cv_type ?? "professional",
        experience_level: analysis.experience_level ?? "mid",
      }]).select("id").single();
      analysisData = res.data;
      analysisError = res.error;
    } catch {}

    // Fallback: insert with original columns only
    if (!analysisData || analysisError) {
      const res = await insforge.database.from("cv_analysis")
        .insert([baseAnalysis]).select("id").single();
      analysisData = res.data;
      analysisError = res.error;
    }

    if (analysisError || !analysisData) {
      console.error("Analysis save error:", analysisError);
      await insforge.database.from("cv_uploads").update({ status: "failed" }).eq("id", uploadId);
      return NextResponse.json({ error: "Failed to save analysis results" }, { status: 500 });
    }

    // Mark upload as analyzed
    await insforge.database
      .from("cv_uploads")
      .update({ status: "analyzed" })
      .eq("id", uploadId);

    // ── Deduct credits for free users ───────────────────────────────────────
    if (!userIsPro) {
      await insforge.database.from("user_credits")
        .update({
          credits_balance: creditBalance - 5,
          credits_used: currentUsed + 5,
          last_credit_use_date: new Date().toISOString(),
        })
        .eq("user_id", userId);

      await insforge.database.from("credit_transactions").insert([{
        user_id: userId,
        transaction_type: "cv_analysis_usage",
        credits_amount: -5,
        reason: "CV analysis used 5 credits",
        related_cv_id: uploadId,
      }]);
    }

    return NextResponse.json({
      uploadId,
      analysisId: (analysisData as any).id,
      analysis,
      isReUpload,
      previousScore: prevScore,
    });
  } catch (err: any) {
    console.error("Analyze API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
