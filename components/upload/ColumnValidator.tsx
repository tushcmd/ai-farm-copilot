"use client";

import { CheckCircle2, XCircle, Circle } from "lucide-react";
import { ColumnValidation } from "@/lib/csvParser";

interface Props { validation: ColumnValidation[] }

export function ColumnValidator({ validation }: Props) {
  const required = validation.filter(v => v.required);
  const optional = validation.filter(v => !v.required);
  const allOk = required.every(v => v.present);

  return (
    <div className="rounded-lg border p-4 space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Column Detection</span>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: allOk ? "#dcfce7" : "#fee2e2", color: allOk ? "#166534" : "#991b1b" }}>
          {allOk ? "Ready to analyze" : "Missing required columns"}
        </span>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Required</div>
        <div className="grid grid-cols-2 gap-1.5">
          {required.map(v => (
            <div key={v.column} className="flex items-center gap-2 text-xs">
              {v.present
                ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#16a34a" }} />
                : <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "#dc2626" }} />}
              <span className="font-mono" style={{ color: v.present ? "var(--foreground)" : "#dc2626" }}>{v.column}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Optional</div>
        <div className="grid grid-cols-2 gap-1.5">
          {optional.map(v => (
            <div key={v.column} className="flex items-center gap-2 text-xs">
              {v.present
                ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#16a34a" }} />
                : <Circle className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />}
              <span className="font-mono" style={{ color: "var(--muted-foreground)" }}>{v.column}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
