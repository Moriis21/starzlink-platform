import { NextRequest, NextResponse } from "next/server";

// In-memory sliding-window limiter. Fine as an MVP; on serverless it is
// per-instance (each cold container starts fresh), so treat these as a
// soft ceiling that protects the Groq budget from casual abuse, not as
// a strict global quota. Swap for Upstash Ratelimit + Redis when traffic
// justifies it — the call sites won't need to change.

type Bucket = { hits: number[] };
const store = new Map<string, Bucket>();

// Best-effort periodic sweep so the map doesn't grow unbounded.
let sweepArmed = false;
function armSweep() {
  if (sweepArmed) return;
  sweepArmed = true;
  setInterval(() => {
    const cutoff = Date.now() - 15 * 60_000;
    for (const [k, b] of store) {
      const kept = b.hits.filter((t) => t > cutoff);
      if (kept.length === 0) store.delete(k);
      else b.hits = kept;
    }
  }, 5 * 60_000).unref?.();
}

export type RateLimitOptions = {
  /** Bucket name — namespaces the counter (e.g. "chat", "essay"). */
  key: string;
  /** Max requests allowed inside the window. */
  limit: number;
  /** Sliding window size in milliseconds. */
  windowMs: number;
  /** Optional stable identifier (user id, session id) that overrides IP. */
  identifier?: string | null;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetInMs: number;
  limit: number;
};

function identify(req: NextRequest, override?: string | null): string {
  if (override) return `u:${override}`;
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon";
  return `ip:${ip}`;
}

export function rateLimit(req: NextRequest, opts: RateLimitOptions): RateLimitResult {
  armSweep();
  const now = Date.now();
  const windowStart = now - opts.windowMs;
  const key = `${opts.key}:${identify(req, opts.identifier ?? null)}`;
  const bucket = store.get(key) ?? { hits: [] };
  const hits = bucket.hits.filter((t) => t > windowStart);

  if (hits.length >= opts.limit) {
    const resetInMs = Math.max(0, hits[0] + opts.windowMs - now);
    store.set(key, { hits });
    return { ok: false, remaining: 0, resetInMs, limit: opts.limit };
  }

  hits.push(now);
  store.set(key, { hits });
  return { ok: true, remaining: opts.limit - hits.length, resetInMs: opts.windowMs, limit: opts.limit };
}

/** Convenience: build a 429 NextResponse with standard headers. */
export function tooManyRequests(result: RateLimitResult) {
  const retryAfterSec = Math.ceil(result.resetInMs / 1000);
  return NextResponse.json(
    { error: "Rate limit exceeded. Please slow down and try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.resetInMs) / 1000)),
      },
    }
  );
}
