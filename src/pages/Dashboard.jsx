import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { getSocket } from "../lib/socket";

import Card from "../components/ui/Card";
import Chip from "../components/ui/Chip";
import RankBadge from "../components/ui/RankBadge";
import { Trophy, Skull, Minus, ChevronRight } from "lucide-react";
import Avatar from "../components/ui/Avatar";

export default function Dashboard() {
  const { session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [friends, setFriends] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${session.access_token}` };
    const base = import.meta.env.VITE_BACKEND_URL;
    fetch(`${base}/api/users/me/profile`, { headers })
      .then((r) => r.json())
      .then(setProfile);
    fetch(`${base}/api/history`, { headers })
      .then((r) => r.json())
      .then(setHistory);
    fetch(`${base}/api/friends/online`, { headers })
      .then((r) => r.json())
      .then(setFriends);
  }, [session]);

  useEffect(() => {
    if (!session || !friends) return;

    const socket = getSocket(session.access_token);

    const onChange = ({ userId, online }) => {
      setFriends((prev) =>
        prev?.map((f) => (f.friend_id === userId ? { ...f, online } : f)),
      );
    };

    socket.on("presence:changed", onChange);

    return () => {
      socket.off("presence:changed", onChange);
    };
  }, [session, friends]);

  if (!profile || !history || !friends)
    return <div className="p-8 text-ink-400">Loading dashboard…</div>;

  const winRate =
    profile.wins + profile.losses > 0
      ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
      : 0;
  let streak = 0;
  for (const m of history) {
    if (m.youWon) streak++;
    else break;
  }

  return (
    <div className="max-w-[1120px] mx-auto p-8">
      <header className="flex justify-between items-end mb-8">
        <div>
          <p className="text-ink-400 text-sm mb-1 font-medium">Welcome back,</p>
          <h2 className="font-display text-3xl font-bold">
            {profile.username}
          </h2>
        </div>
        <RankBadge rating={profile.rating} variant="shield" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="font-display text-xl font-semibold mb-2">
              Custom Duel
            </h3>
            <p className="text-ink-400 text-sm mb-6">
              Invite a specific friend to a private arena via link or username
              search.
            </p>
            <button
              disabled
              className="w-full border border-base-700 text-ink-400 py-2.5 rounded-md text-sm font-medium cursor-not-allowed"
              title="Not built in this demo"
            >
              Create Invite Link
            </button>
          </Card>

          <Card className="p-6 grid grid-cols-3 gap-4 divide-x divide-base-700">
            <div className="text-center">
              <p className="text-ink-400 text-[11px] uppercase tracking-wider mb-1">
                Duels
              </p>
              <p className="font-mono text-xl font-semibold">
                {profile.wins + profile.losses}
              </p>
            </div>
            <div className="text-center">
              <p className="text-ink-400 text-[11px] uppercase tracking-wider mb-1">
                Win Rate
              </p>
              <p className="font-mono text-xl font-semibold text-verdict-pass">
                {winRate}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-ink-400 text-[11px] uppercase tracking-wider mb-1">
                Streak
              </p>
              <p className="font-mono text-xl font-semibold text-verdict-warn">
                {streak}
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-xs text-ink-400 font-semibold tracking-wide uppercase mb-4">
              Friends
            </h3>
            {friends.length === 0 ? (
              <p className="text-ink-400 text-sm">
                No friends yet — add some from the Friends page.
              </p>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {friends.map((f) => (
                  <div
                    key={f.friend_id}
                    className="relative"
                    title={f.username}
                  >
                    <Avatar seed={f.username} size={40} className="rounded" />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-base-900 ${f.online ? "bg-verdict-pass" : "bg-ink-400"}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="flex flex-col">
            <div className="p-6 border-b border-base-700 flex justify-between items-center">
              <h3 className="font-display text-xl font-semibold">
                Recent Duels
              </h3>
              <Link
                to="/history"
                className="text-sm text-ink-400 hover:text-ink-100 flex items-center gap-1"
              >
                Full history <ChevronRight size={16} />
              </Link>
            </div>
            <div className="p-2">
              {history.length === 0 && (
                <p className="text-ink-400 text-sm p-4">
                  No completed duels yet.
                </p>
              )}
              {history.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  to={`/duel/${m.id}/result`}
                  className="flex items-center justify-between p-4 hover:bg-base-800 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {m.youWon ? (
                      <Trophy size={18} className="text-verdict-pass" />
                    ) : m.result_type === "draw" ? (
                      <Minus size={18} className="text-ink-400" />
                    ) : (
                      <Skull size={18} className="text-verdict-fail" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {m.problem_title}{" "}
                        <span className="text-ink-400 font-normal">
                          vs {m.opponent_username}
                        </span>
                      </p>
                      <p className="text-xs text-ink-400">
                        {new Date(m.ended_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Chip tone={m.difficulty}>{m.difficulty}</Chip>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
