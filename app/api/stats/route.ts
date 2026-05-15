/**
 * /api/stats — public platform stats
 *
 * NOTE: InsForge SDK does not work in server-side Node.js API routes (returns 0).
 * This endpoint is kept for external consumers / homepage.
 * The admin dashboard uses adminApi.getStats() directly (client-side SDK).
 *
 * For tables without RLS (public read), the SDK works client-side.
 * For user counts with RLS, the admin dashboard uses its own client-side query.
 */
import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";

async function countAuthUsers(): Promise<number> {
  try {
    const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;
    // Fetch up to 1000 users — count the array length
    const res = await fetch(`${INSFORGE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers: { apikey: authKey, Authorization: `Bearer ${authKey}` },
    });
    if (!res.ok) return 0;
    const json = await res.json();
    // Use total field if > 0, else count the array
    const arr = Array.isArray(json) ? json : (json.users ?? []);
    const declared = json.total || json.count || 0;
    return declared > 0 ? declared : arr.length;
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      total_users,
      jobsRes, scholRes, trainRes, oppRes, campusRes,
      partnersRes, eventsRes, referralsRes, newsletterRes,
    ] = await Promise.all([
      countAuthUsers(),
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

    const c = (r: any) => r?.count ?? 0;

    return NextResponse.json({
      total_users,
      total_jobs:                  c(jobsRes),
      total_scholarships:          c(scholRes),
      total_trainings:             c(trainRes),
      total_opportunities:         c(oppRes),
      total_campus_updates:        c(campusRes),
      total_partners:              c(partnersRes),
      total_events:                c(eventsRes),
      total_referrals:             c(referralsRes),
      total_newsletter_subscribers: c(newsletterRes),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
