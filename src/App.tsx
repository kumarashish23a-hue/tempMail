import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { siteConfig } from "./config/siteConfig";
import { useTheme } from "./hooks/useTheme";
import { AboutPage } from "./pages/AboutPage";
import { EmailDetailPage } from "./pages/EmailDetailPage";
import { HomePage } from "./pages/HomePage";
import { InboxPage } from "./pages/InboxPage";
import { MyEmailsPage } from "./pages/MyEmailsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { UsagePage } from "./pages/UsagePage";

/** Scroll to top on page change (but keep #create anchor scrolling). */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Layout() {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        theme={theme.effective}
        onToggleTheme={theme.toggle}
      />
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/emails" element={<MyEmailsPage />} />
              <Route path="/email/:id" element={<EmailDetailPage />} />
              <Route path="/usage" element={<UsagePage />} />
              <Route path="/settings" element={<SettingsPage theme={theme} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <footer className="border-t border-slate-200 py-6 dark:border-slate-800">
            <p className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400">
              {siteConfig.name} · {siteConfig.demoNotice} {siteConfig.privacyNotice}
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout />
    </BrowserRouter>
  );
}
