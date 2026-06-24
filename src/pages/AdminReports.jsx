import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { ShieldX } from "lucide-react";

export default function AdminReports() {
  const { session } = useAuth();
  const [reports, setReports] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    const r = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/reports`,
      { headers: { Authorization: `Bearer ${session.access_token}` } },
    );
    if (r.status === 403) return setForbidden(true);
    setReports(await r.json());
  }
  useEffect(() => {
    load();
  }, [session]);

  async function act(id, action) {
    setBusyId(id);
    await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/reports/${id}/${action}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      },
    );
    setBusyId(null);
    load();
  }

  if (forbidden)
    return (
      <div className="p-8">
        <Card className="p-6 text-center text-ink-400">
          You don't have access to this page.
        </Card>
      </div>
    );
  if (!reports) return <div className="p-8 text-ink-400">Loading reports…</div>;

  return (
    <div className="max-w-[900px] mx-auto p-8">
      <h1 className="font-display text-2xl font-bold mb-6">Report Queue</h1>
      {reports.length === 0 && (
        <p className="text-ink-400 text-sm">No open reports. Nice and quiet.</p>
      )}
      <div className="flex flex-col gap-4">
        {reports.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar
                  seed={r.reported_username}
                  size={40}
                  className="rounded"
                />
                <div>
                  <p className="font-medium">
                    {r.reported_username}{" "}
                    <span className="text-ink-400 font-normal">
                      reported by {r.reporter_username}
                    </span>
                  </p>
                  <p className="text-xs text-ink-400">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="text-xs uppercase font-mono text-verdict-warn border border-verdict-warn/30 bg-verdict-warn/10 px-2 py-0.5 rounded-full">
                {r.reason.replace("_", " ")}
              </span>
            </div>
            {r.details && (
              <p className="text-sm text-ink-400 mb-3 italic">"{r.details}"</p>
            )}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-base-950 border border-base-700 rounded p-2 text-center">
                <p className="text-[10px] text-ink-400 uppercase">
                  Reports vs user
                </p>
                <p className="font-mono text-sm">
                  {r.totalReports}{" "}
                  <span className="text-ink-400">
                    ({r.distinctReporters} people)
                  </span>
                </p>
              </div>
              <div
                className={`bg-base-950 border rounded p-2 text-center ${r.flaggedCount > 0 ? "border-verdict-fail/50" : "border-base-700"}`}
              >
                <p className="text-[10px] text-ink-400 uppercase">
                  Code matches flagged
                </p>
                <p
                  className={`font-mono text-sm ${r.flaggedCount > 0 ? "text-verdict-fail" : ""}`}
                >
                  {r.flaggedCount}
                </p>
              </div>
              <div className="bg-base-950 border border-base-700 rounded p-2 text-center">
                <p className="text-[10px] text-ink-400 uppercase">
                  Head-to-head
                </p>
                <p className="font-mono text-sm">
                  {r.headToHead.reported_wins}/{r.headToHead.games_played} won
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                disabled={busyId === r.id}
                onClick={() => act(r.id, "dismiss")}
              >
                Dismiss
              </Button>
              <Button
                variant="danger"
                disabled={busyId === r.id}
                onClick={() => act(r.id, "ban")}
              >
                <ShieldX size={14} className="inline mr-1" /> Ban User
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
