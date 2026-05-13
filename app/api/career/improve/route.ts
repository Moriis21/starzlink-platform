import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { checkProAccess } from "@/lib/checkProAccess";
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
    const { uploadId, userId } = await req.json();

    if (!uploadId || !userId) {
      return NextResponse.json({ error: "Missing uploadId or userId" }, { status: 400 });
    }

    // Pro check
    const isPro = await checkProAccess(userId);
    if (!isPro) {
      return NextResponse.json({ error: "Pro subscription required", code: "PRO_REQUIRED" }, { status: 403 });
    }

    // Fetch the extracted text
    const { data: uploadData, error: uploadError } = await insforge.database
      .from("cv_uploads")
      .select("extracted_text, file_name")
      .eq("id", uploadId)
      .eq("user_id", userId)
      .single();

    if (uploadError || !uploadData) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    const extractedText = (uploadData as any).extracted_text ?? "";

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "No CV text found for this upload" }, { status: 400 });
    }

    const apiKey = await getGroqKey();
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a professional CV writer. Rewrite this CV professionally.

STRICT RULES:
- Keep ALL real information. Never invent jobs, degrees, or certificates.
- Use PLAIN TEXT ONLY. Do not use: *, **, #, ##, _, __, backticks, or any markdown.
- Use ALL CAPS for section headers (PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS, etc.)
- Use clean spacing between sections (two line breaks)
- For bullet points, use the plain dash character: -
- Do NOT add any preamble, AI notes, or system messages
- Start directly with the person's name

Example section format:
PROFESSIONAL SUMMARY

Results-driven professional with 5 years of experience in...

WORK EXPERIENCE

Position Title
Company Name | City | Month Year - Month Year

- Improved team productivity by 30% through implementation of...
- Led a cross-functional team of 8 to deliver...

EDUCATION

Bachelor of Science in Computer Science
University Name | Year

SKILLS

Technical Skills: JavaScript, React, Python, SQL
Soft Skills: Leadership, Communication, Problem-Solving`;

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
          { role: "user", content: `Please rewrite and improve this CV:\n\n${extractedText.slice(0, 8000)}` },
        ],
        temperature: 0.4,
        max_tokens: 3000,
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq error:", groqRes.status, errBody);
      return NextResponse.json({ error: "AI improvement failed" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const improvedContent: string = groqData?.choices?.[0]?.message?.content ?? "";

    if (!improvedContent) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    // Save improved CV
    const { data: improvedData, error: improvedError } = await insforge.database
      .from("improved_cvs")
      .insert([{
        upload_id: uploadId,
        user_id: userId,
        improved_content: improvedContent,
        improvement_notes: "Professionally rewritten by AI for ATS compatibility and impact.",
      }])
      .select("id")
      .single();

    if (improvedError || !improvedData) {
      return NextResponse.json({ error: "Failed to save improved CV" }, { status: 500 });
    }

    return NextResponse.json({
      improvedCvId: (improvedData as any).id,
      content: improvedContent,
    });
  } catch (err: any) {
    console.error("Improve API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
