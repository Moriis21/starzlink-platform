import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// GET: user's requests or admin list
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");
    const admin = searchParams.get("admin") === "true";

    if (admin) {
      const { data } = await insforge.database.from("scholarship_assistance_requests").select("*").order("created_at", { ascending: false }).limit(200);
      return NextResponse.json({ requests: data || [] });
    }

    if (!userId) return NextResponse.json({ requests: [] });
    const { data } = await insforge.database.from("scholarship_assistance_requests").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return NextResponse.json({ requests: data || [] });
  } catch { return NextResponse.json({ requests: [] }); }
}

// POST: submit request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, full_name, email, phone, scholarship_name, scholarship_url, package: pkg, notes, documents } = body;

    if (!full_name || !email || !scholarship_name || !pkg) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const packagePrices: Record<string, number> = {
      basic_review: 15,
      essay_improvement: 25,
      full_support: 50,
      interview_prep: 35,
    };

    const { data, error } = await insforge.database.from("scholarship_assistance_requests").insert({
      user_id: userId || null,
      full_name, email, phone,
      scholarship_name, scholarship_url,
      package: pkg,
      notes, documents: documents || [],
      status: "pending",
      payment_status: "pending",
      payment_amount: packagePrices[pkg] || 15,
    }).select().single();

    if (error) throw new Error(String(error));
    return NextResponse.json({ success: true, request: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: admin updates (status, expert, message)
export async function PATCH(req: NextRequest) {
  try {
    const { requestId, ...updates } = await req.json();
    const { data, error } = await insforge.database.from("scholarship_assistance_requests").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", requestId).select().single();
    if (error) throw new Error(String(error));
    return NextResponse.json({ success: true, request: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
