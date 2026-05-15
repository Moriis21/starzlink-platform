import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

// POST: add item to portfolio (project, certification, award)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { portfolioId, itemType, ...itemData } = body;
    if (!portfolioId || !itemType) return NextResponse.json({ error: "Missing portfolioId or itemType" }, { status: 400 });

    const table = itemType === "project" ? "portfolio_projects"
      : itemType === "certification" ? "portfolio_certifications"
      : "portfolio_awards";

    const { data, error } = await insforge.database.from(table).insert({ portfolio_id: portfolioId, ...itemData }).select().single();
    if (error) throw new Error(String(error));
    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: remove item
export async function DELETE(req: NextRequest) {
  try {
    const { itemId, itemType } = await req.json();
    if (!itemId || !itemType) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const table = itemType === "project" ? "portfolio_projects"
      : itemType === "certification" ? "portfolio_certifications"
      : "portfolio_awards";

    await insforge.database.from(table).delete().eq("id", itemId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
