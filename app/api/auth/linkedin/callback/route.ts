import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = cookieStore.get("linkedin_oauth_state")?.value;

  // Clear state cookie
  cookieStore.delete("linkedin_oauth_state");

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${APP_URL}/api/auth/linkedin/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${APP_URL}/login?error=linkedin_not_configured`);
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken: string = tokenData.access_token;

    // Get user info using OpenID Connect userinfo endpoint
    const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    }

    const userData = await userRes.json();
    const email: string = userData.email ?? "";
    const fullName: string = userData.name ?? `${userData.given_name ?? ""} ${userData.family_name ?? ""}`.trim();
    const avatarUrl: string = userData.picture ?? "";
    const providerId: string = userData.sub ?? "";

    if (!email) {
      return NextResponse.redirect(`${APP_URL}/login?error=no_email`);
    }

    // Store social connection data in DB (upsert)
    await insforge.database.from("social_connections").upsert([{
      provider: "linkedin",
      provider_user_id: providerId,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      access_token: accessToken,
    }], { onConflict: "provider,provider_user_id" }).catch(() => {});

    // Check if user exists in profiles
    const { data: profile } = await insforge.database
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profile?.id) {
      // Existing user — send magic link to sign in
      const authAny = insforge.auth as any;
      if (typeof authAny.sendOtp === "function") {
        await authAny.sendOtp({ email }).catch(() => {});
      } else {
        await insforge.auth.sendResetPasswordEmail({ email }).catch(() => {});
      }
      return NextResponse.redirect(
        `${APP_URL}/login?social=linkedin&email=${encodeURIComponent(email)}&action=signin`
      );
    } else {
      // New user — create account and redirect to verify
      const password = generatePassword();
      await insforge.auth.signUp({ email, password, name: fullName }).catch(() => {});
      return NextResponse.redirect(
        `${APP_URL}/login?social=linkedin&email=${encodeURIComponent(email)}&action=signup`
      );
    }
  } catch {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
}

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), b => chars[b % chars.length]).join("");
}
