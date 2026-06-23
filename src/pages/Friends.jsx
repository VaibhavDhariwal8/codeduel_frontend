import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { UserPlus, Check, X, UserMinus } from "lucide-react";
import Avatar from "../components/ui/Avatar";

export default function Friends() {
  const { session } = useAuth();
  const [friends, setFriends] = useState([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [me, setMe] = useState(null);

  async function load() {
    const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setFriends(await r.json());
    const meRes = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/users/me/profile`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    setMe(await meRes.json());
  }
  useEffect(() => {
    load();
  }, [session]);

  async function sendRequest(e) {
    e.preventDefault();
    setError(null);
    const r = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ username }),
      },
    );
    if (!r.ok) {
      const { error } = await r.json();
      setError(error);
      return;
    }
    setUsername("");
    load();
  }
  async function respond(id, action) {
    await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/friends/requests/${id}/${action}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      },
    );
    load();
  }
  async function remove(userId) {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/friends/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    load();
  }

  const incoming = friends.filter(
    (f) => f.status === "pending" && f.addressee_id === session.user.id,
  );
  const outgoing = friends.filter(
    (f) => f.status === "pending" && f.requester_id === session.user.id,
  );
  const accepted = friends.filter((f) => f.status === "accepted");

  const rankedFriends = [...accepted].sort(
    (a, b) => b.other_rating - a.other_rating,
  );

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Friends</h1>
      {me && (
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar seed={me.username} size={40} className="rounded" />

            <div>
              <p className="font-medium">{me.username}</p>
              <p className="text-xs text-ink-400">Your Rating</p>
            </div>
          </div>

          <span className="font-display text-lg text-brand-400">
            {me.rating}
          </span>
        </Card>
      )}
      <Card className="p-4">
        <form onSubmit={sendRequest} className="flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="flex-1 bg-base-800 border border-base-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
          <Button type="submit" className="flex items-center gap-1">
            <UserPlus size={14} /> Add
          </Button>
        </form>
        {error && <p className="text-verdict-fail text-sm mt-2">{error}</p>}
      </Card>
      {incoming.length > 0 && (
        <div>
          <p className="text-xs text-ink-400 uppercase mb-2">
            Incoming requests
          </p>
          {incoming.map((f) => (
            <Card
              key={f.id}
              className="p-3 flex items-center justify-between mb-2"
            >
              <div className="flex items-center gap-3">
                <Avatar seed={f.other_username} size={32} className="rounded" />
                <span>{f.other_username}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  className="!p-2"
                  onClick={() => respond(f.id, "accept")}
                >
                  <Check size={14} />
                </Button>
                <Button
                  variant="secondary"
                  className="!p-2"
                  onClick={() => respond(f.id, "decline")}
                >
                  <X size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {outgoing.length > 0 && (
        <div>
          <p className="text-xs text-ink-400 uppercase mb-2">Pending (sent)</p>
          {outgoing.map((f) => (
            <Card
              key={f.id}
              className="p-3 flex items-center justify-between mb-2 text-ink-400"
            >
              <div className="flex items-center gap-3">
                <Avatar seed={f.other_username} size={32} className="rounded" />
                <span>{f.other_username}</span>
              </div>
              <span className="text-xs">waiting...</span>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg">Friend Rankings</h2>

        <div className="bg-base-900 border border-base-700 rounded-lg divide-y divide-base-700">
          {rankedFriends.map((f, i) => (
            <div
              key={f.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-display text-brand-400">
                  #{i + 1}
                </span>

                <Avatar seed={f.other_username} size={32} className="rounded" />

                <span>{f.other_username}</span>
              </div>

              <span
                className={`font-mono text-sm ${
                  f.other_rating >= 1400
                    ? "text-brand-400"
                    : f.other_rating >= 1200
                      ? "text-verdict-pass"
                      : "text-ink-300"
                }`}
              >
                {f.other_rating}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-ink-400 uppercase mb-2">Friends</p>
        {accepted.length === 0 && (
          <p className="text-ink-400 text-sm">No friends yet.</p>
        )}
        {accepted.map((f) => (
          <Card
            key={f.id}
            className="p-3 flex items-center justify-between mb-2"
          >
            <div className="flex items-center gap-3">
              <Avatar seed={f.other_username} size={32} className="rounded" />
              <span>{f.other_username}</span>
            </div>
            <Button
              variant="secondary"
              className="!p-2"
              onClick={() => remove(f.other_user_id)}
            >
              <UserMinus size={14} />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
