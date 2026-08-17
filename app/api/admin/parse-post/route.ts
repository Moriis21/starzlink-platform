import { NextRequest, NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rateLimit";
import { getGroqKey } from "@/lib/getGroqKey";

export const runtime = "nodejs";

/**
 * Paste-to-parse importer.
 * Takes the raw text of a WhatsApp channel post and uses Groq to classify it
 * into one of the StarzLink content types and extract structured fields matching
 * the target InsForge table. WhatsApp Channels have no read API, so posts are
 * pasted in manually by an admin — this route only handles the parsing step.
 */


// Field schema per category — mirrors the admin "new" forms / InsForge tables.
const CATEGORY_FIELDS: Record<string, string[]> = {
  scholarship: ["title", "provider", "country", "study_level", "funding_type", "deadline", "description", "benefits", "eligibility", "required_documents", "application_link"],
  job: ["title", "company", "category", "location", "job_type", "salary", "deadline", "description", "responsibilities", "requirements", "application_link", "contact_email"],
  training: ["title", "provider", "category", "duration", "fee", "mode", "level", "location", "start_date", "description", "what_you_will_learn", "certificate_status", "instructor", "registration_link"],
  campus_update: ["title", "institution", "category", "date", "description"],
  internship: ["title", "organizer", "category", "location", "is_remote", "deadline", "description", "eligibility", "benefits", "application_link", "duration", "stipend"],
  grant: ["title", "organizer", "category", "location", "is_remote", "deadline", "description", "eligibility", "benefits", "application_link", "amount"],
  competition: ["title", "organizer", "category", "location", "is_remote", "deadline", "description", "eligibility", "benefits", "application_link", "prize", "team_size"],
  volunteer: ["title", "organizer", "category", "location", "is_remote", "deadline", "description", "eligibility", "benefits", "application_link", "commitment_hours", "duration"],
  study_abroad: ["title", "organizer", "category", "location", "is_remote", "deadline", "description", "eligibility", "benefits", "application_link", "destination_country", "duration", "amount"],
  research: ["title", "organizer", "category", "location", "is_remote", "deadline", "description", "eligibility", "benefits", "application_link", "research_field", "duration", "stipend"],
};

const CATEGORIES = Object.keys(CATEGORY_FIELDS);

function buildPrompt(text: string, today: string): string {
  const schema = CATEGORIES.map((c) => `- ${c}: ${CATEGORY_FIELDS[c].join(", ")}`).join("\n");
  return `You are an assistant that turns a raw social-media/WhatsApp post into a structured opportunity listing for the StarzLink platform.

Today's date is ${today}.

STEP 1 — Classify the post into exactly ONE category:
${CATEGORIES.join(", ")}
Guidance: use "job" for job leads/vacancies, "scholarship" for study funding, "training" for courses/workshops/certifications, "campus_update" for campus news/events/announcements. Use internship/grant/competition/volunteer/study_abroad/research when the post is clearly that specific type.

STEP 2 — Extract fields for the chosen category. Allowed fields per category:
${schema}

RULES:
- Only output fields listed for the chosen category. Leave a field as "" (empty string) if the post does not state it. Never invent facts, links, emails, or deadlines.
- "title": a concise, clear headline (max ~90 chars). Clean up ALL CAPS into title case.
- "description": a clear 2-4 sentence summary in plain English. Do not include phone numbers or "forwarded" noise here.
- Dates ("deadline", "start_date", "date"): output ISO format YYYY-MM-DD. If a year is missing, assume the next upcoming occurrence relative to today. If no date is stated, use "".
- "is_remote": boolean true/false (only for the opportunity categories that list it).
- "funding_type": one of "fully-funded", "partial", "other".
- "job_type": one of "full-time", "part-time", "contract", "internship", "remote".
- "mode": one of "online", "in-person", "hybrid".
- Links: only include a URL if it literally appears in the post.
- Also return "confidence": an integer 0-100 for how confident you are in the classification.

Respond with ONLY valid JSON in this exact shape:
{
  "category": "<one of the categories>",
  "confidence": <0-100>,
  "fields": { <only the allowed fields for that category> }
}

POST TO PARSE:
"""
${text.slice(0, 6000)}
"""`;
}

// Keep only whitelisted fields for the resolved category; coerce is_remote to bool.
function sanitize(category: string, fields: Record<string, any>): Record<string, any> {
  const allowed = CATEGORY_FIELDS[category] ?? [];
  const out: Record<string, any> = {};
  for (const key of allowed) {
    let val = fields?.[key];
    if (val === undefined || val === null) val = "";
    if (key === "is_remote") {
      out[key] = val === true || val === "true";
    } else {
      out[key] = typeof val === "string" ? val.trim() : val;
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json({ error: "Please paste the full post text (at least a few words)." }, { status: 400 });
    }

    const rl = rateLimit(req, { key: "parse-post", limit: 30, windowMs: 60_000 });
    if (!rl.ok) return tooManyRequests(rl);

    const groqKey = await getGroqKey();
    if (!groqKey) {
      return NextResponse.json(
        { error: "AI parsing is not configured. Add a GROQ_API_KEY (env or Settings) to enable it." },
        { status: 503 }
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const prompt = buildPrompt(text, today);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json({ error: `AI service error (${res.status}).`, detail: detail.slice(0, 300) }, { status: 502 });
    }

    const groqData = await res.json();
    const rawContent = groqData.choices?.[0]?.message?.content ?? "{}";

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const m = rawContent.match(/\{[\s\S]*\}/);
      if (m) {
        try { parsed = JSON.parse(m[0]); } catch { /* noop */ }
      }
    }

    let category = String(parsed.category ?? "").toLowerCase().replace(/[\s-]+/g, "_");
    if (!CATEGORIES.includes(category)) category = "job"; // safe default
    const fields = sanitize(category, parsed.fields ?? {});
    const confidence = Math.max(0, Math.min(100, Number(parsed.confidence ?? 0)));

    return NextResponse.json({ category, confidence, fields });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to parse post." }, { status: 500 });
  }
}
