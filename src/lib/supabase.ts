import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─── Supabase client ────────────────────────────────────────────────────────
// Reads the project URL and anon key from Vite env vars. Create a `.env` file
// in the project root (it's gitignored) with:
//
//   VITE_SUPABASE_URL=https://your-project.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key
//
// When deployed (Vercel/Netlify), set the same two variables in the host's
// environment settings instead.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when the app has the config it needs to talk to Supabase. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Shared Supabase client, or null when env vars are missing. Service-layer
 * functions check this and throw a friendly error instead of failing oddly.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/** Get the client or throw a beginner-friendly error. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and " +
        "VITE_SUPABASE_ANON_KEY to your .env file (see README).",
    );
  }
  return supabase;
}
