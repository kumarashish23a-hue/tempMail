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
          {siteConfig.name} is a <strong>frontend-only prototype</strong> of a temporary
          email service. It lets you generate disposable email addresses, browse a
          demo inbox with verification codes, and track where each address was used —
          all without a backend, database, or real email delivery.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Demo limitations</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-500 dark:text-slate-400">
          <li>No real emails are received — every message is mock data.</li>
          <li>No accounts, no sign-in, no payments.</li>
          <li>Created addresses are stored only in your browser (localStorage).</li>
          <li>{siteConfig.privacyNotice}</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Built with</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          React + TypeScript + Tailwind CSS + Vite. The service layer in{" "}
          <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">
            src/services/emailService.ts
          </code>{" "}
          is the single place to plug in a real backend later.
        </p>
      </section>
    </div>
  );
}
