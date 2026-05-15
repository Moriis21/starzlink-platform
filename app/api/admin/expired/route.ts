import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";
const TABLES = ["jobs", "scholarships", "trainings", "opportunities"] as const;

type Table = typeof TABLES[number];

/**
 * Fetch expired records via REST API — bypasses RLS so admin can see
 * records where public_visible = false.
 */
async function fetchExpiredFromTable(
  table: Table,
  status: string,
  search: string,
  authKey: string
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      select: "id,title,status,deadline,created_at,expired_at,archived_at,public_visible",
      order: "expired_at.desc.nullslast",
      limit: "100",
    });

    if (status === "expired") params.set("status", "eq.expired");
    else if (status === "archived") params.set("status", "eq.archived");
    else params.set("status", "in.(expired,archived)");

    if (search) params.set("title", `ilike.*${search}*`);

    const res = await fetch(`${INSFORGE_URL}/rest/v1/${table}?${params}`, {
      headers: { apikey: authKey, Authorization: `Bearer ${authKey}` },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((r: any) => ({
      ...r,
      _table: table,
      _type: table === "opportunities" ? "opportunity" : table.slice(0, -1),
    }));
  } catch {
    return [];
  }
}

async function countExpiredInTable(table: Table, authKey: string): Promise<number> {
  try {
    const res = await fetch(
      `${INSFORGE_URL}/rest/v1/${table}?status=eq.expired&select=id`,
      {
        headers: {
          apikey: authKey,
          Authorization: `Bearer ${authKey}`,
          Prefer: "count=exact",
          Range: "0-0",
        },
      }
    );
    if (!res.ok) return 0;
    const range = res.headers.get("content-range");
    if (range) {
      const total = range.split("/")[1];
      if (total && total !== "*") return parseInt(total, 10);
    }
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "expired";
    const search = searchParams.get("search") || "";

    const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;
    const tablesToQuery = contentType === "all" ? [...TABLES] : [contentType as Table];

    // Fetch from all tables in parallel
    const recordArrays = await Promise.all(
      tablesToQuery.map(t => fetchExpiredFromTable(t, status, search, authKey))
    );

    const records = recordArrays
      .flat()
      .sort((a, b) => {
        const da = a.expired_at || a.created_at || "";
        const db = b.expired_at || b.created_at || "";
        return db.localeCompare(da);
      });

    // Count expired per table for stats
    const statEntries = await Promise.all(
      TABLES.map(async t => [t, await countExpiredInTable(t, authKey)] as const)
    );
    const stats = Object.fromEntries(statEntries);

    return NextResponse.json({
      records,
      total: records.length,
      stats,
      totalExpired: statEntries.reduce((s, [, n]) => s + n, 0),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, id, table, newDeadline, reason } = await req.json();
    if (!action || !id || !table) {
      return NextResponse.json({ error: "Missing action, id, or table" }, { status: 400 });
    }

    const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;

    const restUpdate = async (payload: Record<string, any>) => {
      const res = await fetch(`${INSFORGE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          apikey: authKey,
          Authorization: `Bearer ${authKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      });
      return res.ok;
    };

    if (action === "restore") {
      const payload: any = {
        status: "active",
        public_visible: true,
        expired_at: null,
        restored_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (newDeadline) payload.deadline = newDeadline;
      const ok = await restUpdate(payload);
      if (!ok) {
        // fallback to SDK
        try { await insforge.database.from(table).update(payload).eq("id", id); } catch {}
      }
      return NextResponse.json({ success: true, action: "restored" });
    }

    if (action === "extend") {
      if (!newDeadline) return NextResponse.json({ error: "New deadline required" }, { status: 400 });
      const payload = {
        deadline: newDeadline,
        status: "active",
        public_visible: true,
        expired_at: null,
        extension_reason: reason || "Deadline extended by admin",
        updated_at: new Date().toISOString(),
      };
      const ok = await restUpdate(payload);
      if (!ok) {
        try { await insforge.database.from(table).update(payload).eq("id", id); } catch {}
      }
      return NextResponse.json({ success: true, action: "extended" });
    }

    if (action === "archive") {
      const payload = {
        status: "archived",
        archived_at: new Date().toISOString(),
        public_visible: false,
        updated_at: new Date().toISOString(),
      };
      const ok = await restUpdate(payload);
      if (!ok) {
        try { await insforge.database.from(table).update(payload).eq("id", id); } catch {}
      }
      return NextResponse.json({ success: true, action: "archived" });
    }

    if (action === "delete") {
      const res = await fetch(`${INSFORGE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: "DELETE",
        headers: { apikey: authKey, Authorization: `Bearer ${authKey}` },
      });
      if (!res.ok) {
        try { await insforge.database.from(table).delete().eq("id", id); } catch {}
      }
      return NextResponse.json({ success: true, action: "deleted" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
