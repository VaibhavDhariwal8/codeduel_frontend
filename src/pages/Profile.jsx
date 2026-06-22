import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import Card from "../components/ui/Card";
import Chip from "../components/ui/Chip";
import RankBadge from "../components/ui/RankBadge";
import { Trophy, Skull, Minus } from "lucide-react";

export default function Profile() {
  const { identifier = "me" } = useParams();
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setData(null);
    setNotFound(false);
    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/${identifier}/profile`,
      {
        headers: { Authorization: `Bearer ${session.access_token}` },
      },
    ).then(async (r) => {
      if (!r.ok) return setNotFound(true);
      setData(await r.json());
    });
  }, [identifier, session]);

  if (notFound) return <div className="p-6 text-ink-400">User not found.</div>;
  if (!data) return <div className="p-6 text-ink-400">Loading profile…</div>;
  const winRate =
    data.wins + data.losses > 0
      ? Math.round((data.wins / (data.wins + data.losses)) * 100)
      : 0;

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-base-800 flex items-center justify-center font-display text-2xl">
          {data.username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">
            {data.username}
            {data.isOwnProfile && (
              <span className="text-ink-400 text-sm font-normal ml-2">
                (you)
              </span>
            )}
          </h1>
          <RankBadge rating={data.rating} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xs text-ink-400 uppercase mb-1">Wins</p>
          <p className="font-mono text-xl text-verdict-pass">{data.wins}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-ink-400 uppercase mb-1">Losses</p>
          <p className="font-mono text-xl text-verdict-fail">{data.losses}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-ink-400 uppercase mb-1">Win Rate</p>
          <p className="font-mono text-xl">{winRate}%</p>
        </Card>
      </div>
      <div>
        <p className="text-xs text-ink-400 uppercase mb-2">Recent Matches</p>
        {data.recentMatches.length === 0 && (
          <p className="text-ink-400 text-sm">No matches yet.</p>
        )}
        <div className="flex flex-col gap-2">
          {data.recentMatches.map((m) => (
            <Card key={m.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {m.winner_id === data.id ? (
                  <Trophy size={16} className="text-verdict-pass" />
                ) : m.result_type === "draw" ? (
                  <Minus size={16} className="text-ink-400" />
                ) : (
                  <Skull size={16} className="text-verdict-fail" />
                )}
                <div>
                  <p className="text-sm">
                    {m.problem_title}{" "}
                    <span className="text-ink-400">
                      vs {m.opponent_username}
                    </span>
                  </p>
                  <p className="text-xs text-ink-400">
                    {new Date(m.ended_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Chip>{m.result_type}</Chip>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
