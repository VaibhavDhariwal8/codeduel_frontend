import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import { Swords } from "lucide-react";

export default function InviteAccept() {
  const { token } = useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/invites/${token}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).then(async (r) => {
      if (!r.ok) return setError("Invite not found.");
      setInvite(await r.json());
    });
  }, [token, session]);

  async function accept() {
    setAccepting(true);
    const r = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/invites/${token}/accept`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      },
    );
    const data = await r.json();
    if (!r.ok) {
      setError(data.error);
      setAccepting(false);
      return;
    }
    navigate(`/duel/${data.matchId}`);
  }

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-verdict-fail">{error}</p>
        </Card>
      </div>
    );
  if (!invite)
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-400">
        Loading invite…
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 w-full max-w-sm text-center flex flex-col items-center gap-4">
        <Avatar
          seed={invite.inviter_username}
          size={56}
          className="rounded-full"
        />
        <div>
          <p className="font-display text-xl font-bold">
            @{invite.inviter_username} challenged you
          </p>
          <p className="text-ink-400 text-sm mt-1">
            Difficulty:{" "}
            {invite.difficulty_pref === "any" ? "Any" : invite.difficulty_pref}
          </p>
        </div>
        {invite.isOwnInvite ? (
          <p className="text-ink-400 text-sm">
            This is your own invite link — share it with someone else.
          </p>
        ) : invite.expired || invite.status !== "pending" ? (
          <p className="text-verdict-fail text-sm">
            This invite is no longer available.
          </p>
        ) : (
          <Button
            onClick={accept}
            disabled={accepting}
            className="w-full flex items-center justify-center gap-2"
          >
            <Swords size={16} /> {accepting ? "Joining…" : "Accept Duel"}
          </Button>
        )}
      </Card>
    </div>
  );
}
