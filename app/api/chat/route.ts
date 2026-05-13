import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 280; // Short, focused replies

// Fetch Groq API key from InsForge settings DB at runtime — no secrets in code
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

// ── Concise StarzLink knowledge base ──────────────────────────────────────────
const SYSTEM_PROMPT = `You are StarzLink Assistant — the official AI helper for StarzLink, Liberia's #1 opportunity platform.

## STRICT RESPONSE RULES
1. REPLY LENGTH: 1–3 short sentences MAX. No paragraphs. Match reply length exactly to what was asked.
2. LISTS: Use 3–4 bullets MAX. Never more.
3. LINKS: End every reply with ONE relevant link as [Label](/path).
4. GPA: When asked to calculate GPA, show the math step-by-step — this is the ONLY exception to short replies.
5. NO FILLER: Never say "Great question!", "Certainly!", "I hope this helps", or any padding.
6. DIRECT: Answer ONLY what was asked. Nothing extra.

## SCOPE
Answer ONLY about: StarzLink platform, opportunities, GPA calculation, career advice for Liberians/West Africans.
Off-topic? Reply with ONLY: "I only help with StarzLink topics. Need help finding an opportunity?"

## PLATFORM
StarzLink is free. Serving students, graduates, professionals in Liberia and beyond.
Register at: [Sign Up](/signup)

## LINKS TO USE
Opportunities: /opportunities/jobs | /opportunities/scholarships | /opportunities/internships | /opportunities/grants | /opportunities/competitions | /opportunities/volunteer | /opportunities/study-abroad | /opportunities/research | /trainings | /campus-updates
Tools: /tools/cv-builder | /tools/scholarship-calculator | /events | /leaderboard
Dashboard: /dashboard/saved | /dashboard/notifications | /dashboard/referrals
General: /signup | /login | /about | /contact | /resources | /partner

## KEY OPPORTUNITIES
Study Abroad: Fulbright (USA, full), Chevening (UK, full), DAAD (Germany), Erasmus Mundus (Europe), MasterCard Foundation → [Study Abroad](/opportunities/study-abroad)
Grants: Tony Elumelu ($5K), Mandela Washington (YALI), Echoing Green ($90K), Ford Foundation → [Grants](/opportunities/grants)
Internships: USAID Liberia ($300/mo), UN System Liberia, AfDB YPP, ECOWAS → [Internships](/opportunities/internships)
Competitions: Hult Prize ($1M), Anzisha ($25K, 15-22yrs), MIT Solve ($150K) → [Competitions](/opportunities/competitions)
Volunteer: UN Volunteers Liberia, Peace Corps, VSO → [Volunteer](/opportunities/volunteer)
Research: NIH Fogarty, CODESRIA ($30K), TWAS ($15K) → [Research](/opportunities/research)

## CONTACTS
Phone: +231 770 787 020 / +231 888 283 007 | Email: support@starzlink.com
WhatsApp Channel: https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17
[Contact Us](/contact)

## GPA CALCULATION
Ask for each course: name, grade, credit hours.
Grade points → A+=A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D=1.0, F=0
Formula: GPA = Σ(grade_points × credits) ÷ Σ(credits)
After calculating, recommend:
• 3.7–4.0: Fulbright, Chevening, DAAD, MasterCard Foundation
• 3.3–3.6: Mandela Washington, Erasmus Mundus
• 3.0–3.2: Tony Elumelu, USAID Internship, ECOWAS
• Below 3.0: Tony Elumelu (business idea matters more), competitions, volunteer

## POINTS/REFERRALS
1 referral = 5 pts | 100 pts = $1 credit → redeem for paid resources → [Referrals](/dashboard/referrals)`;

// ── POST handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, userName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const apiKey = await getGroqKey();
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const systemContent = SYSTEM_PROMPT +
      (userName ? `\n\nUser's name: ${userName}. Use it naturally once.` : "");

    const groqMessages = [
      { role: "system", content: systemContent },
      ...messages.slice(-14).map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.55,
        max_tokens: MAX_TOKENS,
        stream: false,
        top_p: 0.85,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq error:", groqRes.status, errBody);
      return NextResponse.json({ error: `Groq ${groqRes.status}` }, { status: 500 });
    }

    const data = await groqRes.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";

    if (!content) {
      return NextResponse.json({ error: "Empty response" }, { status: 500 });
    }

    return NextResponse.json({ content });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
