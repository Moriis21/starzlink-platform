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
    const { jobTitle, companyName, cvText, userId } = await req.json();

    if (!jobTitle || !companyName || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = await getGroqKey();
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a professional career coach and expert letter writer.
Write a compelling, professional application/cover letter for the job position.
The letter should:
- Be 3-4 paragraphs
- Start with a strong opening that shows enthusiasm and fit
- Highlight relevant skills and experience from the CV
- Include specific reasons why the applicant is a great fit for this company
- Close with a confident call to action
- Use professional but warm tone
- Be ready to send (include [Your Name], [Your Address], [Date], [Your Email] placeholders)
Return ONLY the letter text, no JSON, no extra commentary.`;

    const userPrompt = `Write an application letter for:
Position: ${jobTitle}
Company: ${companyName}
${cvText ? `Applicant's CV/Background:\n${cvText.slice(0, 3000)}` : "No CV provided — write a general professional letter."}`;

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 1200,
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq error:", groqRes.status, errBody);
      return NextResponse.json({ error: "AI failed to generate letter" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const letterContent: string = groqData?.choices?.[0]?.message?.content ?? "";

    if (!letterContent) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    // Save to application_letters
    const { data: letterData, error: letterError } = await insforge.database
      .from("application_letters")
      .insert([{
        user_id: userId,
        job_title: jobTitle,
        company_name: companyName,
        letter_content: letterContent,
      }])
      .select("id")
      .single();

    if (letterError) {
      console.error("Letter save error:", letterError);
    }

    return NextResponse.json({
      letterId: (letterData as any)?.id ?? null,
      content: letterContent,
    });
  } catch (err: any) {
    console.error("Letter API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
