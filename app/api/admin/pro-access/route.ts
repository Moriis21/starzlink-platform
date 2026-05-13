import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const limit = Number(searchParams.get("limit") ?? 20);

    // Fetch profiles + join with grants and subscriptions
    let q = insforge.database.from("profiles").select(`
      id, full_name, email, role, user_type, created_at,
      admin_pro_grants!left(id, plan_type, access_type, start_date, expiry_date, is_active, admin_note, granted_by_admin_id, created_at),
      subscriptions!left(plan, status, current_period_end)
    `).limit(limit);

    if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ users: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userIds, adminId, planType, durationDays, expiryDate, note } = body;

    if (!action || !userIds?.length || !adminId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const results = [];

    for (const userId of userIds) {
      // Get current grant for audit log
      const { data: currentGrant } = await insforge.database
        .from("admin_pro_grants").select("*")
        .eq("user_id", userId).eq("is_active", true).maybeSingle();

      if (action === "grant" || action === "extend") {
        // Deactivate any existing grant
        await insforge.database.from("admin_pro_grants")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("user_id", userId).eq("is_active", true);

        // Calculate expiry
        let expiry: string | null = null;
        if (planType !== "pro_lifetime") {
          if (expiryDate) {
            expiry = new Date(expiryDate).toISOString();
          } else if (durationDays) {
            expiry = new Date(Date.now() + durationDays * 86400000).toISOString();
          }
        }

        // Create new grant
        const { data: newGrant } = await insforge.database.from("admin_pro_grants").insert([{
          user_id: userId,
          granted_by_admin_id: adminId,
          plan_type: planType === "pro_lifetime" ? "pro_lifetime" : "pro_manual",
          access_type: planType === "pro_lifetime" ? "lifetime" : "manual",
          start_date: new Date().toISOString(),
          expiry_date: expiry,
          is_active: true,
          admin_note: note ?? null,
        }]).select("id").single();

        // Audit log
        await insforge.database.from("pro_access_audit_logs").insert([{
          admin_id: adminId,
          user_id: userId,
          action: action,
          old_plan: (currentGrant as any)?.plan_type ?? "free",
          new_plan: planType === "pro_lifetime" ? "pro_lifetime" : "pro_manual",
          old_expiry_date: (currentGrant as any)?.expiry_date ?? null,
          new_expiry_date: expiry,
          note: note ?? null,
        }]);

        results.push({ userId, success: true, grantId: (newGrant as any)?.id });

      } else if (action === "revoke") {
        await insforge.database.from("admin_pro_grants")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("user_id", userId).eq("is_active", true);

        await insforge.database.from("pro_access_audit_logs").insert([{
          admin_id: adminId,
          user_id: userId,
          action: "revoke",
          old_plan: (currentGrant as any)?.plan_type ?? "pro_manual",
          new_plan: "free",
          old_expiry_date: (currentGrant as any)?.expiry_date ?? null,
          new_expiry_date: null,
          note: note ?? null,
        }]);

        results.push({ userId, success: true });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
