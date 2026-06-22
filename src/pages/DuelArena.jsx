import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { getSocket } from "../lib/socket";
import Editor from "@monaco-editor/react";

import Button from "../components/ui/Button";
import Chip from "../components/ui/Chip";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const DEFAULT_CODE = {
  python: `import sys
lines = sys.stdin.read().split('\\n')
# lines[0], lines[1], ... — one input line each, see Examples for the exact format
`,

  javascript: `const lines = require('fs').readFileSync(0, 'utf8').split('\\n');
// lines[0], lines[1], ... — one input line each, see Examples for the exact format
`,

  java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    // sc.nextLine() — one input line each call, see Examples for the exact format
  }
}`,

  cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string line;
    // getline(cin, line) — one input line each call, see Examples for the exact format
    return 0;
}`,
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
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [results, setResults] = useState({});
  const [consoleOut, setConsoleOut] = useState("");
  const [running, setRunning] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(null);

  const [showCustom, setShowCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState(null);
  const [customRunning, setCustomRunning] = useState(false);

  useEffect(() => {
    const socket = getSocket(session.access_token);
    socket.emit("duel:join", { matchId });

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/matches/${matchId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then(setData);

    const onProgress = ({ submitterId, testsPassed, testsTotal }) => {
      if (submitterId !== session.user.id)
        setOpponentProgress({ testsPassed, testsTotal });
    };
    const onEnded = (payload) => navigate(`/duel/${matchId}/result`);

    socket.on("duel:opponent:progress", onProgress);
    socket.on("match:ended", onEnded);
    return () => {
      socket.off("duel:opponent:progress", onProgress);
      socket.off("match:ended", onEnded);
    };
  }, [matchId, session, navigate]);

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

  function handleSubmit() {
    setSubmitting(true);

    getSocket(session.access_token).emit(
      "duel:submit",
      {
        matchId,
        code,
        language,
      },
      ({ testsPassed, testsTotal, error }) => {
        setSubmitting(false);

        setConsoleOut(
          error || `Submitted: ${testsPassed}/${testsTotal} tests passed`,
        );
      },
    );
  }

  function handleCustomRun() {
    setCustomRunning(true);

    getSocket(session.access_token).emit(
      "duel:run:custom",
      {
        language,
        code,
        stdin: customInput,
      },
      (res) => {
        setCustomOutput(res);
        setCustomRunning(false);
      },
    );
  }

  function handleForfeit() {
    if (!confirm("Forfeit this match?")) return;

    getSocket(session.access_token).emit("duel:forfeit", { matchId });
  }

  if (!data) return <div className="p-6 text-ink-400">Loading match...</div>;

  return (
    <div className="h-screen flex flex-col bg-base-950">
      <div className="flex items-center justify-between px-6 py-3 border-b border-base-700 bg-base-900">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-semibold">
            {data.problem.title}
          </span>
          <span>
            <Chip tone={data.problem.difficulty}>
              {data.problem.difficulty}
            </Chip>
          </span>
        </div>
        <Timer startedAt={data.match.started_at} />
        <Button variant="danger" onClick={handleForfeit}>
          Forfeit
        </Button>
      </div>

      <PanelGroup
        direction="horizontal"
        className="flex-1"
        autoSaveId="duel-arena-layout"
      >
        <Panel defaultSize={28} minSize={20} maxSize={45}>
          <div className="h-full overflow-y-auto p-5 border-r border-base-700">
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
        </Panel>

        <PanelResizeHandle className="w-1 bg-base-700 hover:bg-brand-500 transition-colors" />

        <Panel defaultSize={56} minSize={35}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={65} minSize={25}>
              <div className="h-full flex flex-col">
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
                  <div className="flex gap-2">
                    <Button onClick={handleRun} disabled={running}>
                      {running ? "Running…" : "Run"}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting…" : "Submit"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-1.5 border-b border-base-700 bg-base-950">
                  <p className="text-xs text-ink-400">
                    Reads from{" "}
                    <span className="font-mono text-ink-100">stdin</span>,
                    writes to{" "}
                    <span className="font-mono text-ink-100">stdout</span>— see
                    Examples for the exact line format.
                  </p>

                  <button
                    onClick={() => setShowCustom((s) => !s)}
                    className="text-xs text-brand-400 underline"
                  >
                    {showCustom ? "Hide" : "Custom Input"}
                  </button>
                </div>

                {showCustom && (
                  <div className="border-b border-base-700 bg-base-900 p-3 flex flex-col gap-2">
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Type stdin here, one value per line..."
                      className="bg-base-950 border border-base-700 rounded p-2 font-mono text-sm h-20"
                    />

                    <button
                      onClick={handleCustomRun}
                      disabled={customRunning}
                      className="self-start border border-base-700 px-3 py-1 rounded text-sm"
                    >
                      {customRunning ? "Running…" : "Run with custom input"}
                    </button>

                    {customOutput && (
                      <pre className="font-mono text-sm text-ink-400 bg-base-950 rounded p-2 whitespace-pre-wrap">
                        {customOutput.error
                          ? `Error: ${customOutput.error}`
                          : `stdout:\n${customOutput.stdout || "(empty)"}${
                              customOutput.stderr
                                ? `\n\nstderr:\n${customOutput.stderr}`
                                : ""
                            }`}
                      </pre>
                    )}
                  </div>
                )}

                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
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
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="h-1 bg-base-700 hover:bg-brand-500 transition-colors" />

            <Panel defaultSize={35} minSize={15}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-t border-base-700 bg-base-900">
                  <PipStrip results={results} total={data.sampleTests.length} />
                  <span className="text-xs text-ink-400">
                    {Object.keys(results).length}/{data.sampleTests.length}{" "}
                    sample tests
                  </span>
                </div>
                <pre className="flex-1 overflow-y-auto p-3 font-mono text-sm text-ink-400">
                  {consoleOut || "Run your code to see output here."}
                </pre>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-1 bg-base-700 hover:bg-brand-500 transition-colors" />

        <Panel defaultSize={16} minSize={12}>
          <div className="h-full p-4 border-l border-base-700 bg-base-900">
            <p className="text-xs text-ink-400 uppercase font-medium mb-3 tracking-wide">
              Opponent
            </p>

            {opponentProgress ? (
              <>
                <PipStrip
                  results={Object.fromEntries(
                    Array.from(
                      { length: opponentProgress.testsPassed },
                      (_, i) => [i, { passed: true }],
                    ),
                  )}
                  total={opponentProgress.testsTotal}
                />

                <p className="text-xs text-ink-400 mt-2">
                  {opponentProgress.testsPassed}/{opponentProgress.testsTotal}{" "}
                  passed
                </p>
              </>
            ) : (
              <div className="bg-base-950 border border-base-700 rounded p-3 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-base-800 flex items-center justify-center font-display text-lg">
                  ?
                </div>

                <p className="text-sm text-ink-400 text-center">
                  No submissions yet
                </p>
              </div>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
