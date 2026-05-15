import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 15);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const from = (page - 1) * limit;

    // Use service key if available (bypasses RLS), else fall back to anon key
    const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;

    // Build query string for InsForge REST API
    const params = new URLSearchParams();
    params.set("select", "*");
    params.set("order", "created_at.desc");
    params.set("limit", String(limit));
    params.set("offset", String(from));

    if (search) {
      params.set("or", `(full_name.ilike.*${search}*,email.ilike.*${search}*)`);
    }
    if (role) params.set("role", `eq.${role}`);
    if (status === "suspended") params.set("is_suspended", "eq.true");
    if (status === "active") params.set("is_suspended", "neq.true");

    const res = await fetch(
      `${INSFORGE_URL}/rest/v1/profiles?${params.toString()}`,
      {
        headers: {
          apikey: authKey,
          Authorization: `Bearer ${authKey}`,
          Prefer: "count=exact",
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("InsForge REST users error:", res.status, errText);
      // Fall back to SDK query
      return await sdkFallback(from, limit, search, role, status);
    }

    const users = await res.json();
    const contentRange = res.headers.get("content-range"); // e.g. "0-14/42"
    const total = contentRange ? parseInt(contentRange.split("/")[1] || "0") : users.length;

    return NextResponse.json({ users, total });
  } catch (err: any) {
    console.error("Admin users API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// SDK fallback (may be limited by RLS but better than nothing)
async function sdkFallback(from: number, limit: number, search: string, role: string, status: string) {
  try {
    let q = insforge.database
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    if (role) q = q.eq("role", role);
    if (status === "suspended") q = q.eq("is_suspended", true);
    if (status === "active") q = (q as any).neq("is_suspended", true);

    const { data, count } = await q;
    return NextResponse.json({ users: data ?? [], total: count ?? 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
