import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { EmailGenerator } from "../components/EmailGenerator";
import { SupabaseSetupNotice } from "../components/SupabaseSetupNotice";
import { siteConfig } from "../config/siteConfig";

const FEATURES = [
  {
    title: "Create temporary emails",
    text: "Generate a disposable address in one click and choose how long it stays active — 10 minutes to 24 hours.",
  },
  {
    title: "Receive verification emails & OTPs",
    text: "Codes and sign-up emails land in a demo inbox instantly, with verification codes highlighted for easy copying.",
  },
  {
    title: "See where it was used",
    text: "Keep a simple list of the websites each temporary address was used on — stored in Supabase.",
  },
];

/** Landing page: hero, email generator card, and feature overview. */
export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // The header's "Create Email" button links to /#create — scroll to the card.
  useEffect(() => {
    if (location.hash === "#create") {
      document.getElementById("create")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="pt-8 text-center sm:pt-12">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          {siteConfig.tagline}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500 dark:text-slate-400">
          {siteConfig.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#create"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Create Temporary Email
          </a>
          <Link
            to="/inbox"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Open Inbox
          </Link>
        </div>
      </section>

      {/* Generator card */}
      <section id="create" className="mx-auto max-w-2xl scroll-mt-24 space-y-4">
        <SupabaseSetupNotice />
        <EmailGenerator onCreated={(account) => navigate(`/email/${account.id}`)} />
      </section>

      {/* Features */}
      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Notices */}
      <section className="mx-auto max-w-2xl space-y-2 text-center text-sm text-slate-400">
        <p>{siteConfig.privacyNotice}</p>
        <p className="font-medium">{siteConfig.demoNotice}</p>
      </section>
    </div>
  );
}
