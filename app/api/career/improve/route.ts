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
    const { uploadId, userId } = await req.json();

    if (!uploadId || !userId) {
      return NextResponse.json({ error: "Missing uploadId or userId" }, { status: 400 });
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
Rules: Keep ALL real information (jobs, degrees, names, dates). Do NOT invent anything.
Improve: grammar, structure, formatting, ATS compatibility, professional tone, action verbs.
Return the complete improved CV as clean plain text with clear sections.
Start with the person's name as a heading. Use standard CV sections.`;

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
