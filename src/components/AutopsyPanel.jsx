import { useState } from "react";
import { Sparkles, Eye } from "lucide-react";

export default function AutopsyPanel({ autopsy }) {
  const [hintRevealed, setHintRevealed] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-brand-400">
        <Sparkles size={16} />
        <p className="text-sm font-medium">{autopsy.outcome_summary}</p>
      </div>
      <div>
        <p className="text-xs text-ink-400 uppercase mb-1">Bottleneck</p>
        <p className="text-sm">{autopsy.identified_bottleneck}</p>
      </div>
      <div>
        <p className="text-xs text-ink-400 uppercase mb-1">
          What to think about
        </p>
        <p className="text-sm">{autopsy.conceptual_flaw}</p>
      </div>
      <div>
        {!hintRevealed ? (
          <button
            onClick={() => setHintRevealed(true)}
            className="flex items-center gap-2 text-sm text-brand-400 underline"
          >
            <Eye size={14} /> Reveal Socratic hint
          </button>
        ) : (
          <div className="bg-base-950 border border-brand-500/30 rounded p-3 text-sm">
            {autopsy.socratic_hint}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-ink-400 uppercase mb-1">Breakdown</p>
        <ol className="list-decimal list-inside text-sm flex flex-col gap-1">
          {autopsy.step_by_step_breakdown.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
