import { insforge } from "@/lib/insforge";

// Shared server-side Groq key resolver. Prefers env var, falls back to the
// InsForge `settings` table. Cached in memory per instance so we don't hit
// the DB on every request.
let cached: string | null = null;

export async function getGroqKey(): Promise<string> {
  if (process.env.GROQ_API_KEY) return process.env.GROQ_API_KEY;
  if (cached) return cached;
  try {
    const { data } = await insforge.database
      .from("settings")
      .select("value")
      .eq("key", "groq_api_key")
      .single();
    const value = (data as { value?: string } | null)?.value ?? "";
    cached = value || null;
    return value;
  } catch {
    return "";
  }
}
