import { insforge } from "./insforge";

export async function checkProAccess(userId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const [subRes, grantRes] = await Promise.all([
    insforge.database.from("subscriptions").select("status,current_period_end").eq("user_id", userId).maybeSingle(),
    insforge.database.from("admin_pro_grants").select("is_active,expiry_date,plan_type")
      .eq("user_id", userId).eq("is_active", true).maybeSingle(),
  ]);
  const isPaidPro = subRes.data?.status === "active" && subRes.data?.current_period_end > now;
  const isManualPro = grantRes.data?.is_active && (!grantRes.data.expiry_date || grantRes.data.expiry_date > now);
  const isLifetime = grantRes.data?.plan_type === "pro_lifetime" && grantRes.data?.is_active;
  return isPaidPro || isManualPro || isLifetime;
}
