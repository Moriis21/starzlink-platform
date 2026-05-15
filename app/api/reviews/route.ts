import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 6);
  const category = searchParams.get("category");
  const type = searchParams.get("type") || "reviews"; // "reviews" | "stories"

  if (type === "stories") {
    const { data } = await insforge.database
      .from("success_stories").select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return NextResponse.json({ stories: data ?? [] });
  }

  let q = insforge.database.from("platform_reviews").select("*, profiles!user_id(full_name)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (category) q = q.eq("category", category);
  const { data } = await q;

  // Calculate average rating
  const { data: allRatings } = await insforge.database
    .from("platform_reviews").select("rating").eq("is_published", true);
  const avgRating = allRatings && allRatings.length > 0
    ? allRatings.reduce((s: number, r: any) => s + r.rating, 0) / allRatings.length
    : 0;

  return NextResponse.json({ reviews: data ?? [], avgRating: Math.round(avgRating * 10) / 10, total: allRatings?.length ?? 0 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, rating, category, title, reviewBody, type, outcomeType, outcomeTitle, outcomeDescription, organization, location, displayName } = body;
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    if (type === "story") {
      const { data, error } = await insforge.database.from("success_stories").insert([{
        user_id: userId, user_display_name: displayName || "Anonymous",
        outcome_type: outcomeType, outcome_title: outcomeTitle,
        outcome_description: outcomeDescription, organization, location,
      }]).select("id").single();
      if (error) throw error;
      return NextResponse.json({ success: true, id: (data as any).id });
    }

    const { data, error } = await insforge.database.from("platform_reviews").insert([{
      user_id: userId, rating, category: category || "overall_satisfaction",
      title, body: reviewBody,
    }]).select("id").single();
    if (error) throw error;
    return NextResponse.json({ success: true, id: (data as any).id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
