import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// GET: user's deadline alerts
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ alerts: [] });

    const { data } = await insforge.database.from("deadline_alerts").select("*").eq("user_id", userId).eq("is_active", true).order("deadline");
    return NextResponse.json({ alerts: data || [] });
  } catch { return NextResponse.json({ alerts: [] }); }
}

// POST: create or update alert
export async function POST(req: NextRequest) {
  try {
    const { userId, opportunityId, opportunityType, opportunityTitle, deadline, alertDays } = await req.json();
    if (!userId || !opportunityId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const { data: existing } = await insforge.database.from("deadline_alerts").select("id").eq("user_id", userId).eq("opportunity_id", opportunityId).single();

    if (existing) {
      await insforge.database.from("deadline_alerts").update({
        alert_days: alertDays || [7, 3, 1],
        is_active: true,
        deadline,
      }).eq("id", (existing as any).id);
    } else {
      await insforge.database.from("deadline_alerts").insert({
        user_id: userId,
        opportunity_id: opportunityId,
        opportunity_type: opportunityType || "general",
        opportunity_title: opportunityTitle || "",
        deadline,
        alert_days: alertDays || [7, 3, 1],
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: remove alert
export async function DELETE(req: NextRequest) {
  try {
    const { userId, opportunityId } = await req.json();
    await insforge.database.from("deadline_alerts").update({ is_active: false }).eq("user_id", userId).eq("opportunity_id", opportunityId);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ ok: false }); }
}
