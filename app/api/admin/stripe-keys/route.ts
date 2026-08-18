import { NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { requireAdmin } from "@/lib/requireAdmin";

export const runtime = "nodejs";

/**
 * Admin management of Stripe keys stored in the InsForge `settings` table.
 * SECURITY: the secret values are NEVER sent back to the browser — GET only
 * reports whether each key is configured. Environment variables still take
 * precedence over these values (see lib/stripe.ts).
 */

const SECRET_KEY = "stripe_secret_key";
const WEBHOOK_KEY = "stripe_webhook_secret";

async function readSetting(key: string): Promise<string> {
  try {
    const { data } = await insforge.database
      .from("settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return (data as any)?.value ?? "";
  } catch {
    return "";
  }
}

async function writeSetting(key: string, value: string) {
  // Upsert so the row is created the first time and updated thereafter.
  await insforge.database
    .from("settings")
    .upsert([{ key, value, updated_at: new Date().toISOString() }], { onConflict: "key" });
}

export async function GET(req: NextRequest) {
  const check = await requireAdmin(req, new URL(req.url).searchParams.get("adminId"));
  if (!check.ok) return check.response;

  const [secret, webhook] = await Promise.all([readSetting(SECRET_KEY), readSetting(WEBHOOK_KEY)]);
  return NextResponse.json({
    hasSecretKey: Boolean(secret),
    hasWebhookSecret: Boolean(webhook),
    // Env vars override DB values — tell the admin so the UI can explain precedence.
    secretFromEnv: Boolean(process.env.STRIPE_SECRET_KEY),
    webhookFromEnv: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  });
}

export async function POST(req: NextRequest) {
  try {
    const check = await requireAdmin(req);
    if (!check.ok) return check.response;

    const { secretKey, webhookSecret } = await req.json();
    const updates: Promise<void>[] = [];

    // Only write fields the admin actually filled in (blank = leave unchanged).
    if (typeof secretKey === "string" && secretKey.trim()) {
      updates.push(writeSetting(SECRET_KEY, secretKey.trim()));
    }
    if (typeof webhookSecret === "string" && webhookSecret.trim()) {
      updates.push(writeSetting(WEBHOOK_KEY, webhookSecret.trim()));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
    }

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to save keys." }, { status: 500 });
  }
}
