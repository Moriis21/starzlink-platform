"use client";

import { insforge } from "@/lib/insforge";

/**
 * Client-side wrapper around fetch that attaches the current InsForge session
 * token as `Authorization: Bearer …` so the server-side requireAdmin() guard
 * can identify the caller. Use for all /api/admin/* calls.
 *
 * The InsForge SDK does not expose an accessor for the stored access token,
 * so we lean on `refreshSession()` (a public API) and cache what it returns
 * with a small buffer so we don't hit the network on every admin request.
 */

let cachedToken: string | null = null;
let cachedUntilMs = 0;
const REFRESH_LEAD_MS = 60_000; // refresh a minute before actual expiry

async function currentAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedUntilMs) return cachedToken;
  try {
    const { data, error } = await insforge.auth.refreshSession();
    if (error || !data?.accessToken) return null;
    cachedToken = data.accessToken;
    // AuthRefreshResponse doesn't include an expiry — assume a conservative
    // 30 minute window and re-refresh comfortably before that.
    cachedUntilMs = Date.now() + 30 * 60_000 - REFRESH_LEAD_MS;
    return cachedToken;
  } catch {
    return null;
  }
}

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await currentAccessToken();
  const headers = new Headers(init.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

/** Reset the cached token — call on logout. */
export function clearAdminFetchToken() {
  cachedToken = null;
  cachedUntilMs = 0;
}
