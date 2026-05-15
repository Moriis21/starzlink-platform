import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// GET: fetch active ads for a placement, or all ads for admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const placement = searchParams.get("placement");
    const admin = searchParams.get("admin") === "true";

    if (admin) {
      const { data } = await insforge.database.from("ads").select("*").order("created_at", { ascending: false }).limit(200);
      return NextResponse.json({ ads: data || [] });
    }

    // Public: only active ads for requested placement
    const today = new Date().toISOString().slice(0, 10);
    let q = insforge.database.from("ads").select("id,title,description,image_url,link_url,placement").eq("status", "active").lte("start_date", today).gte("end_date", today);
    if (placement) q = q.eq("placement", placement);
    const { data } = await q.limit(5);

    return NextResponse.json({ ads: data || [] });
  } catch { return NextResponse.json({ ads: [] }); }
}

// POST: submit ad request (from /advertise page)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { advertiser_name, contact_person, phone, email, business_type, title, description, image_url, link_url, placement, start_date, end_date, budget } = body;

    if (!advertiser_name || !email || !title || !placement) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await insforge.database.from("ads").insert({
      advertiser_name, contact_person, phone, email, business_type, title, description,
      image_url, link_url, placement, start_date, end_date, budget,
      status: "pending",
    }).select().single();

    if (error) throw new Error(String(error));
    return NextResponse.json({ success: true, ad: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
