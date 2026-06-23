import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import Card from "../components/ui/Card";
import Chip from "../components/ui/Chip";
import { Link } from "react-router-dom";
import { Trophy, Skull, Minus } from "lucide-react";

export default function History() {
  const { session } = useAuth();
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/history`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setMatches);
  }, [session]);

  if (!matches) return <div className="p-6 text-ink-400">Loading history…</div>;

  const breakdown = matches
    ? ["easy", "medium", "hard"].map((d) => {
        const subset = matches.filter((m) => m.difficulty === d);
        return {
          difficulty: d,
          wins: subset.filter((m) => m.youWon).length,
          total: subset.length,
        };
      })
    : [];

  return (
    <div className="max-w-[1120px] mx-auto p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Match History</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          {trend && trend.length > 1 ? (
            <Card className="p-4">
              <p className="text-xs text-ink-400 uppercase mb-3">
                Rating Over Time
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={trend}>
                  <XAxis dataKey="created_at" tick={false} stroke="#232938" />
                  <YAxis
                    tick={{ fill: "#8A93A6", fontSize: 11 }}
                    stroke="#232938"
                    domain={["dataMin - 50", "dataMax + 50"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#12161F",
                      border: "1px solid #232938",
                      borderRadius: 6,
                    }}
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                    formatter={(v) => [v, "Rating"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#7C5CFF"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          ) : (
            trend && (
              <Card className="p-4">
                <p className="text-ink-400 text-sm">
                  Play a few more duels to see your rating trend.
                </p>
              </Card>
            )
          )}
          {matches && matches.length > 0 && (
            <Card className="p-4">
              <p className="text-xs text-ink-400 uppercase mb-3">
                By Difficulty
              </p>
              <div className="flex flex-col gap-3">
                {breakdown
                  .filter((b) => b.total > 0)
                  .map((b) => (
                    <div key={b.difficulty}>
                      <div className="flex justify-between text-sm mb-1">
                        <Chip tone={b.difficulty}>{b.difficulty}</Chip>
                        <span className="text-ink-400">
                          {b.wins}/{b.total} won
                        </span>
                      </div>
                      <div className="h-1.5 bg-base-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-verdict-pass"
                          style={{ width: `${(b.wins / b.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-7 flex flex-col gap-2">
          {matches?.length === 0 && (
            <p className="text-ink-400 text-sm">No completed duels yet.</p>
          )}
          {matches?.map((m) => (
            <Link key={m.id} to={`/duel/${m.id}/result`}>
              <Card
                interactive
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {m.youWon ? (
                    <Trophy size={18} className="text-verdict-pass" />
                  ) : m.result_type === "draw" ? (
                    <Minus size={18} className="text-ink-400" />
                  ) : (
                    <Skull size={18} className="text-verdict-fail" />
                  )}
                  <Avatar
                    seed={m.opponent_username}
                    size={28}
                    className="rounded"
                  />
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
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
