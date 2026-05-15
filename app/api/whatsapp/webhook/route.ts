import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "starzlink_wa_2026";
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "";

// GET: webhook verification (WhatsApp sends this on setup)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST: receive messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message || message.type !== "text") return NextResponse.json({ status: "ignored" });

    const fromNumber = message.from;
    const messageText = message.text?.body?.trim() || "";
    const lowerMsg = messageText.toLowerCase();

    // Determine intent
    let intent = "unknown";
    let opportunityType = "jobs";
    let searchQuery = "";

    if (/scholarship|bursary|award|grant for student/i.test(lowerMsg)) { intent = "scholarships"; opportunityType = "scholarships"; }
    else if (/job|vacancy|hiring|employ|career/i.test(lowerMsg)) { intent = "jobs"; opportunityType = "jobs"; }
    else if (/internship|intern/i.test(lowerMsg)) { intent = "internships"; opportunityType = "internships"; }
    else if (/training|course|workshop|learn/i.test(lowerMsg)) { intent = "trainings"; opportunityType = "trainings"; }
    else if (/study abroad|exchange|overseas/i.test(lowerMsg)) { intent = "study-abroad"; opportunityType = "study_abroad"; }
    else if (/grant/i.test(lowerMsg)) { intent = "grants"; opportunityType = "grants"; }
    else if (/competition|contest/i.test(lowerMsg)) { intent = "competitions"; opportunityType = "competitions"; }
    else if (/deadline|closing|due/i.test(lowerMsg)) { intent = "deadlines"; }
    else if (/help|hi|hello|menu|start/i.test(lowerMsg)) { intent = "menu"; }
    else if (/liberia|monrovia/i.test(lowerMsg)) { intent = "local"; searchQuery = "Liberia"; }
    else { intent = "search"; searchQuery = messageText; }

    let replyText = "";
    let results: any[] = [];

    if (intent === "menu") {
      replyText = `👋 Welcome to *StarzLink Bot*!\n\nI can help you find:\n\n📚 *Scholarships*\n💼 *Jobs*\n🎓 *Internships*\n📖 *Trainings*\n✈️ *Study Abroad*\n💰 *Grants*\n🏆 *Competitions*\n\nJust type what you're looking for!\n\n🔗 Visit: https://starzlink.vercel.app`;
    } else if (intent === "deadlines") {
      // Fetch opportunities closing in next 7 days
      const soon = new Date(); soon.setDate(soon.getDate() + 7);
      const [jobsRes, scholRes] = await Promise.all([
        insforge.database.from("jobs").select("title,company,deadline").eq("status", "active").lte("deadline", soon.toISOString().slice(0, 10)).order("deadline").limit(3),
        insforge.database.from("scholarships").select("title,organization,deadline").eq("status", "active").lte("deadline", soon.toISOString().slice(0, 10)).order("deadline").limit(3),
      ]);
      const items = [...(jobsRes.data || []).map((j: any) => ({ ...j, type: "Job" })), ...(scholRes.data || []).map((s: any) => ({ ...s, type: "Scholarship" }))];
      if (items.length === 0) {
        replyText = `No opportunities closing in the next 7 days. Check more at:\n🔗 https://starzlink.vercel.app`;
      } else {
        replyText = `⏰ *Closing Soon on StarzLink:*\n\n${items.slice(0, 5).map((i: any) => `• *${i.type}:* ${i.title}\n  Deadline: ${i.deadline}`).join("\n\n")}\n\n🔗 https://starzlink.vercel.app`;
      }
    } else if (intent === "scholarships") {
      const { data } = await insforge.database.from("scholarships").select("id,title,organization,deadline").in("status", ["active", "published"]).order("created_at", { ascending: false }).limit(5);
      results = data || [];
      replyText = buildOpportunityReply("Scholarships 📚", results, "scholarships", (i: any) => i.title, (i: any) => i.organization, (i: any) => i.deadline, (i: any) => `scholarships/${i.id}`);
    } else if (intent === "jobs") {
      const { data } = await insforge.database.from("jobs").select("id,title,company,deadline").in("status", ["active", "published"]).order("created_at", { ascending: false }).limit(5);
      results = data || [];
      replyText = buildOpportunityReply("Jobs 💼", results, "jobs", (i: any) => i.title, (i: any) => i.company, (i: any) => i.deadline, (i: any) => `jobs/${i.id}`);
    } else if (intent === "trainings") {
      const { data } = await insforge.database.from("trainings").select("id,title,organization,deadline").in("status", ["active", "published"]).order("created_at", { ascending: false }).limit(5);
      results = data || [];
      replyText = buildOpportunityReply("Trainings 📖", results, "trainings", (i: any) => i.title, (i: any) => i.organization, (i: any) => i.deadline, (i: any) => `trainings/${i.id}`);
    } else {
      // Generic search
      const [jobsRes, scholRes] = await Promise.all([
        insforge.database.from("jobs").select("id,title,company").in("status", ["active", "published"]).ilike("title", `%${searchQuery || messageText}%`).limit(3),
        insforge.database.from("scholarships").select("id,title,organization").in("status", ["active", "published"]).ilike("title", `%${searchQuery || messageText}%`).limit(3),
      ]);
      results = [...(jobsRes.data || []).map((j: any) => ({ ...j, _type: "job" })), ...(scholRes.data || []).map((s: any) => ({ ...s, _type: "scholarship" }))];
      if (results.length === 0) {
        replyText = `🔍 No results found for "${messageText}". Try: *Jobs*, *Scholarships*, *Trainings*\n\n🔗 Browse all: https://starzlink.vercel.app`;
      } else {
        replyText = `🔍 Results for "${messageText}":\n\n${results.slice(0, 5).map((r: any) => `• *${r.title}*\nhttps://starzlink.vercel.app/opportunities/${r._type === "job" ? "jobs" : "scholarships"}/${r.id}`).join("\n\n")}\n\n🔗 https://starzlink.vercel.app`;
      }
    }

    // Log message
    try {
      await insforge.database.from("whatsapp_bot_messages").insert({
        from_number: fromNumber,
        message_in: messageText,
        message_out: replyText,
        intent,
        results_count: results.length,
        status: "processed",
      });
    } catch { /* non-blocking */ }

    // Send reply via WhatsApp API
    if (WA_TOKEN && WA_PHONE_ID) {
      await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: fromNumber,
          type: "text",
          text: { body: replyText },
        }),
      });
    }

    return NextResponse.json({ status: "processed" });
  } catch (err: any) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

function buildOpportunityReply(label: string, items: any[], baseType: string, getTitle: Function, getOrg: Function, getDeadline: Function, getPath: Function): string {
  if (items.length === 0) return `No ${label} found right now.\n\n🔗 https://starzlink.vercel.app`;
  const lines = items.map((i: any) => `• *${getTitle(i)}*\n  ${getOrg(i) || ""} ${getDeadline(i) ? `| Deadline: ${getDeadline(i)}` : ""}\n  🔗 https://starzlink.vercel.app/opportunities/${getPath(i)}`);
  return `Here are ${items.length} ${label} open on StarzLink:\n\n${lines.join("\n\n")}\n\n📌 View all: https://starzlink.vercel.app`;
}
