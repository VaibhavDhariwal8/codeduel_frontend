import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useEscToClose } from "../lib/useEscToClose";

const STEPS = [
  "👋 New here? Here's how CodeDuel works.",
  "1. Hit Quick Match, or generate a Custom Duel link from the Dashboard to challenge someone directly.",
  "2. You and your opponent get the exact same problem and a synced countdown timer.",
  "3. Use Run to test against sample cases anytime. Submit grades against the full hidden test suite.",
  "4. First to pass every hidden test wins. If time runs out, whoever passed more tests wins.",
  "5. After the match, check the AI Coach tab on your Result screen for a personalized breakdown.",
];

export default function WalkthroughWidget() {
  const [open, setOpen] = useState(false);
  useEscToClose(open, () => setOpen(false));
  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-6 w-80 max-h-[60vh] overflow-y-auto bg-base-900 border border-base-700 rounded-lg shadow-xl p-4 z-40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="font-display font-semibold text-sm">How it works</p>
            <button
              onClick={() => setOpen(false)}
              className="text-ink-400 hover:text-ink-100"
            >
              <X size={16} />
            </button>
          </div>
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="bg-base-800 rounded-lg px-3 py-2 text-sm self-start max-w-[90%]"
            >
              {s}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-400 flex items-center justify-center shadow-lg z-40 transition-colors"
      >
        <MessageCircle size={20} className="text-base-950" />
      </button>
    </>
  );
}
