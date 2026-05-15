import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const ANON_KEY = "ik_6d6c0108a931deb33707cad6a802a9ed";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...fields } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const authKey = process.env.INSFORGE_SERVICE_KEY || ANON_KEY;

    // Build payload — only non-empty values
    const allowed = [
      "full_name", "phone", "whatsapp_number", "country", "county_state",
      "city_community", "current_location", "address_description",
      "preferred_language", "occupation", "education_level",
      "institution_workplace", "area_of_interest", "career_goal",
      "user_type", "bio", "avatar_url",
    ];

    const payload: Record<string, any> = {
      id: userId,
      updated_at: new Date().toISOString(),
    };

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        payload[key] = typeof fields[key] === "string" ? fields[key].trim() : fields[key];
      }
    }

    // Check profile completion
    const requiredForCompletion = ["phone", "country", "county_state", "city_community", "current_location"];
    const isComplete = requiredForCompletion.every(f => payload[f] && String(payload[f]).trim() !== "");
    if (isComplete) {
      payload.profile_completed = true;
      payload.profile_completed_at = new Date().toISOString();
    }

    // Strategy 1: REST API with all new fields
    const r1 = await fetch(`${INSFORGE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: authKey,
        Authorization: `Bearer ${authKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (r1.ok) {
      logActivity(userId);
      return NextResponse.json({ success: true, profile_completed: payload.profile_completed ?? false });
    }

    // Strategy 2: SDK with all fields
    let sdkError: any = null;
    try {
      const { error } = await insforge.database.from("profiles").upsert([payload], { onConflict: "id" });
      sdkError = error;
    } catch (e) { sdkError = e; }

    if (!sdkError) {
      logActivity(userId);
      return NextResponse.json({ success: true, profile_completed: payload.profile_completed ?? false });
    }

    // Strategy 3: Save only columns that definitely exist in the schema
    const corePayload: Record<string, any> = { id: userId };
    const coreFields = ["full_name", "phone", "user_type", "email"];
    for (const k of coreFields) {
      if (payload[k] !== undefined) corePayload[k] = payload[k];
    }
    // Add profile_completed if required fields came through in core
    if (corePayload.phone) corePayload.profile_completed = isComplete;

    const r3 = await fetch(`${INSFORGE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        apikey: authKey,
        Authorization: `Bearer ${authKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(corePayload),
    });

    if (r3.ok) {
      logActivity(userId);
      return NextResponse.json({
        success: true,
        profile_completed: corePayload.profile_completed ?? false,
        partial: true,
        note: "Some fields could not be saved — add new columns to your InsForge profiles table to save all fields.",
      });
    }

    // Strategy 4: InsForge SDK with core fields only
    try {
      const { error } = await insforge.database.from("profiles").upsert([corePayload], { onConflict: "id" });
      if (!error) {
        logActivity(userId);
        return NextResponse.json({ success: true, profile_completed: corePayload.profile_completed ?? false, partial: true });
      }
    } catch {}

    return NextResponse.json({ error: "Failed to update profile. Please try again." }, { status: 500 });

  } catch (err: any) {
    console.error("update-profile error:", err);
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 500 });
  }
}

async function logActivity(userId: string) {
  try {
    await insforge.database.from("activity_logs").insert([{
      user_id: userId,
      action: "profile_updated",
      module: "profile",
      details: "User updated their profile information",
    }]);
  } catch {}
}
