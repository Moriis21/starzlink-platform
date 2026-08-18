import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit, tooManyRequests } from "@/lib/rateLimit";
import { NextRequest } from "next/server";

function mkReq(ip = "1.2.3.4"): NextRequest {
  return new NextRequest("http://localhost/api/x", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit", () => {
    const key = `unique-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      const r = rateLimit(mkReq(), { key, limit: 3, windowMs: 60_000 });
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(3 - (i + 1));
    }
  });

  it("blocks the request after the limit is reached", () => {
    const key = `unique-${Math.random()}`;
    for (let i = 0; i < 5; i++) rateLimit(mkReq(), { key, limit: 5, windowMs: 60_000 });
    const r = rateLimit(mkReq(), { key, limit: 5, windowMs: 60_000 });
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.resetInMs).toBeGreaterThan(0);
  });

  it("scopes buckets by IP", () => {
    const key = `unique-${Math.random()}`;
    for (let i = 0; i < 2; i++) rateLimit(mkReq("1.1.1.1"), { key, limit: 2, windowMs: 60_000 });
    const blocked = rateLimit(mkReq("1.1.1.1"), { key, limit: 2, windowMs: 60_000 });
    const otherIp = rateLimit(mkReq("2.2.2.2"), { key, limit: 2, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    expect(otherIp.ok).toBe(true);
  });

  it("prefers a supplied identifier over the IP", () => {
    const key = `unique-${Math.random()}`;
    for (let i = 0; i < 2; i++) {
      rateLimit(mkReq("9.9.9.9"), { key, limit: 2, windowMs: 60_000, identifier: "user-A" });
    }
    // Same user from a different IP is still counted against user-A's bucket.
    const blocked = rateLimit(mkReq("8.8.8.8"), { key, limit: 2, windowMs: 60_000, identifier: "user-A" });
    // A different user from any IP starts fresh.
    const otherUser = rateLimit(mkReq("9.9.9.9"), { key, limit: 2, windowMs: 60_000, identifier: "user-B" });
    expect(blocked.ok).toBe(false);
    expect(otherUser.ok).toBe(true);
  });

  it("recovers after the window elapses", () => {
    const key = `unique-${Math.random()}`;
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    for (let i = 0; i < 2; i++) rateLimit(mkReq(), { key, limit: 2, windowMs: 1_000 });
    expect(rateLimit(mkReq(), { key, limit: 2, windowMs: 1_000 }).ok).toBe(false);

    vi.setSystemTime(new Date("2026-01-01T00:00:02Z")); // +2s > 1s window
    expect(rateLimit(mkReq(), { key, limit: 2, windowMs: 1_000 }).ok).toBe(true);
  });
});

describe("tooManyRequests", () => {
  it("returns 429 with Retry-After and rate-limit headers", () => {
    const res = tooManyRequests({ ok: false, remaining: 0, resetInMs: 45_000, limit: 10 });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("45");
    expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });
});
