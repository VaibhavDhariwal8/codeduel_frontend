import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { getSocket } from "../lib/socket";

export default function Lobby() {
  const { session } = useAuth();
  const navigate = useNavigate();

  const [searching, setSearching] = useState(false);
  const [difficulty, setDifficulty] = useState("any");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!session) return;

    const socket = getSocket(session.access_token);

    socket.on("match:found", ({ matchId }) => {
      navigate(`/duel/${matchId}`);
    });

    return () => {
      socket.off("match:found");
    };
  }, [session, navigate]);

  useEffect(() => {
    if (!searching) return;

    const start = Date.now();

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [searching]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="font-display text-3xl font-bold">CodeDuel</h1>

      {!searching ? (
        <>
          <select
            className="bg-base-800 border border-base-700 rounded-md px-3 py-2"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="any">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button
            onClick={() => {
              setSearching(true);
              setElapsed(0);

              getSocket(session.access_token).emit("queue:join", {
                difficulty,
              });
            }}
            className="bg-brand-500 px-6 py-3 rounded-md font-medium"
          >
            Quick Match
          </button>
        </>
      ) : (
        <>
          <p className="font-mono text-verdict-warn">Searching... {elapsed}s</p>

          <button
            onClick={() => {
              getSocket(session.access_token).emit("queue:leave");

              setSearching(false);
            }}
            className="border border-base-700 px-6 py-3 rounded-md"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
