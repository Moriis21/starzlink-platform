/**
 * StarzLink — Password Reset via OTP
 * Endpoint: POST /functions/v1/reset-password
 *
 * Body: { email, code, newPassword }
 * 1. Verifies the OTP code in password_reset_tokens table
 * 2. Updates the user's password via InsForge admin auth
 * 3. Marks token as used
 */

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return new Response(JSON.stringify({ error: "email, code, and newPassword are required" }), { status: 400 });
    }
    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), { status: 400 });
    }

    const BASE_URL = process.env.INSFORGE_API_URL || "https://8qn72bza.us-east.insforge.app";
    const SERVICE_KEY = process.env.INSFORGE_SERVICE_ROLE_KEY || "";
    const ANON_KEY   = process.env.INSFORGE_ANON_KEY || "ik_6d6c0108a931deb33707cad6a802a9ed";
    const authKey = SERVICE_KEY || ANON_KEY;

    // ── 1. Verify OTP ──────────────────────────────────────────────────────
    const tokenRes = await fetch(
      `${BASE_URL}/rest/v1/password_reset_tokens?email=eq.${encodeURIComponent(email)}&code=eq.${code}&used=eq.false&select=id,expires_at`,
      { headers: { "apikey": authKey, "Authorization": `Bearer ${authKey}` } }
    );
    const tokens = await tokenRes.json();

    if (!Array.isArray(tokens) || tokens.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid or expired code. Please request a new one." }), { status: 400 });
    }

    const token = tokens[0];
    if (new Date(token.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "This code has expired. Please request a new one." }), { status: 400 });
    }

    // ── 2. Get user ID from auth.users by email ────────────────────────────
    const userRes = await fetch(
      `${BASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      { headers: { "apikey": authKey, "Authorization": `Bearer ${authKey}` } }
    );
    const userData = await userRes.json();
    const userId = userData?.users?.[0]?.id || userData?.[0]?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "No account found for this email." }), { status: 404 });
    }

    // ── 3. Update the password via admin endpoint ──────────────────────────
    const updateRes = await fetch(
      `${BASE_URL}/auth/v1/admin/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "apikey": authKey,
          "Authorization": `Bearer ${authKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      return new Response(JSON.stringify({ error: `Password update failed: ${err}` }), { status: 500 });
    }

    // ── 4. Mark token as used ──────────────────────────────────────────────
    await fetch(
      `${BASE_URL}/rest/v1/password_reset_tokens?id=eq.${token.id}`,
      {
        method: "PATCH",
        headers: {
          "apikey": authKey,
          "Authorization": `Bearer ${authKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ used: true }),
      }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
