import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export const runtime = "nodejs";

function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/login?error=linkedin_not_configured", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  }

  const state = generateState();
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`;
  const scope = "openid profile email";

  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", scope);

  const cookieStore = await cookies();
  cookieStore.set("linkedin_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 min
    path: "/",
  });

  return NextResponse.redirect(authUrl.toString());
}
