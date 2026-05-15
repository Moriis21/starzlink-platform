import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

const GROQ_MODEL = "llama-3.3-70b-versatile";

async function getGroqKey(): Promise<string> {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  try {
    const { data } = await insforge.database.from("settings").select("value").eq("key", "groq_api_key").single();
    return (data as any)?.value ?? "";
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  try {
    const { action, essayType, prompt: userPrompt, background, goals, scholarship, tone, targetWords, existingText, userId } = await req.json();

    const groqKey = await getGroqKey();
    if (!groqKey) return NextResponse.json({ error: "AI unavailable" }, { status: 503 });

    let systemPrompt = "";
    let userMessage = "";

    if (action === "generate") {
      systemPrompt = `You are an expert scholarship essay writer helping students in Liberia and West Africa craft compelling, personal essays.
Write in a warm, authentic, first-person voice. Avoid generic phrases. Make it feel genuinely human — specific, personal, and emotionally resonant.
NEVER use: "In conclusion", "Furthermore", "It is worth noting", "I am writing to express", "I have always been passionate about".
Instead write naturally as if the person is telling their story.`;

      userMessage = `Write a ${essayType || "scholarship essay"} with these details:
- Background: ${background || "Not provided"}
- Goals: ${goals || "Not provided"}
- Scholarship/Opportunity: ${scholarship || "General scholarship"}
- Tone: ${tone || "professional but personal"}
- Target length: approximately ${targetWords || 500} words

Write the full essay. Make it personal, specific, and compelling. First-person voice throughout.`;

    } else if (action === "improve") {
      systemPrompt = `You are an expert editor helping improve scholarship essays. Make the writing more compelling, personal, and specific. Fix grammar, flow, and impact. Keep the author's authentic voice.`;
      userMessage = `Improve this essay. Keep the same general content but make it more compelling, natural, and impactful:

---
${existingText}
---

Tone: ${tone || "professional but personal"}
Target length: ${targetWords || 500} words`;

    } else if (action === "rewrite") {
      systemPrompt = `You are an expert essay rewriter. Completely rewrite the essay with fresh language while preserving the core ideas. Make it more engaging and natural.`;
      userMessage = `Rewrite this essay with fresh, compelling language:

---
${existingText}
---

Keep the main points but use completely different wording. Tone: ${tone || "professional"}.`;

    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 1200,
        temperature: 0.8,
      }),
    });

    const groqData = await res.json();
    const essay = groqData.choices?.[0]?.message?.content?.trim() ?? "";

    // Auto-save draft if userId provided
    if (userId && essay) {
      try {
        await insforge.database.from("essay_drafts").insert({
          user_id: userId,
          title: scholarship || essayType || "My Essay",
          essay_type: essayType || "scholarship_essay",
          content: essay,
          prompt: userPrompt || userMessage.slice(0, 200),
          tone: tone || "professional",
          word_count: essay.split(/\s+/).length,
          target_word_count: targetWords || 500,
          status: "draft",
        });
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({ success: true, essay, wordCount: essay.split(/\s+/).length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: fetch user's drafts
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ drafts: [] });

    const { data } = await insforge.database
      .from("essay_drafts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ drafts: data || [] });
  } catch { return NextResponse.json({ drafts: [] }); }
}
