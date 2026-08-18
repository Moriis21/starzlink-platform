import { NextRequest, NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rateLimit";
import { log } from "@/lib/log";
import { getGroqKey } from "@/lib/getGroqKey";

const logger = log("chat");

// gpt-oss-20b runs ~2x faster than 120b on Groq; plenty for short chat replies.
// Career tools that need heavier reasoning still use 120b.
const GROQ_MODEL = "openai/gpt-oss-20b";
const MAX_TOKENS = 280; // Short, focused replies

// Kept tight on purpose — every token here is re-sent on every message and
// directly increases time-to-first-token. Only add here if it changes replies
// in EVERY conversation. Facts that matter for specific questions (grants,
// scholarships, GPA formula) live in the GPA/topic hints appended on demand.
const SYSTEM_PROMPT = `You are the StarzLink Assistant — a warm, direct career guide for StarzLink, Liberia's #1 opportunity platform (free to use).

STYLE: Sound like a knowledgeable friend. 2–4 short sentences or a tight 4–5 item list. No filler ("Great question!", "I hope this helps", "Certainly!"). Use the user's name once if given.

LINKS: End with ONE relevant internal link as [Label](/path). Only link [Contact Us](/contact) for bugs / payment issues / account problems.

SCOPE: StarzLink platform, scholarships, jobs, trainings, GPA, career advice for Liberia/West Africa. Off-topic → "I only help with StarzLink topics. Need help finding an opportunity?"

CORE LINKS: /opportunities/{jobs,scholarships,internships,grants,competitions,volunteer,study-abroad,research} · /trainings · /campus-updates · /tools/{cv-builder,scholarship-calculator} · /dashboard/{saved,referrals} · /signup · /login`;

// Extra context appended only when the user's message needs it, so short chats
// stay short and cheap. Match cheaply (lowercase includes) and keep each block
// trimmed hard.
const GPA_HINT = `\n\nGPA:\n- Ask for courses as "Course, Grade, Credits" (example: "English 101, A, 3").\n- Scale: A/A+=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D=1.0, F=0. GPA = Σ(grade×credits)/Σ(credits).\n- After calculating: 3.7+ → Fulbright/Chevening/DAAD; 3.3–3.6 → Mandela Washington/Erasmus; 3.0–3.2 → Tony Elumelu/USAID/ECOWAS; <3.0 → Tony Elumelu, competitions. Link [Scholarships](/opportunities/scholarships).`;

const OPP_HINT = `\n\nKEY OPPORTUNITIES: Study abroad — Fulbright, Chevening, DAAD, Erasmus, MasterCard Foundation. Grants — Tony Elumelu ($5K), Mandela Washington (YALI), Echoing Green ($90K). Internships — USAID Liberia, UN Liberia, AfDB YPP, ECOWAS. Competitions — Hult Prize ($1M), Anzisha ($25K), MIT Solve. Research — NIH Fogarty, CODESRIA, TWAS.`;

const CONTACT_HINT = `\n\nCONTACT: +231 770 787 020 · support@starzlink.com · [Contact Us](/contact).`;

function buildSystemPrompt(lastUserText: string, userName: string | null): string {
  const q = lastUserText.toLowerCase();
  let extra = "";
  if (/\bgpa\b|grade|credit/.test(q)) extra += GPA_HINT;
  if (/scholarship|grant|internship|fund|study abroad|competition|volunteer|research/.test(q)) extra += OPP_HINT;
  if (/contact|support|bug|payment|refund|account|help.*human/.test(q)) extra += CONTACT_HINT;
  return SYSTEM_PROMPT + extra + (userName ? `\n\nUser's name: ${userName}. Use it naturally once.` : "");
}

// ── POST handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages, userName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const rl = rateLimit(req, { key: "chat", limit: 30, windowMs: 60_000 });
    if (!rl.ok) return tooManyRequests(rl);

    const apiKey = await getGroqKey();
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const trimmed = messages.slice(-14).map((m: { role: string; content: string }) => ({
      role: m.role, content: m.content,
    }));
    const lastUser = [...trimmed].reverse().find((m) => m.role === "user")?.content ?? "";
    const systemContent = buildSystemPrompt(lastUser, userName ?? null);

    const groqMessages = [{ role: "system", content: systemContent }, ...trimmed];

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
        stream: true,
        top_p: 0.85,
      }),
    });

    if (!groqRes.ok || !groqRes.body) {
      const errBody = await groqRes.text().catch(() => "");
      logger.error("Groq error:", groqRes.status, errBody);
      return NextResponse.json({ error: `Groq ${groqRes.status}` }, { status: 502 });
    }

    // Pipe the OpenAI-format SSE from Groq into plain text chunks so the
    // client can just concatenate reads. Keeps the wire format simple.
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const upstream = groqRes.body.getReader();

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await upstream.read();
        if (done) {
          controller.close();
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        // Each SSE frame: "data: {json}\n\n" (or "data: [DONE]").
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          } catch {
            // partial frame — Groq occasionally splits mid-JSON; skip and continue
          }
        }
      },
      cancel() {
        upstream.cancel().catch(() => { /* nothing to do */ });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    logger.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
