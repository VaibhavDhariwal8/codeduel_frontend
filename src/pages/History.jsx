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
  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-2">
      <h1 className="font-display text-2xl font-bold mb-2">Match History</h1>
      {matches.length === 0 && (
        <p className="text-ink-400 text-sm">No completed duels yet.</p>
      )}
      {matches.map((m) => (
        <Link key={m.id} to={`/duel/${m.id}/result`}>
          <Card
            interactive
            className="p-4 flex items-center justify-between mb-2"
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
          </Card>
        </Link>
      ))}
    </div>
  );
}
