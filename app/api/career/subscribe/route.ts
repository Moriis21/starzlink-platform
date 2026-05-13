import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan } = await req.json();

    if (!userId || !plan) {
      return NextResponse.json({ error: "Missing userId or plan" }, { status: 400 });
    }

    if (!["monthly", "yearly"].includes(plan)) {
      return NextResponse.json({ error: "Plan must be monthly or yearly" }, { status: 400 });
    }

    const amount = plan === "monthly" ? 5 : 50;
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan === "monthly") {
      periodEnd.setDate(periodEnd.getDate() + 30);
    } else {
      periodEnd.setDate(periodEnd.getDate() + 365);
    }

    // Check if subscription already exists
    const { data: existingSub } = await insforge.database
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let subscription: any;

    if (existingSub) {
      // Update existing subscription
      const { data, error } = await insforge.database
        .from("subscriptions")
        .update({
          plan,
          status: "active",
          amount,
          currency: "USD",
          started_at: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
      }
      subscription = data;
    } else {
      // Insert new subscription
      const { data, error } = await insforge.database
        .from("subscriptions")
        .insert([{
          user_id: userId,
          plan,
          status: "active",
          amount,
          currency: "USD",
          started_at: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        }])
        .select("*")
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
      }
      subscription = data;
    }

    return NextResponse.json({ success: true, subscription });
  } catch (err: any) {
    console.error("Subscribe API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
