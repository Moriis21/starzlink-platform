import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

const BASE = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://8qn72bza.us-east.insforge.app";
const KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "ik_6d6c0108a931deb33707cad6a802a9ed";

async function restQuery(table: string, params: Record<string, string>) {
  const url = new URL(`${BASE}/rest/v1/${table}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { "apikey": KEY, "Authorization": `Bearer ${KEY}`, "Accept": "application/json" },
  });
  return res.ok ? res.json() : [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const period = searchParams.get("period") || "7d";
    const type = searchParams.get("type") || "all";

    // Calculate date range
    const now = new Date();
    let fromDate = new Date();
    if (period === "1d") fromDate.setDate(now.getDate() - 1);
    else if (period === "7d") fromDate.setDate(now.getDate() - 7);
    else if (period === "30d") fromDate.setDate(now.getDate() - 30);
    else fromDate.setDate(now.getDate() - 7);

    const fromISO = fromDate.toISOString();

    // Fetch activity events
    let q = insforge.database
      .from("user_activity_events")
      .select("*")
      .gte("created_at", fromISO)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (type !== "all") q = q.eq("opportunity_type", type);

    const { data: events } = await q;
    const evts = (events || []) as any[];

    // Most viewed opportunities
    const viewMap: Record<string, { title: string; type: string; count: number }> = {};
    const saveMap: Record<string, { title: string; type: string; count: number }> = {};
    const applyMap: Record<string, { title: string; type: string; count: number }> = {};
    const keywordMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};
    const activeUsers = new Set<string>();
    const dailyViews: Record<string, number> = {};
    const dailySaves: Record<string, number> = {};
    const dailyApplies: Record<string, number> = {};

    for (const e of evts) {
      if (e.user_id) activeUsers.add(e.user_id);
      const day = e.created_at?.slice(0, 10);

      if (e.event_type === "view" && e.opportunity_id) {
        const key = e.opportunity_id;
        if (!viewMap[key]) viewMap[key] = { title: e.opportunity_title || key, type: e.opportunity_type || "", count: 0 };
        viewMap[key].count++;
        if (day) dailyViews[day] = (dailyViews[day] || 0) + 1;
      }
      if (e.event_type === "save" && e.opportunity_id) {
        const key = e.opportunity_id;
        if (!saveMap[key]) saveMap[key] = { title: e.opportunity_title || key, type: e.opportunity_type || "", count: 0 };
        saveMap[key].count++;
        if (day) dailySaves[day] = (dailySaves[day] || 0) + 1;
      }
      if (e.event_type === "apply" && e.opportunity_id) {
        const key = e.opportunity_id;
        if (!applyMap[key]) applyMap[key] = { title: e.opportunity_title || key, type: e.opportunity_type || "", count: 0 };
        applyMap[key].count++;
        if (day) dailyApplies[day] = (dailyApplies[day] || 0) + 1;
      }
      if (e.event_type === "search" && e.keyword) {
        keywordMap[e.keyword] = (keywordMap[e.keyword] || 0) + 1;
      }
      if (e.category) {
        categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
      }
    }

    const top = (map: typeof viewMap) =>
      Object.entries(map).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([id, v]) => ({ id, ...v }));

    const topKeywords = Object.entries(keywordMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([kw, count]) => ({ keyword: kw, count }));
    const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, count]) => ({ category: cat, count }));

    // Build daily trend (last 7 or 30 days)
    const days = period === "30d" ? 30 : 7;
    const trend = Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const day = d.toISOString().slice(0, 10);
      return {
        date: day,
        views: dailyViews[day] || 0,
        saves: dailySaves[day] || 0,
        applies: dailyApplies[day] || 0,
      };
    });

    return NextResponse.json({
      totalEvents: evts.length,
      activeUsers: activeUsers.size,
      mostViewed: top(viewMap),
      mostSaved: top(saveMap),
      mostApplied: top(applyMap),
      topKeywords,
      topCategories,
      trend,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
