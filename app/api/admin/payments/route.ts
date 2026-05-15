import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const page = Number(searchParams.get("page") || 1);
    const search = searchParams.get("search") || "";
    const limit = 20;
    const from = (page - 1) * limit;

    // Step 1 — fetch payments (no join, avoids FK dependency)
    let q = insforge.database
      .from("payments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (status === "pending") {
      q = q.eq("admin_approval_status", "pending");
    } else if (status === "approved") {
      q = q.eq("admin_approval_status", "approved");
    } else if (status === "rejected") {
      q = q.eq("admin_approval_status", "rejected");
    }

    const { data: payments, error, count } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = payments ?? [];

    // Step 2 — fetch profiles for all unique user_ids in this page
    const userIds = [...new Set(rows.map((p: any) => p.user_id).filter(Boolean))];
    let profileMap: Record<string, { full_name: string; email: string }> = {};

    if (userIds.length > 0) {
      // Try direct REST API with service key first (bypasses RLS), fall back to SDK
      const serviceKey = process.env.INSFORGE_SERVICE_KEY;
      if (serviceKey) {
        try {
          const res = await fetch(
            `https://8qn72bza.us-east.insforge.app/rest/v1/profiles?select=id,full_name,email&id=in.(${userIds.join(",")})`,
            { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
          );
          if (res.ok) {
            const profiles = await res.json();
            (profiles as any[]).forEach((p: any) => { profileMap[p.id] = { full_name: p.full_name, email: p.email }; });
          }
        } catch {}
      }

      // SDK fallback (works if RLS is not blocking admin reads)
      if (Object.keys(profileMap).length === 0) {
        const { data: profiles } = await insforge.database
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds as string[]);
        (profiles ?? []).forEach((p: any) => { profileMap[p.id] = { full_name: p.full_name, email: p.email }; });
      }
    }

    // Step 3 — merge profiles into payments
    const merged = rows.map((p: any) => ({
      ...p,
      profiles: profileMap[p.user_id] ?? { full_name: "Unknown User", email: p.user_id ?? "" },
    }));

    // Optional search filter on merged data
    const filtered = search
      ? merged.filter((p: any) =>
          p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          p.profiles?.email?.toLowerCase().includes(search.toLowerCase())
        )
      : merged;

    return NextResponse.json({ payments: filtered, total: count ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, paymentId, adminId, rejectionReason } = body;

    if (!action || !paymentId || !adminId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { data: payment } = await insforge.database
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    const p = payment as any;

    if (action === "approve") {
      // Update payment
      await insforge.database.from("payments").update({
        admin_approval_status: "approved",
        payment_status: "verified",
        approved_by_admin_id: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", paymentId);

      // Grant Pro access based on plan
      if (p.payment_type === "subscription") {
        const days = p.item_type === "pro_yearly" ? 365 : 30;
        const expiry = new Date(Date.now() + days * 86400000).toISOString();
        const plan = p.item_type === "pro_yearly" ? "yearly" : "monthly";

        await insforge.database.from("subscriptions").upsert([{
          user_id: p.user_id,
          plan,
          status: "active",
          amount: p.amount,
          currency: p.currency,
          started_at: new Date().toISOString(),
          current_period_end: expiry,
          updated_at: new Date().toISOString(),
        }], { onConflict: "user_id" });
      }

      // Unlock resource if resource purchase
      if (p.payment_type === "resource_purchase") {
        await insforge.database
          .from("resource_purchases")
          .update({
            access_status: "unlocked",
            approved_by_admin_id: adminId,
            approved_at: new Date().toISOString(),
          })
          .eq("payment_id", paymentId);
      }

      return NextResponse.json({ success: true, action: "approved" });
    } else if (action === "reject") {
      await insforge.database.from("payments").update({
        admin_approval_status: "rejected",
        payment_status: "rejected",
        rejected_by_admin_id: adminId,
        rejected_at: new Date().toISOString(),
        rejection_reason: rejectionReason || "Payment could not be verified.",
        updated_at: new Date().toISOString(),
      }).eq("id", paymentId);

      // Set resource purchase back to locked
      if (p.payment_type === "resource_purchase") {
        await insforge.database
          .from("resource_purchases")
          .update({ access_status: "locked" })
          .eq("payment_id", paymentId);
      }

      return NextResponse.json({ success: true, action: "rejected" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
