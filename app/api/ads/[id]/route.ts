import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { data, error } = await insforge.database.from("ads").update({ ...body, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw new Error(String(error));
    return NextResponse.json({ success: true, ad: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await insforge.database.from("ads").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
