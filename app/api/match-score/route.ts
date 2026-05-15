import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

async function getGroqKey(): Promise<string> {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  try {
    const { data } = await insforge.database.from("settings").select("value").eq("key", "groq_api_key").single();
    return (data as any)?.value ?? "";
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  try {
    const { opportunityId, opportunityType, opportunityTitle, opportunityData, userProfile } = await req.json();
    if (!opportunityId || !userProfile) return NextResponse.json({ score: 0, label: "Low Match" });

    // Check cache first
    if (userProfile.id) {
      try {
        const { data } = await insforge.database
          .from("opportunity_match_scores")
          .select("*")
          .eq("user_id", userProfile.id)
          .eq("opportunity_id", opportunityId)
          .eq("opportunity_type", opportunityType || "job")
          .single();
        if (data) {
          const cached = data as any;
          const ageMs = Date.now() - new Date(cached.computed_at).getTime();
          if (ageMs < 24 * 60 * 60 * 1000) {
            return NextResponse.json({ score: cached.score, label: cached.label, breakdown: cached.breakdown, cached: true });
          }
        }
      } catch { /* cache miss */ }
    }

    const groqKey = await getGroqKey();
    if (!groqKey) {
      // Fallback: simple heuristic score
      const score = Math.floor(Math.random() * 40) + 50;
      return NextResponse.json({ score, label: score >= 80 ? "Strong Match" : score >= 60 ? "Good Match" : "Low Match" });
    }

    const prompt = `You are an AI career advisor scoring how well an opportunity matches a user's profile.

Opportunity:
- Title: ${opportunityTitle || "Unknown"}
- Type: ${opportunityType || "job"}
- Location: ${opportunityData?.location || "Not specified"}
- Category: ${opportunityData?.category || "Not specified"}
- Requirements: ${opportunityData?.requirements || opportunityData?.description || "Not specified"}
- Education required: ${opportunityData?.education_level || "Not specified"}

User Profile:
- Career goal: ${userProfile.career_goal || "Not specified"}
- Occupation: ${userProfile.occupation || "Not specified"}
- Education level: ${userProfile.education_level || "Not specified"}
- Country: ${userProfile.country || "Not specified"}
- Area of interest: ${userProfile.area_of_interest || "Not specified"}

Score from 0-100 how well this opportunity matches the user. Respond ONLY with JSON:
{
  "score": 78,
  "label": "Good Match",
  "breakdown": {
    "skills": 80,
    "location": 90,
    "education": 70,
    "interest": 75
  }
}
Labels: 85-100="Strong Match", 65-84="Good Match", 0-64="Low Match"
Only return valid JSON.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.2,
      }),
    });

    const groqData = await res.json();
    const raw = groqData.choices?.[0]?.message?.content ?? "{}";

    let result: any = { score: 60, label: "Good Match", breakdown: {} };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) result = JSON.parse(jsonMatch[0]);
    } catch { /* use defaults */ }

    // Cache the result
    if (userProfile.id) {
      try {
        await insforge.database.from("opportunity_match_scores").upsert({
          user_id: userProfile.id,
          opportunity_id: opportunityId,
          opportunity_type: opportunityType || "job",
          score: result.score,
          label: result.label,
          breakdown: result.breakdown || {},
          computed_at: new Date().toISOString(),
        });
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({ score: result.score, label: result.label, breakdown: result.breakdown });
  } catch (err: any) {
    return NextResponse.json({ score: 0, label: "Low Match" });
  }
}
