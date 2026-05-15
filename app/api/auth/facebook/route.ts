import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export const runtime = "nodejs";

function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}

export async function GET() {
  const appId = process.env.FACEBOOK_CLIENT_ID;
  if (!appId) {
    return NextResponse.redirect(
      new URL("/login?error=facebook_not_configured", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  }

  const state = generateState();
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`;

  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "email,public_profile");
  authUrl.searchParams.set("response_type", "code");

  const cookieStore = await cookies();
  cookieStore.set("facebook_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(authUrl.toString());
}
