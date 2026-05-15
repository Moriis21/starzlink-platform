import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";

/** Fetch user profiles by IDs — tries REST API (bypasses RLS), falls back to SDK */
async function fetchProfilesByIds(ids: string[]): Promise<Record<string, any>> {
  if (ids.length === 0) return {};
  const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;
  const map: Record<string, any> = {};

  // Strategy 1: REST API (service key bypasses RLS)
  try {
    const res = await fetch(
      `${INSFORGE_URL}/rest/v1/profiles?select=id,full_name,email,phone,avatar_url&id=in.(${ids.join(",")})`,
      { headers: { apikey: authKey, Authorization: `Bearer ${authKey}` } }
    );
    if (res.ok) {
      const profiles = await res.json();
      (Array.isArray(profiles) ? profiles : []).forEach((p: any) => { map[p.id] = p; });
      if (Object.keys(map).length > 0) return map;
    }
  } catch {}

  // Strategy 2: Auth admin API — get user emails from auth system
  try {
    const res = await fetch(`${INSFORGE_URL}/auth/v1/admin/users?per_page=1000`, {
      headers: { apikey: authKey, Authorization: `Bearer ${authKey}` },
    });
    if (res.ok) {
      const json = await res.json();
      const users: any[] = Array.isArray(json) ? json : (json.users ?? []);
      users.filter((u: any) => ids.includes(u.id)).forEach((u: any) => {
        map[u.id] = {
          id: u.id,
          full_name: u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "User",
          email: u.email ?? "",
          phone: u.phone ?? "",
          avatar_url: u.user_metadata?.avatar_url ?? "",
        };
      });
      if (Object.keys(map).length > 0) return map;
    }
  } catch {}

  // Strategy 3: SDK fallback
  try {
    const { data } = await insforge.database
      .from("profiles").select("id,full_name,email,phone,avatar_url").in("id", ids);
    (data ?? []).forEach((p: any) => { map[p.id] = p; });
  } catch {}

  return map;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const search = searchParams.get("search") || "";
    const limit = 20;
    const from = (page - 1) * limit;

    // Step 1 — Fetch payments
    let q = insforge.database
      .from("payments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (status !== "all") {
      if (status === "pending") q = q.eq("admin_approval_status", "pending");
      else if (status === "approved") q = q.eq("admin_approval_status", "approved");
      else if (status === "rejected") q = q.eq("admin_approval_status", "rejected");
      else if (status === "failed") q = q.eq("payment_status", "failed");
    }

    const { data: payments, error, count } = await q;
    if (error) {
      console.error("Payments fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (payments ?? []) as any[];

    // Step 2 — Fetch profiles for all unique user_ids
    const userIds = [...new Set(rows.map((p: any) => p.user_id).filter(Boolean))] as string[];
    const profileMap = await fetchProfilesByIds(userIds);

    // Step 3 — Merge and build final list
    let merged = rows.map((p: any) => {
      const profile = profileMap[p.user_id];
      return {
        ...p,
        profiles: profile
          ? {
              full_name: profile.full_name || "Unknown User",
              email: profile.email || "",
              phone: profile.phone || "",
              avatar_url: profile.avatar_url || "",
            }
          : {
              full_name: "Profile Missing",
              email: `User ID: ${(p.user_id || "").slice(0, 12)}…`,
              phone: "",
              avatar_url: "",
            },
      };
    });

    // Apply search filter on merged data
    if (search) {
      const q = search.toLowerCase();
      merged = merged.filter((p: any) =>
        p.profiles?.full_name?.toLowerCase().includes(q) ||
        p.profiles?.email?.toLowerCase().includes(q) ||
        p.transaction_reference?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ payments: merged, total: count ?? 0 });
  } catch (err: any) {
    console.error("Admin payments GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, paymentId, adminId, rejectionReason } = body;

    if (!action || !paymentId || !adminId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: payment, error: fetchErr } = await insforge.database
      .from("payments").select("*").eq("id", paymentId).single();

    if (fetchErr || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const p = payment as any;

    if (action === "approve") {
      await insforge.database.from("payments").update({
        admin_approval_status: "approved",
        payment_status: "verified",
        approved_by_admin_id: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", paymentId);

      // Grant Pro subscription
      if (p.payment_type === "subscription") {
        const days = p.item_type === "pro_yearly" ? 365 : 30;
        const expiry = new Date(Date.now() + days * 86400000).toISOString();
        const plan = p.item_type === "pro_yearly" ? "yearly" : "monthly";

        await insforge.database.from("subscriptions").upsert([{
          user_id: p.user_id,
          plan,
          status: "active",
          amount: p.amount,
          currency: p.currency || "USD",
          started_at: new Date().toISOString(),
          current_period_end: expiry,
          updated_at: new Date().toISOString(),
        }], { onConflict: "user_id" });
      }

      // Unlock resource purchase
      if (p.payment_type === "resource_purchase") {
        await insforge.database.from("resource_purchases").update({
          access_status: "unlocked",
          approved_by_admin_id: adminId,
          approved_at: new Date().toISOString(),
        }).eq("payment_id", paymentId);
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

      if (p.payment_type === "resource_purchase") {
        await insforge.database.from("resource_purchases")
          .update({ access_status: "locked" }).eq("payment_id", paymentId);
      }

      return NextResponse.json({ success: true, action: "rejected" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin payments POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
