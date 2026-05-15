import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      usersRes, jobsRes, scholRes, trainRes, oppRes,
      campusRes, partnersRes, eventsRes, referralsRes, newsletterRes,
      completedProfilesRes, usersToday, usersThisMonth,
    ] = await Promise.allSettled([
      insforge.database.from("profiles").select("id", { count: "exact" }).limit(1),
      insforge.database.from("jobs").select("id", { count: "exact" }).limit(1),
      insforge.database.from("scholarships").select("id", { count: "exact" }).limit(1),
      insforge.database.from("trainings").select("id", { count: "exact" }).limit(1),
      insforge.database.from("opportunities").select("id", { count: "exact" }).limit(1),
      insforge.database.from("campus_updates").select("id", { count: "exact" }).limit(1),
      insforge.database.from("partners").select("id", { count: "exact" }).eq("is_active", true).limit(1),
      insforge.database.from("events").select("id", { count: "exact" }).limit(1),
      insforge.database.from("referrals").select("id", { count: "exact" }).limit(1),
      insforge.database.from("newsletter_subscribers").select("id", { count: "exact" }).limit(1),
      insforge.database.from("profiles").select("id", { count: "exact" }).eq("profile_completed", true).limit(1),
      insforge.database.from("profiles").select("id", { count: "exact" }).gte("created_at", todayStart).limit(1),
      insforge.database.from("profiles").select("id", { count: "exact" }).gte("created_at", monthStart).limit(1),
    ]);

    const count = (r: PromiseSettledResult<any>) =>
      r.status === "fulfilled" ? (r.value?.count ?? 0) : 0;

    const total_users = count(usersRes);
    const total_completed_profiles = count(completedProfilesRes);

    return NextResponse.json({
      total_users,
      total_jobs: count(jobsRes),
      total_scholarships: count(scholRes),
      total_trainings: count(trainRes),
      total_opportunities: count(oppRes),
      total_campus_updates: count(campusRes),
      total_partners: count(partnersRes),
      total_events: count(eventsRes),
      total_referrals: count(referralsRes),
      total_newsletter_subscribers: count(newsletterRes),
      total_completed_profiles,
      total_incomplete_profiles: Math.max(0, total_users - total_completed_profiles),
      total_users_today: count(usersToday),
      total_users_this_month: count(usersThisMonth),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
