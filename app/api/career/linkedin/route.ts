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
    const { currentHeadline, cvText, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const apiKey = await getGroqKey();
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a LinkedIn profile optimization expert. Analyze the provided professional background and optimize their LinkedIn profile.
Return a JSON object with exactly these fields:
{
  "headline_suggestions": string[] (5 compelling, keyword-rich headlines),
  "about_rewrite": string (full professional About section, 3-4 paragraphs, 2000 chars max),
  "skills_suggestions": string[] (15 relevant skills to add),
  "keyword_suggestions": string[] (20 keywords that improve search visibility),
  "profile_tips": string[] (10 specific actionable tips to improve the profile)
}
Return ONLY valid JSON, no extra text.`;

    const userPrompt = `Optimize LinkedIn profile for:
Current Headline: ${currentHeadline || "Not provided"}
${cvText ? `Professional Background / CV:\n${cvText.slice(0, 4000)}` : "No CV provided — use the headline to infer profession."}`;

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
        temperature: 0.5,
        max_tokens: 2500,
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq error:", groqRes.status, errBody);
      return NextResponse.json({ error: "AI failed to optimize profile" }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const rawResponse: string = groqData?.choices?.[0]?.message?.content ?? "";

    let result: any = {};
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Save to linkedin_reviews
    const { data: reviewData, error: reviewError } = await insforge.database
      .from("linkedin_reviews")
      .insert([{
        user_id: userId,
        current_headline: currentHeadline || null,
        headline_suggestions: result.headline_suggestions ?? [],
        about_rewrite: result.about_rewrite ?? "",
        skills_suggestions: result.skills_suggestions ?? [],
        keyword_suggestions: result.keyword_suggestions ?? [],
        profile_tips: result.profile_tips ?? [],
      }])
      .select("id")
      .single();

    if (reviewError) {
      console.error("LinkedIn review save error:", reviewError);
    }

    return NextResponse.json({
      reviewId: (reviewData as any)?.id ?? null,
      ...result,
    });
  } catch (err: any) {
    console.error("LinkedIn API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
