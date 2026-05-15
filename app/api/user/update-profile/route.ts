import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...fields } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Build update payload — only include non-empty string values
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

    // Check if required fields are all present to mark profile complete
    const requiredForCompletion = [
      "phone", "country", "county_state", "city_community", "current_location",
    ];

    // Read current profile to check what's filled
    const { data: currentProfile } = await insforge.database
      .from("profiles").select("*").eq("id", userId).maybeSingle();

    const merged = { ...(currentProfile as any ?? {}), ...payload };
    const isComplete = requiredForCompletion.every(f => merged[f] && String(merged[f]).trim() !== "");

    if (isComplete && !(currentProfile as any)?.profile_completed) {
      payload.profile_completed = true;
      payload.profile_completed_at = new Date().toISOString();
    } else if (isComplete) {
      payload.profile_completed = true;
    }

    // Upsert profile
    const { error } = await insforge.database
      .from("profiles")
      .upsert([payload], { onConflict: "id" });

    if (error) {
      console.error("Profile update error:", error);
      // Try with just basic fields
      const basicPayload: Record<string, any> = {
        id: userId,
        updated_at: new Date().toISOString(),
      };
      const basicFields = ["full_name", "phone", "user_type", "bio"];
      for (const k of basicFields) {
        if (payload[k] !== undefined) basicPayload[k] = payload[k];
      }
      const { error: fallbackError } = await insforge.database
        .from("profiles").upsert([basicPayload], { onConflict: "id" });
      if (fallbackError) {
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
      }
    }

    // Log activity
    try {
      await insforge.database.from("activity_logs").insert([{
        user_id: userId,
        action: "profile_updated",
        module: "profile",
        details: "User updated their profile information",
      }]);
    } catch {}

    return NextResponse.json({
      success: true,
      profile_completed: payload.profile_completed ?? (currentProfile as any)?.profile_completed ?? false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
