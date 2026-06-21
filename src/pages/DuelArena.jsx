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

  if (!data) return <div className="p-6">Loading match...</div>;

  return (
    <div className="h-screen flex flex-col bg-base-950">
      <div className="flex justify-between items-center px-4 py-2 border-b border-base-700">
        <span className="font-display text-lg">
          {data.problem.title} ·{" "}
          <span className="text-ink-400 uppercase text-sm">
            {data.problem.difficulty}
          </span>
        </span>
        <span className="font-mono text-verdict-warn">30:00</span>
        <button className="bg-verdict-fail px-3 py-1 rounded-md text-sm">
          Forfeit
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 overflow-y-auto p-4 border-r border-base-700 whitespace-pre-wrap text-body-lg">
          {data.problem.statement}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-base-700">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setCode(DEFAULT_CODE[e.target.value]);
              }}
              className="bg-base-800 border border-base-700 rounded-md px-2 py-1 text-sm"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <button
              onClick={handleRun}
              disabled={running}
              className="bg-brand-500 px-4 py-1 rounded-md text-sm"
            >
              {running ? "Running..." : "Run"}
            </button>
          </div>
          <Editor
            height="55%"
            theme="vs-dark"
            language={language}
            value={code}
            onChange={setCode}
          />
          <div className="p-3 border-t border-base-700">
            <PipStrip results={results} total={data.sampleTests.length} />
          </div>
          <pre className="flex-1 overflow-y-auto p-3 font-mono text-sm text-ink-400">
            {consoleOut}
          </pre>
        </div>
        <div className="w-1/4 p-4 border-l border-base-700">
          <p className="text-ink-400 text-sm mb-2">OPPONENT</p>
          <div className="bg-base-900 rounded-lg p-3 text-ink-400 text-sm">
            Progress hidden until Day 9 wiring
          </div>
        </div>
      </div>
    </div>
  );
}
