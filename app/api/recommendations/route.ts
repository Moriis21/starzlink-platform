import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = Number(searchParams.get("limit") || 6);

    if (!userId) return NextResponse.json({ recommendations: [] });

    // Get user profile to personalize
    const { data: profile } = await insforge.database
      .from("profiles")
      .select("area_of_interest, user_type, country, occupation, education_level")
      .eq("id", userId)
      .maybeSingle();

    const p = profile as any;
    const area = p?.area_of_interest || "";
    const userType = p?.user_type || "student";
    const country = p?.country || "";

    // Build keyword from area of interest
    const keyword = area ? area.split(" & ")[0].split(" / ")[0].trim() : "";

    const results: any[] = [];

    // Fetch matching scholarships
    try {
      let q = insforge.database.from("scholarships")
        .select("id, title, provider, deadline, funding_type, country, study_level")
        .eq("status", "active").limit(3);
      if (keyword) q = q.ilike("title", `%${keyword}%`);
      const { data } = await q;
      (data || []).forEach((r: any) => results.push({ ...r, _type: "scholarship", _href: `/opportunities/scholarships/${r.id}`, _label: "SCHOLARSHIP", _color: "bg-purple-100 text-purple-700" }));
    } catch {}

    // Fetch matching jobs
    try {
      let q = insforge.database.from("jobs")
        .select("id, title, company, deadline, job_type, location")
        .eq("status", "active").limit(3);
      if (keyword) q = q.ilike("title", `%${keyword}%`);
      const { data } = await q;
      (data || []).forEach((r: any) => results.push({ ...r, _type: "job", _href: `/opportunities/jobs/${r.id}`, _label: "JOB", _color: "bg-blue-100 text-blue-700" }));
    } catch {}

    // Fetch matching trainings
    try {
      const { data } = await insforge.database.from("trainings")
        .select("id, title, organizer, deadline, mode, level")
        .eq("status", "active").limit(2);
      (data || []).forEach((r: any) => results.push({ ...r, _type: "training", _href: `/trainings/${r.id}`, _label: "TRAINING", _color: "bg-orange-100 text-orange-700" }));
    } catch {}

    // Shuffle and limit
    const shuffled = results.sort(() => Math.random() - 0.5).slice(0, limit);

    return NextResponse.json({ recommendations: shuffled, profile: { area, userType, country } });
  } catch (err: any) {
    return NextResponse.json({ recommendations: [], error: err.message });
  }
}
