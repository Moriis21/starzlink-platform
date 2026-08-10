/**
 * Server-side Stripe helpers (no SDK — raw REST + crypto, matching the codebase style).
 * Used by the hosted Checkout Session route and the webhook. Keys are read from env
 * first, then the InsForge `settings` table, so they never ship in client code.
 */
import crypto from "crypto";
import { insforge } from "./insforge";

const STRIPE_API = "https://api.stripe.com/v1";

export async function getStripeSecretKey(): Promise<string> {
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

export async function getStripeWebhookSecret(): Promise<string> {
  if (process.env.STRIPE_WEBHOOK_SECRET) return process.env.STRIPE_WEBHOOK_SECRET;
  try {
    const { data } = await insforge.database
      .from("settings")
      .select("value")
      .eq("key", "stripe_webhook_secret")
      .single();
    return (data as any)?.value ?? "";
  } catch {
    return "";
  }
}

/**
 * Flatten a nested object into Stripe's bracketed form-encoding, e.g.
 * { line_items: [{ quantity: 1 }] } → "line_items[0][quantity]=1".
 */
function encodeForm(obj: Record<string, any>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    const k = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item !== null && typeof item === "object") {
          parts.push(...encodeForm(item, `${k}[${i}]`));
        } else {
          parts.push(`${encodeURIComponent(`${k}[${i}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof value === "object") {
      parts.push(...encodeForm(value, k));
    } else {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

/** Create a Stripe Checkout Session via the REST API. Returns the parsed session. */
export async function createCheckoutSession(
  secretKey: string,
  params: Record<string, any>
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: encodeForm(params).join("&"),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/**
 * Verify a Stripe webhook signature (the same scheme Stripe's SDK uses).
 * Header format: "t=<timestamp>,v1=<hexsig>". We HMAC-SHA256 `${t}.${payload}`
 * with the webhook secret and constant-time compare against the v1 signature.
 */
export function verifyStripeSignature(
  payload: string,
  sigHeader: string | null,
  secret: string,
  toleranceSeconds = 300
): boolean {
  if (!sigHeader || !secret) return false;

  let timestamp = "";
  const signatures: string[] = [];
  for (const part of sigHeader.split(",")) {
    const [prefix, val] = part.split("=");
    if (prefix === "t") timestamp = val;
    else if (prefix === "v1" && val) signatures.push(val);
  }
  if (!timestamp || signatures.length === 0) return false;

  // Reject stale timestamps to blunt replay attacks.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");

  return signatures.some((sig) => {
    try {
      const sigBuf = Buffer.from(sig, "hex");
      return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  });
}
