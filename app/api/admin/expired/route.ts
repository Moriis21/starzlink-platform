import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const TABLES = ["jobs", "scholarships", "trainings", "opportunities"] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "expired";
    const search = searchParams.get("search") || "";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = 20;
    const from = (page - 1) * limit;

    const results: any[] = [];

    const tablesToQuery = contentType === "all"
      ? TABLES
      : [contentType as typeof TABLES[number]];

    for (const table of tablesToQuery) {
      try {
        let q = insforge.database
          .from(table)
          .select("id, title, status, deadline, created_at, expired_at, archived_at", { count: "exact" })
          .order("expired_at", { ascending: false })
          .range(from, from + limit - 1);

        if (status === "expired") q = q.eq("status", "expired");
        else if (status === "archived") q = q.eq("status", "archived");
        else if (status === "deleted") q = q.eq("status", "deleted");
        else q = q.in("status", ["expired", "archived"]);

        if (search) q = q.ilike("title", `%${search}%`);

        const { data, error } = await q;
        if (data) {
          results.push(...(data as any[]).map((r: any) => ({ ...r, _table: table, _type: table.slice(0, -1) })));
        }
      } catch { /* table may not have these columns yet */ }
    }

    // Sort by expired_at descending
    results.sort((a, b) => {
      const da = a.expired_at || a.created_at || "";
      const db = b.expired_at || b.created_at || "";
      return db.localeCompare(da);
    });

    // Get stats
    const stats: Record<string, number> = {};
    for (const table of TABLES) {
      try {
        const { count } = await insforge.database
          .from(table)
          .select("id", { count: "exact" })
          .eq("status", "expired")
          .limit(1);
        stats[table] = count ?? 0;
      } catch { stats[table] = 0; }
    }

    return NextResponse.json({
      records: results,
      total: results.length,
      stats,
      totalExpired: Object.values(stats).reduce((s, n) => s + n, 0),
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

    if (action === "restore") {
      const updates: any = {
        status: "active",
        public_visible: true,
        expired_at: null,
        restored_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (newDeadline) updates.deadline = newDeadline;
      await insforge.database.from(table).update(updates).eq("id", id);
      return NextResponse.json({ success: true, action: "restored" });
    }

    if (action === "extend") {
      if (!newDeadline) return NextResponse.json({ error: "New deadline required" }, { status: 400 });
      await insforge.database.from(table).update({
        deadline: newDeadline,
        status: "active",
        public_visible: true,
        expired_at: null,
        extension_reason: reason || "Deadline extended by admin",
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      return NextResponse.json({ success: true, action: "extended" });
    }

    if (action === "archive") {
      await insforge.database.from(table).update({
        status: "archived",
        archived_at: new Date().toISOString(),
        public_visible: false,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      return NextResponse.json({ success: true, action: "archived" });
    }

    if (action === "delete") {
      await insforge.database.from(table).delete().eq("id", id);
      return NextResponse.json({ success: true, action: "deleted" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
