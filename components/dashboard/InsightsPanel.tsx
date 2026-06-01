"use client";

import { Insight } from "@/types";
import { Sparkles, TrendingUp, Package, Users, AlertTriangle, Lightbulb } from "lucide-react";

interface Props {
  insights: Insight[];
  isLoading: boolean;
  error: string | null;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  REVENUE:     { icon: <TrendingUp className="w-3 h-3" />,     bg: "#dbeafe", color: "#1d4ed8" },
  PRODUCT:     { icon: <Package className="w-3 h-3" />,        bg: "#dcfce7", color: "#15803d" },
  CUSTOMER:    { icon: <Users className="w-3 h-3" />,          bg: "#f3e8ff", color: "#7e22ce" },
  RISK:        { icon: <AlertTriangle className="w-3 h-3" />,  bg: "#fef3c7", color: "#b45309" },
  OPPORTUNITY: { icon: <Lightbulb className="w-3 h-3" />,      bg: "#d1fae5", color: "#065f46" },
  TREND:       { icon: <TrendingUp className="w-3 h-3" />,     bg: "#e0e7ff", color: "#4338ca" },
};

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded ${className || ""}`} style={{ background: "var(--muted)" }} />
  );
}

export function InsightsPanel({ insights, isLoading, error }: Props) {
  return (
    <div className="rounded-xl border p-5 space-y-4" data-testid="panel-insights"
      style={{ background: "color-mix(in srgb, var(--primary) 5%, var(--card))", borderColor: "color-mix(in srgb, var(--primary) 25%, var(--border))" }}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color: "var(--primary)" }} />
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>AI Business Insights</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
          style={{ background: "color-mix(in srgb, var(--primary) 12%, var(--background))", color: "var(--muted-foreground)" }}>
          Llama 3.3 70B
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-20 h-5 rounded-full shrink-0" />
              <Skeleton className="flex-1 h-5" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-xs" style={{ color: "var(--destructive)" }}>{error}</p>
      ) : insights.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Upload data to generate insights.</p>
      ) : (
        <div className="space-y-3">
          {insights.map((ins, i) => {
            const cfg = TYPE_CONFIG[ins.type] || TYPE_CONFIG.REVENUE;
            return (
              <div key={i} className="flex items-start gap-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 70}ms` }}>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                  {ins.type}
                </span>
                <p className="text-xs leading-relaxed pt-0.5" style={{ color: "var(--foreground)" }}>{ins.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
