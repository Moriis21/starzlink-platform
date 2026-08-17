// Tiny server-side logger. Levels, scope, JSON output in production,
// human output in dev. Configure with LOG_LEVEL=debug|info|warn|error.
// Not for client code — use ordinary console.* there or wire up a real
// telemetry SDK.

type Level = "debug" | "info" | "warn" | "error";
const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const configured = (process.env.LOG_LEVEL as Level | undefined);
const defaultLevel: Level = process.env.NODE_ENV === "production" ? "warn" : "debug";
const activeLevel = LEVELS[configured ?? defaultLevel] ?? LEVELS[defaultLevel];
const isProd = process.env.NODE_ENV === "production";

function emit(level: Level, scope: string, args: unknown[]) {
  if (LEVELS[level] < activeLevel) return;
  const sink = level === "error" || level === "warn" ? console.error : console.log;
  if (isProd) {
    // JSON line for log aggregators. Non-serialisable args are coerced.
    const payload = args.map((a) => (a instanceof Error ? { message: a.message, stack: a.stack } : a));
    sink(JSON.stringify({ t: new Date().toISOString(), level, scope, args: payload }));
  } else {
    sink(`[${level}] ${scope}:`, ...args);
  }
}

export type Logger = {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

/** Coerce an unknown thrown value to a readable message. */
export function errorMessage(e: unknown, fallback = "Unknown error"): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
}

export function log(scope: string): Logger {
  return {
    debug: (...a) => emit("debug", scope, a),
    info: (...a) => emit("info", scope, a),
    warn: (...a) => emit("warn", scope, a),
    error: (...a) => emit("error", scope, a),
  };
}
