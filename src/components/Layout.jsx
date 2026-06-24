import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  LayoutDashboard,
  Swords,
  Users,
  Code2,
  History as HistoryIcon,
  ChevronDown,
  LogOut,
} from "lucide-react";
import Button from "./ui/Button";
import QueueModal from "./QueueModal";

function getPageTitle(pathname) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/friends") return "Friends";
  if (pathname === "/problems") return "Problems";
  if (pathname === "/history") return "Match History";
  if (pathname.startsWith("/profile/")) return "Profile";
  if (pathname.endsWith("/result")) return "Result";
  return "CodeDuel";
}

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
      ${location.pathname === to ? "bg-brand-500/10 text-brand-400 border border-brand-500/30" : "text-ink-100 hover:bg-base-800"}`}
    >
      <Icon size={16} /> {label}
    </Link>
  );

  return (
    <div className="flex h-screen">
      <nav className="w-56 bg-base-900 border-r border-base-700 flex flex-col p-4 gap-1">
        <Link
          to="/dashboard"
          className="font-display text-xl font-bold mb-6 text-ink-100"
        >
          CodeDuel
        </Link>
        {navLink("/dashboard", "Dashboard", LayoutDashboard)}
        <Button
          onClick={() => setQueueOpen(true)}
          className="w-full flex items-center justify-center gap-2 mt-1 mb-2"
        >
          <Swords size={16} /> Quick Match
        </Button>
        {navLink("/friends", "Friends", Users)}
        {navLink("/problems", "Problems", Code2)}
        {navLink("/history", "History", HistoryIcon)}
        <div className="mt-auto relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-base-800 text-sm text-ink-100 transition-colors"
          >
            Account{" "}
            <ChevronDown
              size={14}
              className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>
          {menuOpen && (
            <div className="absolute bottom-full mb-1 w-full bg-base-800 border border-base-700 rounded-md shadow-xl overflow-hidden">
              <Link
                to="/profile/me"
                className="block px-3 py-2 text-sm text-ink-100 hover:bg-base-700 transition-colors"
              >
                My Profile
              </Link>
              <span
                className="block px-3 py-2 text-sm text-ink-400 cursor-not-allowed"
                title="Not built in this demo — out of scope for v1"
              >
                Settings
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-verdict-fail hover:bg-base-700 transition-colors"
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-base-700 px-6 py-3 bg-base-900/50">
          <p className="font-display text-sm font-medium text-ink-400">
            {getPageTitle(location.pathname)}
          </p>
        </header>
        <main className="flex-1 overflow-y-auto bg-base-950 flex flex-col">
          <div className="flex-1">{children}</div>
          <footer className="border-t border-base-700 px-6 py-4 text-xs text-ink-400 flex items-center justify-between flex-wrap gap-2">
            <span>CodeDuel • Practice, Compete, Improve</span>
            <div className="flex items-center gap-4">
              <span className="font-mono">
                React · Node · Supabase · Gemini
              </span>
              <a
                href="https://github.com/VaibhavDhariwal8/codeduel_frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink-100 transition-colors"
              >
                GitHub
              </a>
            </div>
          </footer>
        </main>
      </div>
      <QueueModal open={queueOpen} onClose={() => setQueueOpen(false)} />
    </div>
  );
}
