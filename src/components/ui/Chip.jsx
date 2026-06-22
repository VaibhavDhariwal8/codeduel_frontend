const colors = {
  easy: "text-verdict-pass border-verdict-pass/30 bg-verdict-pass/10",
  medium: "text-verdict-warn border-verdict-warn/30 bg-verdict-warn/10",
  hard: "text-verdict-fail border-verdict-fail/30 bg-verdict-fail/10",
};

export default function Chip({ tone, children }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-mono uppercase tracking-wide ${
        colors[tone] || "text-ink-400 border-base-700 bg-base-800"
      }`}
    >
      {children}
    </span>
  );
}
