import { NavLink } from "react-router-dom";
import { siteConfig } from "../config/siteConfig";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.9 5.3a2 2 0 002.2 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </span>
        <span className="text-lg font-bold text-slate-900 dark:text-white">{siteConfig.name}</span>
      </div>

      <nav className="space-y-1">
        {siteConfig.nav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass} onClick={onNavigate}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="my-4 border-t border-slate-200 dark:border-slate-800" />

      <nav className="space-y-1">
        {siteConfig.secondaryNav.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass} onClick={onNavigate}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <p className="mt-auto px-2 pt-6 text-xs text-slate-400 dark:text-slate-500">
        {siteConfig.demoNotice}
      </p>
    </div>
  );
}

/**
 * Desktop sidebar + mobile drawer (hamburger menu).
 * Navigation items come from siteConfig so they stay in one place.
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop: always visible on large screens */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-950">
        <SidebarContent onNavigate={() => {}} />
      </aside>

      {/* Mobile: slide-in drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl dark:bg-slate-950">
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
