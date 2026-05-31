"use client";

const SUGGESTIONS = [
  "What should we plant next week?",
  "Which products make the most revenue?",
  "Which customers might churn soon?",
  "What trends do you see in our data?",
  "How can we grow revenue this month?",
];

export function SuggestedChips({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="space-y-2" data-testid="chips-suggested">
      <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
        Ask your Farm Copilot anything about your business
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTIONS.map(q => (
          <button key={q} onClick={() => onSelect(q)}
            data-testid={`chip-${q.slice(0, 20)}`}
            className="text-xs px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
