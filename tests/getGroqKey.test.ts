import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the InsForge client — cheaper than hitting the network and lets us
// verify the env-first / DB-fallback contract without a running backend.
const singleMock = vi.fn();
vi.mock("@/lib/insforge", () => ({
  insforge: {
    database: {
      from: () => ({
        select: () => ({
          eq: () => ({ single: singleMock }),
        }),
      }),
    },
  },
}));

describe("getGroqKey", () => {
  beforeEach(() => {
    vi.resetModules();
    singleMock.mockReset();
    delete process.env.GROQ_API_KEY;
  });

  it("returns the env var when present without touching the database", async () => {
    process.env.GROQ_API_KEY = "gsk_env";
    const { getGroqKey } = await import("@/lib/getGroqKey");
    expect(await getGroqKey()).toBe("gsk_env");
    expect(singleMock).not.toHaveBeenCalled();
  });

  it("falls back to the settings row when no env var is set", async () => {
    singleMock.mockResolvedValueOnce({ data: { value: "gsk_db" } });
    const { getGroqKey } = await import("@/lib/getGroqKey");
    expect(await getGroqKey()).toBe("gsk_db");
  });

  it("returns an empty string when the settings query throws", async () => {
    singleMock.mockRejectedValueOnce(new Error("db down"));
    const { getGroqKey } = await import("@/lib/getGroqKey");
    expect(await getGroqKey()).toBe("");
  });
});
