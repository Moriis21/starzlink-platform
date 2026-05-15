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
    const { opportunityId, opportunityType, opportunityTitle, requirements, userSkills, userId } = await req.json();
    if (!requirements) return NextResponse.json({ error: "Missing requirements" }, { status: 400 });

    const groqKey = await getGroqKey();
    if (!groqKey) return NextResponse.json({ error: "AI unavailable" }, { status: 503 });

    const userSkillsList = (userSkills || []).join(", ") || "No skills listed";
    const prompt = `You are a career coach analyzing skill gaps for a job or scholarship opportunity.

Opportunity: "${opportunityTitle || "Unknown"}" (${opportunityType || "job"})
Requirements text: "${requirements}"
User's current skills: ${userSkillsList}

Analyze and respond ONLY with a valid JSON object exactly like this:
{
  "required_skills": ["skill1", "skill2", "skill3"],
  "missing_skills": ["skill1", "skill2"],
  "match_percentage": 65,
  "recommendations": [
    {"skill": "skill1", "resource": "Course/tutorial name", "url": "https://...", "type": "course"},
    {"skill": "skill2", "resource": "YouTube tutorial", "url": "https://youtube.com/results?search_query=skill2+tutorial", "type": "youtube"}
  ]
}

Rules:
- Extract 3-8 key required skills from the requirements text
- Compare against user skills to find gaps
- Calculate match percentage (0-100) based on skills matched
- For each missing skill, recommend ONE free resource (Coursera, YouTube, Khan Academy, etc.)
- Keep skill names short (2-4 words max)
- Only return valid JSON, no extra text`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    const groqData = await res.json();
    const raw = groqData.choices?.[0]?.message?.content ?? "{}";

    let analysis: any = {};
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch { analysis = {}; }

    // Save to DB if user is logged in
    if (userId) {
      try {
        await insforge.database.from("skill_gap_analyses").upsert({
          user_id: userId,
          opportunity_id: opportunityId,
          opportunity_type: opportunityType || "job",
          opportunity_title: opportunityTitle,
          user_skills: userSkills || [],
          required_skills: analysis.required_skills || [],
          missing_skills: analysis.missing_skills || [],
          match_percentage: analysis.match_percentage || 0,
          recommendations: analysis.recommendations || [],
        });
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
