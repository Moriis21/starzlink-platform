import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";

/** Count rows using InsForge SDK — works for public tables */
async function sdkCount(table: string, filters?: (q: any) => any): Promise<number> {
  try {
    let q = insforge.database.from(table).select("id", { count: "exact" }).limit(1);
    if (filters) q = filters(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Count all auth users via InsForge admin API — bypasses RLS entirely */
async function countAuthUsers(): Promise<number> {
  try {
    const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;
    const res = await fetch(`${INSFORGE_URL}/auth/v1/admin/users?per_page=1`, {
      headers: { apikey: authKey, Authorization: `Bearer ${authKey}` },
    });
    if (!res.ok) return 0;
    const json = await res.json();
    // InsForge returns { total: N, users: [...] } or { count: N }
    if (json.total !== undefined) return json.total;
    if (json.count !== undefined) return json.count;
    // Fallback: parse from another page fetch
    const res2 = await fetch(`${INSFORGE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers: { apikey: authKey, Authorization: `Bearer ${authKey}` },
    });
    if (!res2.ok) return 0;
    const j2 = await res2.json();
    const users = Array.isArray(j2) ? j2 : (j2.users ?? []);
    return users.length;
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Run all counts in parallel
    const [
      total_users,
      total_jobs,
      total_scholarships,
      total_trainings,
      total_opportunities,
      total_campus_updates,
      total_partners,
      total_events,
      total_referrals,
      total_newsletter_subscribers,
      total_completed_profiles,
      total_users_today,
      total_users_this_month,
    ] = await Promise.all([
      // Use auth admin API for accurate user count (bypasses profiles RLS)
      countAuthUsers(),
      // SDK counts for public tables — these work with anon key
      sdkCount("jobs"),
      sdkCount("scholarships"),
      sdkCount("trainings"),
      sdkCount("opportunities"),
      sdkCount("campus_updates"),
      sdkCount("partners", q => q.eq("is_active", true)),
      sdkCount("events"),
      sdkCount("referrals"),
      sdkCount("newsletter_subscribers"),
      sdkCount("profiles", q => q.eq("profile_completed", true)),
      sdkCount("profiles", q => q.gte("created_at", todayStart)),
      sdkCount("profiles", q => q.gte("created_at", monthStart)),
    ]);

    return NextResponse.json({
      total_users,
      total_jobs,
      total_scholarships,
      total_trainings,
      total_opportunities,
      total_campus_updates,
      total_partners,
      total_events,
      total_referrals,
      total_newsletter_subscribers,
      total_completed_profiles,
      total_incomplete_profiles: Math.max(0, total_users - total_completed_profiles),
      total_users_today,
      total_users_this_month,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
