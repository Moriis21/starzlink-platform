import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, opportunity_id, opportunity_type, opportunity_title, keyword, category, country, user_id, metadata } = body;

    if (!event_type) return NextResponse.json({ ok: false });

    const sessionId = req.headers.get("x-session-id") || crypto.randomUUID();

    await insforge.database.from("user_activity_events").insert({
      user_id: user_id || null,
      session_id: sessionId,
      event_type,
      opportunity_id: opportunity_id || null,
      opportunity_type: opportunity_type || null,
      opportunity_title: opportunity_title || null,
      keyword: keyword || null,
      category: category || null,
      country: country || null,
      metadata: metadata || {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
