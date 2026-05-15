import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

async function getStripeSecretKey(): Promise<string> {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;
  try {
    const { data } = await insforge.database
      .from("settings")
      .select("value")
      .eq("key", "stripe_secret_key")
      .single();
    return (data as any)?.value ?? "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, userId } = await req.json();
    const secretKey = await getStripeSecretKey();

    if (!secretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    // Create Stripe PaymentIntent via Stripe API
    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(Math.round(amount * 100)), // cents
        currency: currency?.toLowerCase() || "usd",
        "metadata[user_id]": userId,
        "automatic_payment_methods[enabled]": "true",
      }).toString(),
    });

    const intent = await stripeRes.json();
    if (!stripeRes.ok) {
      return NextResponse.json({ error: intent.error?.message || "Stripe error" }, { status: 400 });
    }

    return NextResponse.json({ clientSecret: intent.client_secret, intentId: intent.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
