import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { getStripeSecretKey, createCheckoutSession } from "@/lib/stripe";

export const runtime = "nodejs";

// Trusted, server-side prices for subscription plans (never trust client amounts).
const PLAN_PRICES: Record<string, { amount: number; label: string; plan: string }> = {
  pro_monthly: { amount: 5, label: "StarzLink Pro — Monthly", plan: "monthly" },
  pro_yearly: { amount: 50, label: "StarzLink Pro — Yearly", plan: "yearly" },
};

function appUrl(req: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    req.headers.get("origin") ||
    new URL(req.url).origin
  );
}

export async function POST(req: NextRequest) {
  try {
    const { userId, paymentType, itemType, itemId } = await req.json();

    if (!userId || !paymentType) {
      return NextResponse.json({ error: "Missing user or payment type." }, { status: 400 });
    }

    const secretKey = await getStripeSecretKey();
    if (!secretKey) {
      return NextResponse.json(
        { error: "Card payments are not available yet — Stripe is not configured." },
        { status: 503 }
      );
    }

    // ── Resolve amount + label from a trusted source ──────────────────────────
    let amount: number;
    let label: string;
    let currency = "usd";
    const base = appUrl(req);
    let successUrl = `${base}/dashboard/payment-history?payment=success`;
    let cancelUrl = `${base}/dashboard/career/upgrade?payment=cancelled`;

    if (paymentType === "subscription") {
      const plan = PLAN_PRICES[itemType];
      if (!plan) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
      amount = plan.amount;
      label = plan.label;
    } else if (paymentType === "resource_purchase") {
      if (!itemId) return NextResponse.json({ error: "Missing resource." }, { status: 400 });
      const { data: resource, error } = await insforge.database
        .from("resources")
        .select("id,title,price,currency,is_paid")
        .eq("id", itemId)
        .single();
      const r = resource as any;
      if (error || !r) return NextResponse.json({ error: "Resource not found." }, { status: 404 });
      if (!r.is_paid || !r.price || r.price <= 0) {
        return NextResponse.json({ error: "This resource is free — no payment needed." }, { status: 400 });
      }
      amount = Number(r.price);
      currency = (r.currency || "USD").toLowerCase();
      label = r.title;
      successUrl = `${base}/resources?payment=success`;
      cancelUrl = `${base}/resources?payment=cancelled`;
    } else {
      return NextResponse.json({ error: "Unsupported payment type." }, { status: 400 });
    }

    // ── Create the hosted Checkout Session ────────────────────────────────────
    const { ok, data: session } = await createCheckoutSession(secretKey, {
      mode: "payment",
      success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Math.round(amount * 100),
            product_data: { name: label },
          },
        },
      ],
      metadata: {
        user_id: userId,
        payment_type: paymentType,
        item_type: itemType || "",
        item_id: itemId || "",
      },
    });

    if (!ok || !session?.url) {
      return NextResponse.json(
        { error: session?.error?.message || "Could not start Stripe checkout." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Checkout failed." }, { status: 500 });
  }
}
