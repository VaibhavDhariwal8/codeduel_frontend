import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Account created. Check your email to verify your account.");

    setTimeout(() => navigate("/login"), 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <Card className="w-full max-w-sm p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="text-center mb-2">
            <h1 className="font-display text-3xl font-bold text-ink-100">
              Create Account
            </h1>
            <p className="text-sm text-ink-400 mt-2">
              Join CodeDuel and start competing.
            </p>
          </div>

          <input
            className="bg-base-800 border border-base-700 rounded-md px-3 py-2 text-ink-100 focus:outline-none focus:border-brand-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="bg-base-800 border border-base-700 rounded-md px-3 py-2 text-ink-100 focus:outline-none focus:border-brand-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-verdict-fail text-sm">{error}</p>}

          {message && <p className="text-verdict-pass text-sm">{message}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-ink-400">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 hover:text-brand-300">
              Log in
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
