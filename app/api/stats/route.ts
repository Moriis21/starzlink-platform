import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET() {
  try {
    const [
      usersRes, jobsRes, scholRes, trainRes, oppRes,
      campusRes, partnersRes, eventsRes, referralsRes, newsletterRes,
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
    ]);

    const count = (r: PromiseSettledResult<any>) =>
      r.status === "fulfilled" ? (r.value?.count ?? 0) : 0;

    return NextResponse.json({
      total_users: count(usersRes),
      total_jobs: count(jobsRes),
      total_scholarships: count(scholRes),
      total_trainings: count(trainRes),
      total_opportunities: count(oppRes),
      total_campus_updates: count(campusRes),
      total_partners: count(partnersRes),
      total_events: count(eventsRes),
      total_referrals: count(referralsRes),
      total_newsletter_subscribers: count(newsletterRes),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
