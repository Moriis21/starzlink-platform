import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    const { adId, eventType, pageUrl } = await req.json();
    if (!adId || !eventType) return NextResponse.json({ ok: false });

    const sessionId = req.headers.get("x-session-id") || "anon";
    const table = eventType === "click" ? "ad_clicks" : "ad_impressions";

    await insforge.database.from(table).insert({ ad_id: adId, session_id: sessionId, page_url: pageUrl || "" });

    // Increment counter on ads table
    const field = eventType === "click" ? "clicks" : "impressions";
    const { data: current } = await insforge.database.from("ads").select(field).eq("id", adId).single();
    if (current) {
      await insforge.database.from("ads").update({ [field]: ((current as any)[field] || 0) + 1 }).eq("id", adId);
    }

    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false }); }
}
