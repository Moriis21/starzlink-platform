import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // Delete in order of dependencies
    const tables = [
      "cv_analysis", "improved_cvs", "cv_uploads",
      "credit_transactions", "user_credits",
      "saved_items", "referrals", "notifications",
      "application_letters", "linkedin_reviews",
      "subscriptions", "admin_pro_grants",
      "newsletter_subscribers",
    ];

    for (const table of tables) {
      try {
        // Try user_id column first, then id column
        const { error } = await insforge.database.from(table).delete().eq("user_id", userId);
        if (error) {
          await insforge.database.from(table).delete().eq("id", userId);
        }
      } catch {}
    }

    // Delete profile last
    try { await insforge.database.from("profiles").delete().eq("id", userId); } catch {}

    // Delete auth user via InsForge admin API
    const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;
    try {
      await fetch(`${INSFORGE_URL}/auth/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: { apikey: authKey, Authorization: `Bearer ${authKey}` },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
