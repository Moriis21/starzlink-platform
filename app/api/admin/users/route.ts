import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";

/**
 * Fetch ALL users from InsForge using the Auth Admin API.
 * This bypasses RLS entirely — the same endpoint the delete button already uses.
 * Falls back to profiles table REST API, then SDK as last resort.
 */
async function fetchAllUsers(search: string, page: number, limit: number) {
  const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;

  // Strategy 1: InsForge Auth Admin Users list (bypasses RLS completely)
  try {
    const res = await fetch(`${INSFORGE_URL}/auth/v1/admin/users?page=${page}&per_page=${limit}`, {
      headers: {
        apikey: authKey,
        Authorization: `Bearer ${authKey}`,
      },
    });

    if (res.ok) {
      const json = await res.json();
      // InsForge auth admin returns { users: [...], aud: "..." } or just an array
      const authUsers: any[] = Array.isArray(json) ? json : (json.users ?? []);

      if (authUsers.length > 0 || page === 1) {
        // Fetch profiles for all these user IDs to get role/user_type/phone
        const ids = authUsers.map((u: any) => u.id).filter(Boolean);
        let profileMap: Record<string, any> = {};

        if (ids.length > 0) {
          const pRes = await fetch(
            `${INSFORGE_URL}/rest/v1/profiles?select=id,full_name,email,role,user_type,phone,is_suspended,avatar_url,created_at,profile_completed&id=in.(${ids.join(",")})`,
            { headers: { apikey: authKey, Authorization: `Bearer ${authKey}` } }
          );
          if (pRes.ok) {
            const profiles = await pRes.json();
            (Array.isArray(profiles) ? profiles : []).forEach((p: any) => {
              profileMap[p.id] = p;
            });
          }
        }

        // Merge auth user data with profile data
        let merged = authUsers.map((u: any) => {
          const profile = profileMap[u.id] ?? {};
          return {
            id: u.id,
            full_name: profile.full_name ?? u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "Unknown",
            email: u.email ?? profile.email ?? "",
            phone: profile.phone ?? u.phone ?? "",
            role: profile.role ?? "user",
            user_type: profile.user_type ?? "student",
            is_suspended: profile.is_suspended ?? false,
            avatar_url: profile.avatar_url ?? u.user_metadata?.avatar_url ?? "",
            created_at: u.created_at ?? profile.created_at,
            profile_completed: profile.profile_completed ?? false,
          };
        });

        // Apply search filter
        if (search) {
          const q = search.toLowerCase();
          merged = merged.filter(u =>
            u.full_name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.phone?.toLowerCase().includes(q)
          );
        }

        // Use || not ?? so a zero total from InsForge falls back to actual array length
        const total = (json.total || json.count) || merged.length;
        return { users: merged, total };
      }
    }
  } catch (e) {
    console.error("Auth admin users fetch failed:", e);
  }

  // Strategy 2: Direct REST API on profiles table with service key
  try {
    const params = new URLSearchParams({
      select: "id,full_name,email,phone,role,user_type,is_suspended,avatar_url,created_at,profile_completed",
      order: "created_at.desc",
      limit: String(limit),
      offset: String((page - 1) * limit),
    });
    if (search) params.set("or", `(full_name.ilike.*${search}*,email.ilike.*${search}*)`);

    const res = await fetch(`${INSFORGE_URL}/rest/v1/profiles?${params}`, {
      headers: {
        apikey: authKey,
        Authorization: `Bearer ${authKey}`,
        Prefer: "count=exact",
      },
    });

    if (res.ok) {
      const users = await res.json();
      const contentRange = res.headers.get("content-range");
      const total = contentRange ? parseInt(contentRange.split("/")[1] || "0") : (Array.isArray(users) ? users.length : 0);
      return { users: Array.isArray(users) ? users : [], total };
    }
  } catch (e) {
    console.error("REST profiles fetch failed:", e);
  }

  // Strategy 3: InsForge SDK (limited by RLS — returns only current user's row)
  try {
    let q = insforge.database
      .from("profiles")
      .select("id,full_name,email,phone,role,user_type,is_suspended,avatar_url,created_at,profile_completed", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, count } = await q;
    return { users: data ?? [], total: count ?? 0 };
  } catch {
    return { users: [], total: 0 };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Number(searchParams.get("limit") || 15));
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";
    const statusFilter = searchParams.get("status") || "";
    const profileFilter = searchParams.get("profile") || "";

    let { users, total } = await fetchAllUsers(search, page, limit);

    // Apply role / status filters after fetch
    if (roleFilter) users = users.filter((u: any) => u.role === roleFilter);
    if (statusFilter === "suspended") users = users.filter((u: any) => u.is_suspended === true);
    if (statusFilter === "active") users = users.filter((u: any) => !u.is_suspended);
    if (profileFilter === "complete") users = users.filter((u: any) => u.profile_completed === true);
    if (profileFilter === "incomplete") users = users.filter((u: any) => !u.profile_completed);

    return NextResponse.json({ users, total });
  } catch (err: any) {
    console.error("Admin users API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
