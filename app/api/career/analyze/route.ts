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

    // Save upload record to InsForge
    const { data: uploadData, error: uploadError } = await insforge.database
      .from("cv_uploads")
      .insert([{
        user_id: userId,
        file_name: fileName || "cv.pdf",
        file_size: fileSize || 0,
        file_url: fileUrl || "",
        extracted_text: extractedText,
        status: "processing",
      }])
      .select("id")
      .single();

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
    const systemPrompt = `You are an expert CV/Resume analyst and career coach. Analyze the provided CV and return a detailed JSON analysis.

Return ONLY a valid JSON object with exactly these fields (no markdown, no extra text):
{
  "overall_score": <integer 0-100>,
  "ats_score": <integer 0-100>,
  "strengths": [<string>, ...],
  "weak_areas": [<string>, ...],
  "missing_keywords": [<string>, ...],
  "formatting_issues": [<string>, ...],
  "grammar_issues": [<string>, ...],
  "section_review": {
    "summary": "<brief review of professional summary/objective section>",
    "experience": "<brief review of work experience section>",
    "education": "<brief review of education section>",
    "skills": "<brief review of skills section>",
    "other": "<review of any other sections>"
  },
  "recommended_job_titles": [<string>, ...],
  "career_advice": "<2-3 sentences of personalized career advice>"
}`;

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
          { role: "user", content: `Analyze this CV:\n\n${cvText}` },
        ],
        temperature: 0.2,
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

    // Save analysis to InsForge
    const { data: analysisData, error: analysisError } = await insforge.database
      .from("cv_analysis")
      .insert([{
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
      }])
      .select("id")
      .single();

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

    return NextResponse.json({
      uploadId,
      analysisId: (analysisData as any).id,
      analysis,
    });
  } catch (err: any) {
    console.error("Analyze API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
