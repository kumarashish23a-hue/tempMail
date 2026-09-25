import { siteConfig } from "../config/siteConfig";

/** Route /about — what this prototype is and isn't. */
export function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        About {siteConfig.name}
      </h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">What is this?</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {siteConfig.name} is a temporary email service prototype. It lets you
          generate disposable email addresses, browse their inbox with
          verification codes, and track where each address was used — backed by
          Supabase (Postgres) instead of a custom server.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Current limitations</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-500 dark:text-slate-400">
          <li>No real emails are received yet — connect a domain and an inbound email service webhook (see README) to receive actual mail.</li>
          <li>No accounts, no sign-in, no payments.</li>
          <li>Addresses are stored in Supabase; your browser only remembers which ones you created.</li>
          <li>{siteConfig.privacyNotice}</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Built with</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          React + TypeScript + Tailwind CSS + Vite, with Supabase (Postgres) as
          the backend. The service layer in{" "}
          <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">
            src/services/emailService.ts
          </code>{" "}
          is the single place where all database calls live.
        </p>
      </section>
    </div>
  );
}
