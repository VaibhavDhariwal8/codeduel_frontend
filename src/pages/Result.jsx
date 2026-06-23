import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import Button from "../components/ui/Button";
import { getSocket } from "../lib/socket";
import AutopsyPanel from "../components/AutopsyPanel";
import { useEscToClose } from "../lib/useEscToClose";

function AnimatedDelta({ delta }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / 600);
      setDisplay(Math.round(delta * progress));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [delta]);
  const colorClass =
    display > 0
      ? "text-verdict-pass"
      : display < 0
        ? "text-verdict-fail"
        : "text-ink-400";
  return (
    <span className={`font-mono text-2xl font-semibold ${colorClass}`}>
      {display >= 0 ? "+" : ""}
      {display}
    </span>
  );
}

export default function Result() {
  const { matchId } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("summary");
  const [failed, setFailed] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("suspected_cheating");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const [rematchState, setRematchState] = useState("idle");

  const [autopsy, setAutopsy] = useState(null);
  const [autopsyLoading, setAutopsyLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEscToClose(showReport, () => setShowReport(false));

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function loadAutopsy() {
    if (autopsy) return;
    setAutopsyLoading(true);
    fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/matches/${matchId}/autopsy`,
      { headers: { Authorization: `Bearer ${session.access_token}` } },
    )
      .then((r) => r.json())
      .then((d) => {
        setAutopsy(d);
        setAutopsyLoading(false);
      });
  }

  async function submitReport() {
    try {
      setReporting(true);

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reportedUserId: data.opponent.id,
          matchId,
          reason: reportReason,
          details: reportDetails,
        }),
      });

      setShowReport(false);
      setReportDetails("");
    } finally {
      setReporting(false);
    }
  }

  function requestRematch() {
    getSocket(session.access_token).emit("rematch:request", {
      matchId,
    });

    setRematchState("requested");
  }

  function acceptRematch() {
    getSocket(session.access_token).emit("rematch:accept", {
      matchId,
    });
  }

  function declineRematch() {
    getSocket(session.access_token).emit("rematch:decline", {
      matchId,
    });

    setRematchState("declined");
  }

  useEffect(() => {
    let attempts = 0;
    function load() {
      fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/matches/${matchId}/result`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        },
      ).then(async (r) => {
        if (r.status === 409 && attempts++ < 5) return setTimeout(load, 400); // covers AppFlow §7's brief race condition
        if (!r.ok) return setFailed(true);
        setData(await r.json());
      });
    }
    load();
  }, [matchId, session]);

  useEffect(() => {
    const socket = getSocket(session.access_token);

    socket.emit("duel:join", {
      matchId,
    });
  }, [matchId, session]);

  useEffect(() => {
    const socket = getSocket(session.access_token);

    const onRematchRequested = ({ fromUserId }) => {
      console.log("REMATCH REQUEST RECEIVED", fromUserId);

      if (fromUserId !== session.user.id) {
        setRematchState("incoming");
      }
    };

    const onRematchDeclined = () => {
      console.log("REMATCH DECLINED RECEIVED");
      setRematchState("declined");
    };

    const onRematchAccepted = ({ matchId: newId }) => {
      console.log("REMATCH ACCEPTED RECEIVED", newId);
      navigate(`/duel/${newId}`);
    };

    socket.on("rematch:requested", onRematchRequested);
    socket.on("rematch:accepted", onRematchAccepted);
    socket.on("rematch:declined", onRematchDeclined);

    return () => {
      socket.off("rematch:requested", onRematchRequested);
      socket.off("rematch:accepted", onRematchAccepted);
      socket.off("rematch:declined", onRematchDeclined);
    };
  }, [session, navigate]);

  useEffect(() => {
    if (data) {
      requestAnimationFrame(() => setMounted(true));
    }
  }, [data]);

  if (failed) {
    navigate("/dashboard");
    return null;
  }
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-400">
        Loading result…
      </div>
    );

  const banner = data.isDraw
    ? { text: "Draw.", cls: "bg-base-800 text-ink-100" }
    : data.youWon
      ? {
          text:
            data.resultType === "forfeit" ? "You won by forfeit." : "You won!",
          cls: "bg-verdict-pass text-base-950",
        }
      : {
          text:
            data.resultType === "forfeit"
              ? "You lost by forfeit."
              : "You lost.",
          cls: "bg-verdict-fail text-base-950",
        };

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 px-4">
      <div
        className={`rounded-md px-6 py-2 font-display text-xl font-semibold mb-6 ${banner.cls}`}
      >
        {banner.text}
      </div>
      <div
        className="bg-base-900 border border-base-700 rounded-lg w-full max-w-2xl p-6 flex flex-col gap-6 transition-all duration-300 ease-out"
        style={
          reduced
            ? {
                opacity: mounted ? 1 : 0,
              }
            : {
                transform: mounted ? "translateY(0)" : "translateY(24px)",
                opacity: mounted ? 1 : 0,
              }
        }
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-ink-400 uppercase mb-1">Time Taken</p>
            <p className="font-mono text-lg">
              {data.timeTakenSec != null
                ? `${Math.floor(data.timeTakenSec / 60)}:${String(data.timeTakenSec % 60).padStart(2, "0")}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400 uppercase mb-1">Tests Passed</p>
            <p className="font-mono text-lg">
              {data.you.submission?.tests_passed ?? 0}/
              {data.you.submission?.tests_total ?? "?"} vs{" "}
              {data.opponent.submission?.tests_passed ?? 0}/
              {data.opponent.submission?.tests_total ?? "?"}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-400 uppercase mb-1">Rating Change</p>
            <AnimatedDelta delta={data.you.ratingDelta} />
            <p className="text-xs text-ink-400 mt-1">
              new rating: {data.you.rating}
            </p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-base-700">
          {["summary", "yours", "opponent", "coach"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t === "coach") loadAutopsy();
              }}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-brand-500 text-ink-100" : "border-transparent text-ink-400"}`}
            >
              {t === "summary"
                ? "Summary"
                : t === "yours"
                  ? "Your Code"
                  : t === "opponent"
                    ? "Opponent's Code"
                    : "AI Coach"}
            </button>
          ))}
        </div>

        {tab === "summary" && (
          <p className="text-ink-400 text-sm">
            {data.problem.title} · {data.problem.difficulty} · vs{" "}
            {data.opponent.username}
          </p>
        )}
        {tab === "yours" && (
          <pre className="font-mono text-sm bg-base-950 border border-base-700 rounded p-3 overflow-x-auto whitespace-pre">
            {data.you.submission?.code || "No submission."}
          </pre>
        )}
        {tab === "opponent" && (
          <pre className="font-mono text-sm bg-base-950 border border-base-700 rounded p-3 overflow-x-auto whitespace-pre">
            {data.opponent.submission?.code || "No submission."}
          </pre>
        )}
        {tab === "coach" &&
          (autopsyLoading || !autopsy ? (
            <p className="text-ink-400 text-sm">Reviewing your approach…</p>
          ) : autopsy.unavailable ? (
            <p className="text-ink-400 text-sm">{autopsy.reason}</p>
          ) : (
            <AutopsyPanel autopsy={autopsy} />
          ))}

        <div className="flex gap-2 flex-wrap">
          {rematchState === "idle" && (
            <Button variant="secondary" onClick={requestRematch}>
              Rematch
            </Button>
          )}

          {rematchState === "requested" && (
            <Button variant="secondary" disabled>
              Waiting for opponent...
            </Button>
          )}

          {rematchState === "declined" && (
            <Button variant="secondary" disabled>
              Declined
            </Button>
          )}

          {rematchState === "incoming" && (
            <div className="flex gap-2">
              <Button onClick={acceptRematch}>Accept Rematch</Button>

              <Button variant="secondary" onClick={declineRematch}>
                Decline
              </Button>
            </div>
          )}

          <Button
            onClick={async () => {
              await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({
                    username: data.opponent.username,
                  }),
                },
              );
            }}
          >
            Add Friend
          </Button>

          <Button variant="secondary" onClick={() => setShowReport(true)}>
            Report
          </Button>

          <Button className="ml-auto" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
      {showReport && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReport(false);
            }
          }}
        >
          <div className="bg-base-900 border border-base-700 rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold">
              Report {data.opponent.username}
            </h2>

            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="bg-base-800 border border-base-700 rounded px-3 py-2"
            >
              <option value="suspected_cheating">
                Cheating / suspected bot
              </option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>

            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Additional details (optional)"
              className="bg-base-800 border border-base-700 rounded px-3 py-2 h-24 resize-none"
            />

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowReport(false)}>
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={submitReport}
                disabled={reporting}
              >
                {reporting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
