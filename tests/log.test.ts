import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { errorMessage } from "@/lib/log";

describe("errorMessage", () => {
  it("returns the message of an Error instance", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns a plain string as-is", () => {
    expect(errorMessage("bad thing happened")).toBe("bad thing happened");
  });

  it("falls back to the provided default for unknown shapes", () => {
    expect(errorMessage({ some: "object" }, "fallback")).toBe("fallback");
    expect(errorMessage(null, "fallback")).toBe("fallback");
    expect(errorMessage(undefined, "fallback")).toBe("fallback");
  });

  it("uses 'Unknown error' when no fallback is supplied", () => {
    expect(errorMessage({})).toBe("Unknown error");
  });
});

describe("log()", () => {
  const originalEnv = process.env.NODE_ENV;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    // @ts-expect-error — restore original
    process.env.NODE_ENV = originalEnv;
  });

  it("routes errors to console.error", async () => {
    const { log } = await import("@/lib/log");
    log("test").error("something failed");
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
