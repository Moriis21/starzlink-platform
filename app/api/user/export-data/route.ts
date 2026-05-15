import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const format = searchParams.get("format") || "json";

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Fetch all user data in parallel
    const [
      profileRes, savedRes, uploadsRes, analysisRes,
      lettersRes, paymentsRes, referralsRes, creditsRes,
    ] = await Promise.allSettled([
      insforge.database.from("profiles").select("*").eq("id", userId).maybeSingle(),
      insforge.database.from("saved_items").select("*").eq("user_id", userId),
      insforge.database.from("cv_uploads").select("id,file_name,file_size,status,created_at").eq("user_id", userId),
      insforge.database.from("cv_analysis").select("overall_score,ats_score,career_advice,created_at").eq("user_id", userId),
      insforge.database.from("application_letters").select("job_title,company_name,created_at").eq("user_id", userId),
      insforge.database.from("payments").select("amount,currency,payment_method,payment_status,created_at").eq("user_id", userId),
      insforge.database.from("referrals").select("*").eq("user_id", userId),
      insforge.database.from("user_credits").select("credits_balance,credits_used").eq("user_id", userId).maybeSingle(),
    ]);

    const get = (r: PromiseSettledResult<any>, key = "data") =>
      r.status === "fulfilled" ? (r.value?.[key] ?? (key === "data" ? [] : null)) : (key === "data" ? [] : null);

    const profile = get(profileRes, "data") as any;

    const exportData = {
      exported_at: new Date().toISOString(),
      export_version: "1.0",
      user: {
        id: userId,
        full_name: profile?.full_name,
        email: profile?.email,
        phone: profile?.phone,
        whatsapp_number: profile?.whatsapp_number,
        country: profile?.country,
        county_state: profile?.county_state,
        city_community: profile?.city_community,
        current_location: profile?.current_location,
        address_description: profile?.address_description,
        preferred_language: profile?.preferred_language,
        occupation: profile?.occupation,
        education_level: profile?.education_level,
        institution_workplace: profile?.institution_workplace,
        area_of_interest: profile?.area_of_interest,
        career_goal: profile?.career_goal,
        user_type: profile?.user_type,
        role: profile?.role,
        bio: profile?.bio,
        profile_completed: profile?.profile_completed,
        account_status: profile?.account_status || "active",
        date_registered: profile?.created_at,
        last_login: profile?.last_login_at,
      },
      saved_opportunities: get(savedRes),
      cv_uploads: get(uploadsRes),
      cv_analyses: get(analysisRes),
      generated_letters: get(lettersRes),
      payment_history: get(paymentsRes),
      referral_history: get(referralsRes),
      credits: get(creditsRes, "data"),
    };

    // Log export action
    try {
      await insforge.database.from("activity_logs").insert([{
        user_id: userId,
        action: "data_exported",
        module: "user_data",
        details: `User exported their personal data (${format.toUpperCase()})`,
      }]);
    } catch {}

    if (format === "csv") {
      // Build a simple CSV of the profile
      const rows = Object.entries(exportData.user)
        .map(([k, v]) => `"${k}","${String(v ?? "").replace(/"/g, '""')}"`)
        .join("\n");
      const csv = `"field","value"\n${rows}`;
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="starzlink-data-${Date.now()}.csv"`,
        },
      });
    }

    // Default: JSON
    const json = JSON.stringify(exportData, null, 2);
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="starzlink-data-${Date.now()}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
