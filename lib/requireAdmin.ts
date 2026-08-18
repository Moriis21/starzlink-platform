import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { log } from "@/lib/log";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const logger = log("auth.requireAdmin");

export type AdminRole = "admin" | "super_admin";
export type AdminUser = { id: string; email: string; role: AdminRole };

type Success = { ok: true; user: AdminUser };
type Failure = { ok: false; response: NextResponse };
export type AdminCheck = Success | Failure;

async function loadRole(userId: string): Promise<AdminUser | null> {
  try {
    const { data } = await insforge.database
      .from("profiles")
      .select("id, email, role")
      .eq("id", userId)
      .single();
    const p = data as { id?: string; email?: string; role?: string } | null;
    if (!p?.id || (p.role !== "admin" && p.role !== "super_admin")) return null;
    return { id: p.id, email: p.email ?? "", role: p.role as AdminRole };
  } catch (err) {
    logger.error("profile lookup failed", err);
    return null;
  }
}

/**
 * Verify the caller is an admin.
 *
 * Preferred path: `Authorization: Bearer <session-token>` — validated against
 * InsForge's session endpoint, then role checked in the profiles table.
 *
 * Transitional path: `adminId` in the request body (or ?adminId= for GETs).
 * Only the role is checked, not the caller's identity — this closes the
 * "attacker fabricates a userId" hole but does not prove the caller *is*
 * that admin. Present so we can migrate admin UI to Bearer tokens without
 * a big-bang change. A warning is logged whenever this path fires.
 *
 * Returns `{ok:true, user}` on success; `{ok:false, response}` on failure.
 * Callers should `if (!check.ok) return check.response;` and use `check.user`.
 */
export async function requireAdmin(
  req: NextRequest,
  legacyAdminId?: string | null
): Promise<AdminCheck> {
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;

  if (bearer) {
    try {
      const res = await fetch(`${INSFORGE_URL}/api/auth/sessions/current`, {
        headers: { Authorization: `Bearer ${bearer}` },
      });
      if (!res.ok) {
        return { ok: false, response: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
      }
      const body = (await res.json()) as { user?: { id?: string } };
      const userId = body.user?.id;
      if (!userId) {
        return { ok: false, response: NextResponse.json({ error: "Invalid session" }, { status: 401 }) };
      }
      const user = await loadRole(userId);
      if (!user) {
        return { ok: false, response: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
      }
      return { ok: true, user };
    } catch (err) {
      logger.error("bearer verify failed", err);
      return { ok: false, response: NextResponse.json({ error: "Auth check failed" }, { status: 500 }) };
    }
  }

  if (legacyAdminId) {
    logger.warn("admin route used legacy adminId path — migrate caller to Bearer token", { adminId: legacyAdminId });
    const user = await loadRole(legacyAdminId);
    if (!user) {
      return { ok: false, response: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
    }
    return { ok: true, user };
  }

  return { ok: false, response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
}
