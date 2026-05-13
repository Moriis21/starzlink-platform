import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF using pdf-parse
    let extractedText = "";
    try {
      const pdfModule = await import("pdf-parse");
      const pdfParse = (pdfModule as any).default ?? pdfModule;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || "";
    } catch (err) {
      console.error("PDF parse error:", err);
      return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "Could not extract text from PDF. Ensure the file is not scanned/image-only." }, { status: 400 });
    }

    // Upload to InsForge storage
    const timestamp = Date.now();
    const storagePath = `cvs/${userId}/${timestamp}.pdf`;
    let fileUrl = "";
    try {
      const fileBlob = new Blob([buffer], { type: "application/pdf" });
      const { data: storageData } = await insforge.storage
        .from("documents")
        .upload(storagePath, fileBlob);
      fileUrl = (storageData as any)?.url ?? "";
    } catch (err) {
      console.error("Storage upload error:", err);
      // Continue even if storage fails
    }

    // Insert cv_uploads record
    const { data: uploadData, error: uploadError } = await insforge.database
      .from("cv_uploads")
      .insert([{
        user_id: userId,
        file_name: file.name,
        file_size: file.size,
        storage_path: storagePath,
        file_url: fileUrl,
        extracted_text: extractedText,
        status: "processing",
      }])
      .select("id")
      .single();

    if (uploadError || !uploadData) {
      return NextResponse.json({ error: "Failed to save upload record" }, { status: 500 });
    }

    const uploadId = (uploadData as any).id;

    // Call Groq for analysis
    const apiKey = await getGroqKey();
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const systemPrompt = `Analyze this CV and return a JSON object with exactly these fields:
{
  "overall_score": number (0-100),
  "ats_score": number (0-100),
  "strengths": string[],
  "weak_areas": string[],
  "missing_keywords": string[],
  "formatting_issues": string[],
  "grammar_issues": string[],
  "section_review": { "summary": string, "experience": string, "education": string, "skills": string, "other": string },
  "recommended_job_titles": string[],
  "career_advice": string
}
Return ONLY valid JSON, no extra text.`;

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
          { role: "user", content: `Here is the CV text to analyze:\n\n${extractedText.slice(0, 8000)}` },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq error:", groqRes.status, errBody);
      await insforge.database.from("cv_uploads").update({ status: "failed" }).eq("id", uploadId);
      return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const rawResponse: string = groqData?.choices?.[0]?.message?.content ?? "";

    let analysis: any = {};
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
    } catch {
      analysis = {
        overall_score: 50,
        ats_score: 50,
        strengths: ["CV submitted successfully"],
        weak_areas: ["Analysis parsing failed"],
        missing_keywords: [],
        formatting_issues: [],
        grammar_issues: [],
        section_review: { summary: "N/A", experience: "N/A", education: "N/A", skills: "N/A", other: "N/A" },
        recommended_job_titles: [],
        career_advice: "Please try re-uploading your CV for a full analysis.",
      };
    }

    // Save analysis
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
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 });
    }

    // Update upload status
    await insforge.database.from("cv_uploads").update({ status: "analyzed" }).eq("id", uploadId);

    return NextResponse.json({
      uploadId,
      analysisId: (analysisData as any).id,
      analysis,
    });
  } catch (err: any) {
    console.error("Analyze API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
