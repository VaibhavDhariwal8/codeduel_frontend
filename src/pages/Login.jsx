import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else navigate("/dashboard"); // was /problems — stale since Day 10.5's reroute
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950">
      <Card className="p-8 w-80">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h1 className="font-display text-2xl font-bold text-ink-100">
            Log in
          </h1>
          <input
            className="bg-base-800 border border-base-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-shadow"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="bg-base-800 border border-base-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-shadow"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-verdict-fail text-sm">{error}</p>}
          <Button type="submit">Log in</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "github" })
            }
          >
            Continue with GitHub
          </Button>
          <p className="text-ink-400 text-sm text-center">
            No account?{" "}
            <Link to="/signup" className="text-brand-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
