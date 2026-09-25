/** Small spinner shown while data loads from Supabase. */
export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div
      className="flex items-center justify-center gap-3 py-16"
      role="status"
      aria-live="polite"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}
