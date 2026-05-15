import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// GET: reviews for an opportunity
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const opportunityId = searchParams.get("opportunityId");
    const opportunityType = searchParams.get("opportunityType");
    const admin = searchParams.get("admin") === "true";

    if (!opportunityId) return NextResponse.json({ reviews: [], average: 0, count: 0 });

    let q = insforge.database.from("opportunity_reviews").select("*").eq("opportunity_id", opportunityId);
    if (opportunityType) q = q.eq("opportunity_type", opportunityType);
    if (!admin) q = q.eq("status", "approved");
    q = q.order("created_at", { ascending: false }).limit(50);

    const { data } = await q;
    const reviews = (data || []) as any[];

    const avgRating = reviews.length > 0
      ? Math.round(reviews.reduce((sum: number, r: any) => sum + (r.overall_rating || 0), 0) / reviews.length * 10) / 10
      : 0;

    return NextResponse.json({ reviews, average: avgRating, count: reviews.length });
  } catch { return NextResponse.json({ reviews: [], average: 0, count: 0 }); }
}

// POST: submit a review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, opportunityId, opportunityType, opportunityTitle, overall_rating, quality_rating, process_rating, response_rating, trust_rating, review_text } = body;

    if (!userId || !opportunityId || !overall_rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for existing review
    const { data: existing } = await insforge.database
      .from("opportunity_reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("opportunity_id", opportunityId)
      .single();

    if (existing) {
      // Update
      const { data } = await insforge.database.from("opportunity_reviews").update({
        overall_rating, quality_rating, process_rating, response_rating, trust_rating, review_text,
        status: "pending",
      }).eq("id", (existing as any).id).select().single();
      return NextResponse.json({ success: true, review: data, updated: true });
    }

    const { data, error } = await insforge.database.from("opportunity_reviews").insert({
      user_id: userId, opportunity_id: opportunityId, opportunity_type: opportunityType,
      opportunity_title: opportunityTitle, overall_rating, quality_rating, process_rating,
      response_rating, trust_rating, review_text, status: "pending",
    }).select().single();

    if (error) throw new Error(String(error));
    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: admin moderation
export async function PATCH(req: NextRequest) {
  try {
    const { reviewId, status } = await req.json();
    const { data } = await insforge.database.from("opportunity_reviews").update({ status }).eq("id", reviewId).select().single();
    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
