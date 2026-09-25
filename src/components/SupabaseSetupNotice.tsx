import { isSupabaseConfigured } from "../lib/supabase";

/**
 * Friendly banner shown on the home page when the Supabase env vars are
 * missing. Renders nothing once configured.
 */
export function SupabaseSetupNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      <p className="font-semibold">Supabase is not connected yet</p>
      <p className="mt-1">
        Add <code className="font-mono">VITE_SUPABASE_URL</code> and{" "}
        <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to a{" "}
        <code className="font-mono">.env</code> file in the project root — see
        the README&apos;s &ldquo;Connect Supabase&rdquo; section. The app needs
        it to create addresses and load inboxes.
      </p>
    </div>
  );
}
