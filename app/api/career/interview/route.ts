import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
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
    const { jobTitle, userId } = await req.json();

    if (!jobTitle || !userId) {
      return NextResponse.json({ error: "Missing jobTitle or userId" }, { status: 400 });
    }

    const apiKey = await getGroqKey();
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const systemPrompt = `Generate a comprehensive interview preparation guide for: ${jobTitle}
Return JSON with exactly this structure:
{
  "common_questions": [{"question": string, "strong_answer": string}],
  "technical_questions": [{"question": string, "answer": string}],
  "behavioral_questions": [{"question": string, "answer": string, "tip": string}],
  "hr_tips": string[],
  "salary_negotiation": string[],
  "common_mistakes": string[],
  "confidence_tips": string[]
}
Include at least 5 items in common_questions, 4 in technical_questions, 4 in behavioral_questions, and 5 in each string array.
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
          { role: "user", content: `Generate the interview guide for: ${jobTitle}` },
        ],
        temperature: 0.5,
        max_tokens: 3500,
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq error:", groqRes.status, errBody);
      return NextResponse.json({ error: "AI failed to generate guide" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const rawResponse: string = groqData?.choices?.[0]?.message?.content ?? "";

    let guide: any = {};
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      guide = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Save to interview_sessions
    const { data: sessionData, error: sessionError } = await insforge.database
      .from("interview_sessions")
      .insert([{
        user_id: userId,
        job_title: jobTitle,
        questions: {
          common: guide.common_questions ?? [],
          technical: guide.technical_questions ?? [],
          behavioral: guide.behavioral_questions ?? [],
        },
        answers: {},
        tips: {
          hr_tips: guide.hr_tips ?? [],
          salary_negotiation: guide.salary_negotiation ?? [],
          common_mistakes: guide.common_mistakes ?? [],
          confidence_tips: guide.confidence_tips ?? [],
        },
      }])
      .select("id")
      .single();

    if (sessionError) {
      console.error("Session save error:", sessionError);
    }

    return NextResponse.json({
      sessionId: (sessionData as any)?.id ?? null,
      ...guide,
    });
  } catch (err: any) {
    console.error("Interview API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
