/**
 * StarzLink Auto-Expire Edge Function
 * Runs daily via InsForge Scheduled Task to:
 *   1. Mark expired jobs/scholarships/trainings as 'expired'
 *   2. Permanently delete records older than 90 days past expiry
 *
 * Deploy: npx @insforge/cli functions deploy auto-expire
 * Schedule: daily at 00:00 UTC
 */

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const SERVICE_KEY = process.env.INSFORGE_SERVICE_ROLE_KEY || process.env.INSFORGE_ANON_KEY || "";

async function dbQuery(sql: string) {
  const res = await fetch(`${INSFORGE_URL}/api/database/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SERVICE_KEY}` },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DB query failed: ${err}`);
  }
  return res.json();
}

export default async function handler(req: Request) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffDate = cutoff.toISOString().split("T")[0];

  const results: Record<string, any> = {};

  try {
    // ── 1. Mark expired JOBS ──────────────────────────────────────
    const expireJobs = await dbQuery(`
      UPDATE jobs
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'active'
        AND deadline < '${today}'::date
      RETURNING id, title
    `);
    results.expired_jobs = expireJobs?.length || 0;

    // ── 2. Mark expired SCHOLARSHIPS ─────────────────────────────
    const expireScholarships = await dbQuery(`
      UPDATE scholarships
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'active'
        AND deadline < '${today}'::date
      RETURNING id, title
    `);
    results.expired_scholarships = expireScholarships?.length || 0;

    // ── 3. Mark expired TRAININGS ─────────────────────────────────
    const expireTrainings = await dbQuery(`
      UPDATE trainings
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'active'
        AND start_date < '${today}'::date
      RETURNING id, title
    `);
    results.expired_trainings = expireTrainings?.length || 0;

    // ── 4. Hard-delete records expired > 90 days ago ─────────────
    const deleteOldJobs = await dbQuery(`
      DELETE FROM jobs
      WHERE status = 'expired'
        AND deadline < '${cutoffDate}'::date
      RETURNING id
    `);
    results.deleted_old_jobs = deleteOldJobs?.length || 0;

    const deleteOldScholarships = await dbQuery(`
      DELETE FROM scholarships
      WHERE status = 'expired'
        AND deadline < '${cutoffDate}'::date
      RETURNING id
    `);
    results.deleted_old_scholarships = deleteOldScholarships?.length || 0;

    const deleteOldTrainings = await dbQuery(`
      DELETE FROM trainings
      WHERE status = 'expired'
        AND start_date < '${cutoffDate}'::date
      RETURNING id
    `);
    results.deleted_old_trainings = deleteOldTrainings?.length || 0;

    // ── 5. Archive old campus updates (> 90 days old) ─────────────
    const archiveCampus = await dbQuery(`
      UPDATE campus_updates
      SET status = 'expired'
      WHERE status = 'active'
        AND date < '${cutoffDate}'::date
      RETURNING id
    `);
    results.archived_campus_updates = archiveCampus?.length || 0;

    const totalExpired =
      results.expired_jobs + results.expired_scholarships + results.expired_trainings;
    const totalDeleted =
      results.deleted_old_jobs + results.deleted_old_scholarships + results.deleted_old_trainings;

    console.log(`[auto-expire] ${today}: Expired ${totalExpired} items, deleted ${totalDeleted} old records`);

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        summary: `Expired ${totalExpired} items, cleaned up ${totalDeleted} old records`,
        details: results,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[auto-expire] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
