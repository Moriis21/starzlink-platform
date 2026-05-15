import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  try {
    const { uploadId, userId } = await req.json();
    if (!uploadId || !userId) {
      return NextResponse.json({ error: "Missing uploadId or userId" }, { status: 400 });
    }

    // Verify ownership
    const { data: upload } = await insforge.database
      .from("cv_uploads").select("id, user_id, file_url").eq("id", uploadId).maybeSingle();

    if (!upload || (upload as any).user_id !== userId) {
      return NextResponse.json({ error: "CV not found or access denied" }, { status: 403 });
    }

    // Delete in order: analysis → improved CVs → upload record
    try { await insforge.database.from("cv_analysis").delete().eq("upload_id", uploadId); } catch {}
    try { await insforge.database.from("improved_cvs").delete().eq("upload_id", uploadId); } catch {}
    try { await insforge.database.from("cv_uploads").delete().eq("id", uploadId).eq("user_id", userId); } catch {}

    // Delete file from storage if URL exists
    const fileUrl = (upload as any).file_url;
    if (fileUrl) {
      try {
        const urlParts = fileUrl.split("/cv-files/");
        if (urlParts.length > 1) {
          await (insforge.storage.from("cv-files") as any).remove(urlParts[1]);
        }
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
