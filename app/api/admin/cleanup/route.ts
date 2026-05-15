import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";
const TABLES = ["jobs", "scholarships", "trainings", "opportunities"] as const;

async function expireTable(table: string, authKey: string): Promise<number> {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Step 1: Find records to expire via REST API (bypasses RLS)
    let findUrl = `${INSFORGE_URL}/rest/v1/${table}?status=in.(active,published)&select=id`;
    if (table !== "trainings") {
      // trainings may not have deadline — only filter by deadline for tables that have it
      findUrl += `&deadline=lt.${today}`;
    }

    const findRes = await fetch(findUrl, {
      headers: { apikey: authKey, Authorization: `Bearer ${authKey}` },
    });

    if (!findRes.ok) return 0;
    const rows = await findRes.json();
    const ids: string[] = (Array.isArray(rows) ? rows : []).map((r: any) => r.id);
    if (ids.length === 0) return 0;

    const now = new Date().toISOString();

    // Step 2: Update each record via REST API PATCH
    // Use in.(id1,id2,...) filter to batch update
    const idList = ids.join(",");
    const patchRes = await fetch(
      `${INSFORGE_URL}/rest/v1/${table}?id=in.(${idList})`,
      {
        method: "PATCH",
        headers: {
          apikey: authKey,
          Authorization: `Bearer ${authKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: "expired",
          expired_at: now,
          public_visible: false,
          updated_at: now,
        }),
      }
    );

    if (patchRes.ok) return ids.length;

    // Fallback: SDK update (might miss new columns but at least sets status)
    try {
      await insforge.database.from(table).update({
        status: "expired",
        expired_at: now,
        public_visible: false,
        updated_at: now,
      }).in("id", ids);
      return ids.length;
    } catch {
      // Last resort: set status only
      try {
        await insforge.database.from(table).update({ status: "expired", updated_at: now }).in("id", ids);
        return ids.length;
      } catch { return 0; }
    }
  } catch (e: any) {
    console.error(`Expire ${table} error:`, e.message);
    return 0;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;
    const results: Record<string, number> = {};

    for (const table of TABLES) {
      results[table] = await expireTable(table, authKey);
    }

    const total = Object.values(results).reduce((s, n) => s + n, 0);

    // Log cleanup run (silently ignore if table doesn't exist)
    try {
      await insforge.database.from("cleanup_logs").insert([{
        run_type: "manual",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        total_expired: total,
        jobs_expired: results.jobs ?? 0,
        scholarships_expired: results.scholarships ?? 0,
        trainings_expired: results.trainings ?? 0,
        opportunities_expired: results.opportunities ?? 0,
        status: "completed",
      }]);
    } catch {}

    const parts = Object.entries(results)
      .filter(([, n]) => n > 0)
      .map(([t, n]) => `${n} ${t}`);

    const message = parts.length > 0
      ? `Cleanup completed: ${parts.join(", ")} marked as expired.`
      : "Cleanup complete. No newly expired records found.";

    return NextResponse.json({ success: true, message, total, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST(new NextRequest("http://localhost/api/admin/cleanup", { method: "POST" }));
}
