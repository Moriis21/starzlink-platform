import { NextResponse } from "next/server";

export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";

/** Count rows in a table via REST API — bypasses RLS for real counts */
async function countTable(
  table: string,
  filter?: string,
  authKey = ANON_KEY
): Promise<number> {
  try {
    const url = filter
      ? `${INSFORGE_URL}/rest/v1/${table}?${filter}&select=id`
      : `${INSFORGE_URL}/rest/v1/${table}?select=id`;

    const res = await fetch(url, {
      headers: {
        apikey: authKey,
        Authorization: `Bearer ${authKey}`,
        Prefer: "count=exact",
        "Range-Unit": "items",
        Range: "0-0", // fetch only 1 row — we only need the count header
      },
    });

    if (!res.ok) return 0;

    // Count comes from Content-Range header: "0-0/42" → 42
    const range = res.headers.get("content-range");
    if (range) {
      const total = range.split("/")[1];
      if (total && total !== "*") return parseInt(total, 10);
    }

    // Fallback: count array length
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      .toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString();

    // Run all counts in parallel via REST API (bypasses RLS — real counts)
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
      countTable("profiles", undefined, authKey),
      countTable("jobs", undefined, authKey),
      countTable("scholarships", undefined, authKey),
      countTable("trainings", undefined, authKey),
      countTable("opportunities", undefined, authKey),
      countTable("campus_updates", undefined, authKey),
      countTable("partners", "is_active=eq.true", authKey),
      countTable("events", undefined, authKey),
      countTable("referrals", undefined, authKey),
      countTable("newsletter_subscribers", undefined, authKey),
      countTable("profiles", "profile_completed=eq.true", authKey),
      countTable("profiles", `created_at=gte.${todayStart}`, authKey),
      countTable("profiles", `created_at=gte.${monthStart}`, authKey),
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
