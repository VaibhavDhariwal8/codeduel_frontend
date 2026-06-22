import { useEffect, useState } from "react";
import { useAuth } from "../lib/AuthContext";

import Chip from "../components/ui/Chip";

export default function Problems() {
  const { session } = useAuth();
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    if (!session) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/problems`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
      .then((r) => r.json())
      .then(setProblems);
  }, [session]);

  return (
    <div className="max-w-[1120px] mx-auto p-6">
      <h1 className="font-display text-3xl font-bold mb-6">Problems</h1>

      <div className="grid gap-3">
        {problems.map((p) => (
          <div
            key={p.id}
            className="bg-base-900 border border-base-700 rounded-lg p-4 flex justify-between"
          >
            <span>{p.title}</span>

            <span className="text-ink-400 text-sm uppercase">
              <Chip tone={p.difficulty}>{p.difficulty}</Chip>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
