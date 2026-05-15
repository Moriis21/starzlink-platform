import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// GET portfolio by username or userId
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const username = searchParams.get("username");
    const userId = searchParams.get("userId");

    let q = insforge.database.from("portfolios").select("*");
    if (username) q = q.eq("username", username);
    else if (userId) q = q.eq("user_id", userId);
    else return NextResponse.json({ portfolio: null });

    const { data } = await q.single();
    if (!data) return NextResponse.json({ portfolio: null });

    const portfolio = data as any;

    // Fetch sub-items
    const [projRes, certRes, awardRes] = await Promise.all([
      insforge.database.from("portfolio_projects").select("*").eq("portfolio_id", portfolio.id).order("sort_order"),
      insforge.database.from("portfolio_certifications").select("*").eq("portfolio_id", portfolio.id).order("sort_order"),
      insforge.database.from("portfolio_awards").select("*").eq("portfolio_id", portfolio.id).order("sort_order"),
    ]);

    // Increment views for public access
    if (username) {
      try {
        await insforge.database.from("portfolios").update({ views: (portfolio.views || 0) + 1 }).eq("id", portfolio.id);
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({
      portfolio: {
        ...portfolio,
        projects: projRes.data || [],
        certifications: certRes.data || [],
        awards: awardRes.data || [],
      }
    });
  } catch { return NextResponse.json({ portfolio: null }); }
}

// POST: create or update portfolio
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, username, headline, bio, website, linkedin, github, twitter, is_public, template } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Check if portfolio exists
    const { data: existing } = await insforge.database.from("portfolios").select("id").eq("user_id", userId).single();

    let portfolio: any;
    if (existing) {
      const { data } = await insforge.database.from("portfolios").update({
        username, headline, bio, website, linkedin, github, twitter, is_public, template,
        updated_at: new Date().toISOString(),
      }).eq("user_id", userId).select().single();
      portfolio = data;
    } else {
      const { data } = await insforge.database.from("portfolios").insert({
        user_id: userId, username, headline, bio, website, linkedin, github, twitter,
        is_public: is_public ?? true, template: template || "default",
      }).select().single();
      portfolio = data;
    }

    return NextResponse.json({ success: true, portfolio });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
