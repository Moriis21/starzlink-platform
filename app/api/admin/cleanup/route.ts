import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const TABLES = ["jobs", "scholarships", "trainings", "opportunities"] as const;
const TODAY = () => new Date().toISOString();

async function expireTable(table: string): Promise<number> {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    // Find active records past their deadline
    const { data } = await insforge.database
      .from(table)
      .select("id, deadline, status")
      .lt("deadline", today)
      .in("status", ["active", "published"]);

    if (!data || data.length === 0) return 0;

    const ids = (data as any[]).map((r: any) => r.id);
    await insforge.database
      .from(table)
      .update({
        status: "expired",
        expired_at: TODAY(),
        public_visible: false,
        updated_at: TODAY(),
      })
      .in("id", ids);

    return ids.length;
  } catch (e: any) {
    console.error(`Expire ${table} error:`, e.message);
    return 0;
  }
}

export async function POST(req: NextRequest) {
  try {
    const results: Record<string, number> = {};

    for (const table of TABLES) {
      results[table] = await expireTable(table);
    }

    const total = Object.values(results).reduce((s, n) => s + n, 0);

    // Log the cleanup run
    try {
      await insforge.database.from("cleanup_logs").insert([{
        run_type: "manual",
        started_at: TODAY(),
        completed_at: TODAY(),
        total_expired: total,
        jobs_expired: results.jobs ?? 0,
        scholarships_expired: results.scholarships ?? 0,
        trainings_expired: results.trainings ?? 0,
        opportunities_expired: results.opportunities ?? 0,
        status: "completed",
      }]);
    } catch { /* cleanup_logs table may not exist yet */ }

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
  // Run cleanup on GET too (for cron)
  return POST(new NextRequest("http://localhost/api/admin/cleanup", { method: "POST" }));
}
