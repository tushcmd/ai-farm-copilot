"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string;
  subtext?: string;
  trend?: number;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export function KpiCard({ label, value, subtext, trend, icon, highlight }: Props) {
  return (
    <div
      data-testid="card-kpi"
      className="rounded-xl p-5 flex flex-col gap-3 border"
      style={{
        background: highlight ? "color-mix(in srgb, var(--primary) 8%, var(--card))" : "var(--card)",
        borderColor: highlight ? "color-mix(in srgb, var(--primary) 30%, var(--border))" : "var(--border)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
          {label}
        </span>
        {icon && <span style={{ color: "var(--muted-foreground)" }}>{icon}</span>}
      </div>
      <div>
        <div className="text-xl font-semibold leading-none" style={{ color: "var(--foreground)" }}>{value}</div>
        {subtext && <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{subtext}</div>}
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-xs font-medium"
          style={{ color: trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "var(--muted-foreground)" }}>
          {trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : trend < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          {trend > 0 ? "+" : ""}{trend}% vs last period
        </div>
      )}
    </div>
  );
}
