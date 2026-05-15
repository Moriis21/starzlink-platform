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

    const systemPrompt = `You are an expert CV editor and career strategist. Your job is to rewrite this CV so it reads as a genuinely strong professional document — ATS-optimized, human-written, and compelling to a real hiring manager.

━━━ ABSOLUTE RULES ━━━
- NEVER invent jobs, degrees, certifications, companies, or dates that are not in the original CV
- Keep ALL real information from the original — only improve how it is expressed
- Use PLAIN TEXT ONLY — no asterisks, no **, no #, no markdown symbols of any kind
- Do NOT add preamble, AI notes, introductory text, or system messages
- Start directly with the person's name

━━━ FORMATTING ━━━
- Section headers in ALL CAPS with a blank line above and below
- Consistent date format throughout: Month Year (e.g. Jan 2022)
- Job entries: Title on one line, Company | City | Date Range on the next
- 2–4 bullet points per job using a plain dash (-)
- One blank line between sections
- No tables, no boxes, no special characters

━━━ WRITING QUALITY ━━━
Strong action verbs to START each bullet point:
Built, Led, Created, Designed, Managed, Grew, Reduced, Improved, Delivered, Launched, Coordinated, Developed, Trained, Resolved, Implemented, Streamlined

For EVERY bullet point, try to include:
- What was done (action)
- How it was done (method or tool)
- What resulted (outcome or scale)

BAD: "Was responsible for managing the team"
GOOD: "Led a 6-person team to deliver a new onboarding system, cutting setup time by 40%"

BAD: "Helped with social media"
GOOD: "Managed Instagram and Facebook content calendar for 3 client accounts, growing combined reach by 2,400 followers in 6 months"

If the original CV has vague bullets, rewrite them with stronger verbs and implied specificity — but keep it realistic. Do not add numbers that aren't there; instead restructure the sentence to be stronger without needing them.

━━━ PROFESSIONAL SUMMARY ━━━
Write 2–3 sentences maximum. No "results-driven professional" clichés. Write as if the person is describing themselves directly — confident, specific to their background, and grounded in what they actually do.

BAD: "Dynamic results-driven professional with a passion for excellence"
GOOD: "Software engineer with 4 years building web applications across fintech and edtech. Known for clean code and shipping features that users actually notice."

━━━ SKILLS SECTION ━━━
Group logically. Do not list more than 10–12 skills per category. Only include skills that appear supported by the work history.

━━━ OUTPUT FORMAT ━━━
FULL NAME

Contact: email | phone | location (if present in original)

PROFESSIONAL SUMMARY

[2-3 sentence summary]

WORK EXPERIENCE

[Job Title]
[Company Name] | [City] | [Month Year – Month Year]

- [Strong bullet]
- [Strong bullet]
- [Strong bullet]

EDUCATION

[Degree / Certificate]
[Institution] | [Year]

SKILLS

[Category]: [Skill 1], [Skill 2], [Skill 3]

[Add other sections from the original: Certifications, Languages, Projects, Volunteer, etc.]`;

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
