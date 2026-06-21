import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { getSocket } from "../lib/socket";
import Editor from "@monaco-editor/react";

const DEFAULT_CODE = {
  python: "print()",
  javascript: "console.log()",
  java: "public class Main { public static void main(String[] args) {} }",
  cpp: "#include <iostream>\nint main() { return 0; }",
};

function PipStrip({ results, total }) {
  const pips = Array.from({ length: total }, (_, i) => results[i]);
  return (
    <div className="flex gap-1">
      {pips.map((r, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm flex items-center justify-center text-[8px] font-mono
          ${r === undefined ? "bg-verdict-pending" : r.passed ? "bg-verdict-pass text-base-950" : "bg-verdict-fail text-base-950"}`}
        >
          {r === undefined ? "" : r.passed ? "✓" : "×"}
        </div>
      ))}
    </div>
  );
}

function Timer({ startedAt }) {
  const [remaining, setRemaining] = useState(1800);
  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () =>
      setRemaining(Math.max(0, Math.floor(1800 - (Date.now() - start) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const colorClass =
    remaining < 15
      ? "text-verdict-fail animate-pulse"
      : remaining < 60
        ? "text-verdict-warn"
        : "text-ink-100";
  return (
    <span
      className={`font-mono text-2xl font-semibold tabular-nums ${colorClass}`}
    >
      {mins}:{secs}
    </span>
  );
}

export default function DuelArena() {
  const { matchId } = useParams();
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [results, setResults] = useState({});
  const [consoleOut, setConsoleOut] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/matches/${matchId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setData);
  }, [matchId, session]);

  function handleRun() {
    setRunning(true);
    getSocket(session.access_token).emit(
      "duel:run",
      { matchId, code, language },
      ({ results }) => {
        const byOrdinal = {};
        results.forEach((r) => (byOrdinal[r.ordinal - 1] = r));
        setResults(byOrdinal);
        setConsoleOut(
          results
            .map(
              (r) =>
                `Test ${r.ordinal}: ${r.passed ? "PASS" : "FAIL"}\n${r.actualOutput}`,
            )
            .join("\n\n"),
        );
        setRunning(false);
      },
    );
  }

  if (!data) return <div className="p-6 text-ink-400">Loading match...</div>;

  return (
    <div className="h-screen flex flex-col bg-base-950">
      <div className="flex items-center justify-between px-6 py-3 border-b border-base-700 bg-base-900">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-semibold">
            {data.problem.title}
          </span>
          <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-base-800 text-ink-400 border border-base-700">
            {data.problem.difficulty}
          </span>
        </div>
        <Timer startedAt={data.match.started_at} />
        <button className="bg-verdict-fail text-base-950 px-4 py-1.5 rounded text-sm font-medium">
          Forfeit
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 overflow-y-auto p-5 border-r border-base-700">
          <p className="text-body-lg leading-relaxed whitespace-pre-wrap mb-6">
            {data.problem.statement}
          </p>
          <p className="text-xs font-medium text-ink-400 uppercase mb-3 tracking-wide">
            Examples
          </p>
          <div className="flex flex-col gap-4">
            {data.sampleTests.map((t, i) => (
              <div
                key={t.id}
                className="bg-base-900 border border-base-700 rounded p-3"
              >
                <p className="text-xs text-ink-400 mb-2 font-medium">
                  Example {i + 1}
                </p>
                <p className="text-xs text-ink-400 mb-1">Input</p>
                <pre className="font-mono text-sm whitespace-pre-wrap mb-2">
                  {t.input}
                </pre>
                <p className="text-xs text-ink-400 mb-1">Output</p>
                <pre className="font-mono text-sm whitespace-pre-wrap">
                  {t.expected_output}
                </pre>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-base-700 bg-base-900">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setCode(DEFAULT_CODE[e.target.value]);
              }}
              className="bg-base-800 border border-base-700 rounded px-2 py-1 text-sm"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <button
              onClick={handleRun}
              disabled={running}
              className="bg-brand-500 px-4 py-1.5 rounded text-sm font-medium disabled:opacity-50"
            >
              {running ? "Running…" : "Run"}
            </button>
          </div>
          <Editor
            height="50%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={setCode}
            options={{
              fontFamily: "JetBrains Mono",
              fontSize: 14,
              minimap: { enabled: false },
            }}
          />
          <div className="flex items-center justify-between px-4 py-2 border-t border-base-700 bg-base-900">
            <PipStrip results={results} total={data.sampleTests.length} />
            <span className="text-xs text-ink-400">
              {Object.keys(results).length}/{data.sampleTests.length} sample
              tests
            </span>
          </div>
          <pre className="flex-1 overflow-y-auto p-3 font-mono text-sm text-ink-400">
            {consoleOut || "Run your code to see output here."}
          </pre>
        </div>

        <div className="w-64 p-4 border-l border-base-700 bg-base-900">
          <p className="text-xs text-ink-400 uppercase font-medium mb-3 tracking-wide">
            Opponent
          </p>
          <div className="bg-base-950 border border-base-700 rounded p-3 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-base-800 flex items-center justify-center font-display text-lg">
              ?
            </div>
            <p className="text-sm text-ink-400 text-center">
              Progress hidden until Day 9 wiring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
