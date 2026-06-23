import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import Card from "../components/ui/Card";
import Chip from "../components/ui/Chip";
import Avatar from "../components/ui/Avatar";
import RankBadge from "../components/ui/RankBadge";
import { Trophy } from "lucide-react";

export default function Problems() {
  const { session } = useAuth();
  const [tab, setTab] = useState("problems");
  const [problems, setProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/problems`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setProblems);
  }, [session]);

  useEffect(() => {
    if (tab !== "leaderboard" || leaderboard) return;
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/leaderboard`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setLeaderboard);
  }, [tab, session, leaderboard]);

  const visible =
    filter === "all"
      ? problems
      : problems.filter((p) => p.difficulty === filter);

  return (
    <div className="max-w-[1120px] mx-auto p-8">
      <div className="flex gap-2 border-b border-base-700 mb-6">
        {["problems", "leaderboard"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-brand-500 text-ink-100" : "border-transparent text-ink-400"}`}
          >
            {t === "problems" ? "Problems" : "Leaderboard"}
          </button>
        ))}
      </div>

      {tab === "problems" && (
        <>
          <div className="flex gap-2 mb-4">
            {["all", "easy", "medium", "hard"].map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-3 py-1 rounded-full text-xs uppercase font-mono border ${filter === d ? "border-brand-500 text-brand-400" : "border-base-700 text-ink-400"}`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visible.map((p) => (
              <Card
                key={p.id}
                className="p-4 flex justify-between items-center"
              >
                <span>{p.title}</span>
                <Chip tone={p.difficulty}>{p.difficulty}</Chip>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "leaderboard" &&
        (!leaderboard ? (
          <p className="text-ink-400 text-sm">Loading leaderboard…</p>
        ) : (
          <>
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {leaderboard.slice(0, 3).map((u) => (
                  <Card
                    key={u.username}
                    className="p-5 flex flex-col items-center gap-2 text-center"
                  >
                    <Trophy
                      size={18}
                      className={
                        u.rank === 1
                          ? "text-verdict-warn"
                          : u.rank === 2
                            ? "text-ink-100"
                            : "text-amber-700"
                      }
                    />
                    <Avatar seed={u.username} size={48} className="rounded" />
                    <span className="text-sm font-medium">{u.username}</span>
                    <RankBadge rating={u.rating} />
                  </Card>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {(leaderboard.length >= 3
                ? leaderboard.slice(3)
                : leaderboard
              ).map((u) => (
                <Card
                  key={u.username}
                  className="p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm w-6 text-center text-ink-400">
                      {u.rank}
                    </span>
                    <Avatar seed={u.username} size={32} className="rounded" />
                    <span className="text-sm">{u.username}</span>
                  </div>
                  <RankBadge rating={u.rating} />
                </Card>
              ))}
            </div>
          </>
        ))}
    </div>
  );
}
