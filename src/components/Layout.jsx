import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  LayoutDashboard,
  Swords,
  Users,
  History,
  ChevronDown,
  LogOut,
} from "lucide-react";
import Button from "./ui/Button";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="flex h-screen">
      <nav className="w-56 bg-base-900 border-r border-base-700 flex flex-col p-4 gap-1">
        <Link
          to="/dashboard"
          className="font-display text-xl font-bold mb-6 text-ink-100"
        >
          CodeDuel
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-base-800 text-sm text-ink-100 transition-colors"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <Link to="/dashboard" className="mt-1 mb-2">
          <Button className="w-full flex items-center justify-center gap-2">
            <Swords size={16} />
            Quick Match
          </Button>
        </Link>

        <Link
          to="/friends"
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-base-800 text-sm text-ink-100 transition-colors"
        >
          <Users size={16} />
          Friends
        </Link>

        <span
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-ink-400 cursor-not-allowed"
          title="Wired on Day 11"
        >
          <History size={16} />
          History
        </span>

        <div className="mt-auto relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-base-800 text-sm text-ink-100 transition-colors"
          >
            Account
            <ChevronDown
              size={14}
              className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full mb-1 w-full bg-base-800 border border-base-700 rounded-md shadow-xl overflow-hidden">
              <span
                className="block px-3 py-2 text-sm text-ink-400 cursor-not-allowed"
                title="Wired on Day 11"
              >
                My Profile
              </span>

              <span
                className="block px-3 py-2 text-sm text-ink-400 cursor-not-allowed"
                title="Wired on Day 11"
              >
                Settings
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-verdict-fail hover:bg-base-700 transition-colors"
              >
                <LogOut size={14} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-base-950">{children}</main>
    </div>
  );
}
