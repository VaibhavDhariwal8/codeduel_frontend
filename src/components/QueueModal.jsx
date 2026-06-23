import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { getSocket } from "../lib/socket";
import { Radar, Check } from "lucide-react";
import { useEscToClose } from "../lib/useEscToClose";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Avatar from "./ui/Avatar";

function MatchFoundCeremony({ opponent, session, onComplete }) {
  const [step, setStep] = useState("slide");
  const [count, setCount] = useState(3);
  const [me, setMe] = useState(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/profile`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setMe);
  }, [session]);

  useEffect(() => {
    const slideMs = reduced ? 150 : 400;
    const timers = [
      setTimeout(() => setStep("vs"), slideMs),
      setTimeout(() => setStep("count"), slideMs + 500),
      setTimeout(() => setCount(2), slideMs + 1100),
      setTimeout(() => setCount(1), slideMs + 1700),
      setTimeout(onComplete, slideMs + 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const slid = step !== "slide";
  const avatarBase = `w-16 h-16 rounded-full bg-base-800 flex items-center justify-center font-display text-xl font-bold border-2 ${reduced ? "transition-opacity duration-150" : "transition-all duration-[400ms] ease-out"}`;

  return (
    <div className="flex flex-col items-center gap-8 py-4 overflow-hidden">
      <div className="flex items-center justify-center gap-6">
        <div
          className={`${avatarBase} border-brand-500`}
          style={
            reduced
              ? { opacity: slid ? 1 : 0 }
              : {
                  transform: slid ? "translateX(0)" : "translateX(-60px)",
                  opacity: slid ? 1 : 0,
                }
          }
        >
          <Avatar
            seed={me?.username || "you"}
            size={56}
            className="rounded-full"
          />
        </div>
        <span
          className={`font-display text-2xl font-bold text-brand-400 transition-opacity duration-200 ${step === "slide" ? "opacity-0" : "opacity-100"}`}
        >
          VS
        </span>
        <div
          className={`${avatarBase} border-verdict-fail`}
          style={
            reduced
              ? { opacity: slid ? 1 : 0 }
              : {
                  transform: slid ? "translateX(0)" : "translateX(60px)",
                  opacity: slid ? 1 : 0,
                }
          }
        >
          <Avatar
            seed={opponent?.username || "opponent"}
            size={56}
            className="rounded-full"
          />
        </div>
      </div>
      <div className="h-16 flex items-center">
        {step === "count" ? (
          <p className="font-display text-6xl font-bold text-ink-100 tabular-nums">
            {count}
          </p>
        ) : (
          <p className="text-ink-400 text-sm">
            vs @{opponent?.username} ({opponent?.rating})
          </p>
        )}
      </div>
    </div>
  );
}

export default function QueueModal({ open, onClose }) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("idle");
  const [difficulty, setDifficulty] = useState("any");
  const [elapsed, setElapsed] = useState(0);
  const [foundInfo, setFoundInfo] = useState(null);
  const [pendingMatchId, setPendingMatchId] = useState(null);

  useEscToClose(phase === "idle", onClose);

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      setElapsed(0);
      return;
    }
    const socket = getSocket(session.access_token);
    const onFound = ({ matchId, opponent }) => {
      setPhase("found");
      setFoundInfo(opponent);
      setPendingMatchId(matchId);
    };
    socket.on("match:found", onFound);
    return () => socket.off("match:found", onFound);
  }, [open, session, navigate, onClose]);

  useEffect(() => {
    if (phase !== "searching") return;
    const start = Date.now();
    const t = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, [phase]);

  function startSearch() {
    setPhase("searching");
    setElapsed(0);
    getSocket(session.access_token).emit("queue:join", { difficulty });
  }
  function cancelSearch() {
    getSocket(session.access_token).emit("queue:leave");
    setPhase("idle");
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-base-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {phase === "idle" && (
          <>
            <h3 className="font-display text-2xl font-bold mb-4">
              Find a Duel
            </h3>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-base-800 border border-base-700 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="any">Any difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={startSearch}>
                Start Search
              </Button>
            </div>
          </>
        )}
        {phase === "searching" && (
          <>
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-base-700" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Radar size={32} className="text-brand-500" />
              </div>
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">
              Searching for opponent
            </h3>
            <p className="font-mono text-ink-400 text-sm mb-6">
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            </p>
            <div className="bg-base-800 border border-base-700 rounded p-3 text-xs text-ink-400 mb-6 text-left">
              <span className="block mb-1">
                Difficulty:{" "}
                <strong className="text-ink-100">
                  {difficulty === "any" ? "Any" : difficulty}
                </strong>
              </span>
              <span>
                Rating band:{" "}
                <strong className="text-ink-100">
                  ±{100 + Math.floor(elapsed / 20) * 100}
                </strong>
              </span>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={cancelSearch}
            >
              Cancel Search
            </Button>
          </>
        )}
        {phase === "found" && (
          <MatchFoundCeremony
            opponent={foundInfo}
            session={session}
            onComplete={() => {
              onClose();
              navigate(`/duel/${pendingMatchId}`);
            }}
          />
        )}
      </Card>
    </div>
  );
}
