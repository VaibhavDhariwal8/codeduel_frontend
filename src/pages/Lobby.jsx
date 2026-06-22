import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { getSocket } from "../lib/socket";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { Swords } from "lucide-react";

export default function Lobby() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);
  const [difficulty, setDifficulty] = useState("any");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const socket = getSocket(session.access_token);
    socket.on("match:found", ({ matchId }) => navigate(`/duel/${matchId}`));
    return () => socket.off("match:found");
  }, [session, navigate]);

  useEffect(() => {
    if (!searching) return;
    const start = Date.now();
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, [searching]);

  return (
    <div className="min-h-full flex items-center justify-center">
      <Card className="p-8 w-96 flex flex-col items-center gap-5">
        <div className="flex items-center gap-2 text-brand-400">
          <Swords size={26} />
          <h1 className="font-display text-2xl font-bold text-ink-100">
            Find a Duel
          </h1>
        </div>
        {!searching ? (
          <>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-base-800 border border-base-700 rounded-md px-3 py-2 text-sm text-ink-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-shadow"
            >
              <option value="any">Any difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                setSearching(true);
                setElapsed(0);
                getSocket(session.access_token).emit("queue:join", {
                  difficulty,
                });
              }}
            >
              <Swords size={16} /> Quick Match
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-verdict-warn animate-pulse" />
              <p className="font-mono text-verdict-warn">
                Searching... {elapsed}s
              </p>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                getSocket(session.access_token).emit("queue:leave");
                setSearching(false);
              }}
            >
              Cancel
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
