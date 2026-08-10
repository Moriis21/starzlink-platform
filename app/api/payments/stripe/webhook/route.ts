import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { getStripeWebhookSecret, verifyStripeSignature } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook — the SOURCE OF TRUTH for fulfillment. We never grant access
 * from the browser redirect (which a user could forge); access is only granted
 * here, after Stripe confirms `checkout.session.completed` with `payment_status=paid`.
 *
 * Requires STRIPE_WEBHOOK_SECRET (env or settings). Point a Stripe webhook
 * endpoint at /api/payments/stripe/webhook for the `checkout.session.completed` event.
 */
export async function POST(req: NextRequest) {
  // Raw body is required for signature verification — do not JSON-parse first.
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  const secret = await getStripeWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }
  if (!verifyStripeSignature(rawBody, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Acknowledge everything else so Stripe stops retrying.
    return NextResponse.json({ received: true });
  }

  const session = event.data?.object ?? {};
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  const meta = session.metadata ?? {};
  const userId = meta.user_id || session.client_reference_id;
  const paymentType = meta.payment_type;
  const itemType = meta.item_type || null;
  const itemId = meta.item_id || null;
  const sessionId = session.id as string;
  const amount = (session.amount_total ?? 0) / 100;
  const currency = (session.currency || "usd").toUpperCase();

  if (!userId || !paymentType) {
    // Nothing we can fulfill — ack so Stripe doesn't keep retrying.
    return NextResponse.json({ received: true });
  }

  try {
    // ── Idempotency: bail if we've already recorded this session ──────────────
    const { data: existing } = await insforge.database
      .from("payments")
      .select("id")
      .eq("transaction_reference", sessionId)
      .maybeSingle();
    if (existing) return NextResponse.json({ received: true, duplicate: true });

    const now = new Date().toISOString();

    // ── Record the payment (approved — Stripe already collected the money) ─────
    await insforge.database.from("payments").insert([
      {
        user_id: userId,
        payment_type: paymentType,
        item_type: itemType,
        item_id: itemId,
        plan_type: paymentType === "subscription" ? itemType : null,
        amount,
        currency,
        payment_method: "stripe",
        transaction_reference: sessionId,
        payment_status: "verified",
        admin_approval_status: "approved",
        approved_at: now,
        user_note: "Paid online via Stripe Checkout",
      },
    ]);

    // ── Fulfill ───────────────────────────────────────────────────────────────
    if (paymentType === "subscription") {
      const days = itemType === "pro_yearly" ? 365 : 30;
      const plan = itemType === "pro_yearly" ? "yearly" : "monthly";
      const expiry = new Date(Date.now() + days * 86400000).toISOString();
      await insforge.database.from("subscriptions").upsert(
        [
          {
            user_id: userId,
            plan,
            status: "active",
            amount,
            currency,
            started_at: now,
            current_period_end: expiry,
            updated_at: now,
          },
        ],
        { onConflict: "user_id" }
      );
    } else if (paymentType === "resource_purchase" && itemId) {
      // The resources page gates access on a completed `purchases` row.
      const { data: owned } = await insforge.database
        .from("purchases")
        .select("id")
        .eq("user_id", userId)
        .eq("resource_id", itemId)
        .eq("payment_status", "completed")
        .maybeSingle();
      if (!owned) {
        await insforge.database.from("purchases").insert([
          {
            user_id: userId,
            resource_id: itemId,
            amount,
            currency,
            payment_method: "card",
            payment_status: "completed",
          },
        ]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    // Return 500 so Stripe retries — fulfillment is idempotent above.
    return NextResponse.json({ error: err?.message ?? "Fulfillment failed." }, { status: 500 });
  }
}
