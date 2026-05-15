import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { insforge } from "@/lib/insforge";
export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function chars66(b: number) {
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%"[b % 66];
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = cookieStore.get("facebook_oauth_state")?.value;
  cookieStore.delete("facebook_oauth_state");

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }

  const appId = process.env.FACEBOOK_CLIENT_ID;
  const appSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const redirectUri = `${APP_URL}/api/auth/facebook/callback`;

  if (!appId || !appSecret) {
    return NextResponse.redirect(`${APP_URL}/login?error=facebook_not_configured`);
  }

  try {
    const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    if (!tokenRes.ok) return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
    const tokenData = await tokenRes.json();
    const accessToken: string = tokenData.access_token;

    const userRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.width(200)&access_token=${accessToken}`
    );
    if (!userRes.ok) return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);

    const userData = await userRes.json();
    const email: string = userData.email ?? "";
    const fullName: string = userData.name ?? "";
    const avatarUrl: string = userData.picture?.data?.url ?? "";
    const providerId: string = userData.id ?? "";

    if (!email) return NextResponse.redirect(`${APP_URL}/login?error=no_email`);

    // Store social connection — ignore errors if table doesn't exist yet
    try {
      await insforge.database.from("social_connections").upsert([{
        provider: "facebook",
        provider_user_id: providerId,
        email,
        full_name: fullName,
        avatar_url: avatarUrl,
        access_token: accessToken,
      }], { onConflict: "provider,provider_user_id" });
    } catch { /* table may not exist yet */ }

    const { data: profile } = await insforge.database
      .from("profiles").select("id").eq("email", email).maybeSingle();

    if (profile?.id) {
      try { await insforge.auth.sendResetPasswordEmail({ email }); } catch {}
      return NextResponse.redirect(
        `${APP_URL}/login?social=facebook&email=${encodeURIComponent(email)}&action=signin`
      );
    } else {
      const password = Array.from(crypto.getRandomValues(new Uint8Array(24)), chars66).join("");
      try { await insforge.auth.signUp({ email, password, name: fullName }); } catch {}
      return NextResponse.redirect(
        `${APP_URL}/login?social=facebook&email=${encodeURIComponent(email)}&action=signup`
      );
    }
  } catch {
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`);
  }
}
