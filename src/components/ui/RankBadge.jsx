const TIERS = [
  {
    name: "Bronze",
    min: 0,
    color: "text-amber-700 border-amber-700/30 bg-amber-700/10",
  },
  {
    name: "Silver",
    min: 1000,
    color: "text-ink-100 border-ink-400/30 bg-ink-400/10",
  },
  {
    name: "Gold",
    min: 1250,
    color: "text-verdict-warn border-verdict-warn/30 bg-verdict-warn/10",
  },
  {
    name: "Platinum",
    min: 1450,
    color: "text-cyan-300 border-cyan-300/30 bg-cyan-300/10",
  },
  {
    name: "Diamond",
    min: 1650,
    color: "text-brand-400 border-brand-400/30 bg-brand-400/10",
  },
  {
    name: "Grandmaster",
    min: 1850,
    color: "text-verdict-fail border-verdict-fail/30 bg-verdict-fail/10",
  },
];
export function tierFor(rating) {
  return (
    TIERS.slice()
      .reverse()
      .find((t) => rating >= t.min) || TIERS[0]
  );
}

export default function RankBadge({ rating, showRating = true }) {
  const tier = tierFor(rating);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono uppercase tracking-wide ${tier.color}`}
    >
      {tier.name}
      {showRating && ` · ${rating}`}
    </span>
  );
}
