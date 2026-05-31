"use client";

import { PlantingRecommendation } from "@/types";
import { Sprout, TrendingDown, Star } from "lucide-react";

interface Props {
  planting: PlantingRecommendation | null;
  isLoading: boolean;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded ${className}`} style={{ background: "var(--muted)" }} />;
}

export function PlantingCard({ planting, isLoading }: Props) {
  return (
    <div className="rounded-xl border p-5 space-y-4" data-testid="card-planting"
      style={{ background: "color-mix(in srgb, #16a34a 5%, var(--card))", borderColor: "#bbf7d0" }}>
      <div className="flex items-center gap-2">
        <Sprout className="w-4 h-4" style={{ color: "#16a34a" }} />
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Weekly Planting Plan</span>
        <span className="ml-auto text-xs" style={{ color: "var(--muted-foreground)" }}>AI-generated</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-4 h-4 rounded-full mt-0.5 shrink-0" />
              <div className="space-y-1 flex-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-full h-3" />
              </div>
            </div>
          ))}
        </div>
      ) : !planting ? (
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No planting data yet.</p>
      ) : (
        <div className="space-y-4">
          {/* Plant Now */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#16a34a" }}>
              <Sprout className="w-3.5 h-3.5" />Plant This Week
            </div>
            {planting.plant_now?.map((item, i) => (
              <div key={i} className="flex gap-3 pl-1" data-testid={`item-plant-${i}`}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#16a34a" }} />
                <div>
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{item.product}</span>
                  <span className="text-xs ml-2" style={{ color: "var(--muted-foreground)" }}>· {item.quantity}</span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.reason}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reduce */}
          {planting.reduce && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#d97706" }}>
                <TrendingDown className="w-3.5 h-3.5" />Reduce This Week
              </div>
              <div className="flex gap-3 pl-1">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#d97706" }} />
                <div>
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{planting.reduce.product}</span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{planting.reduce.reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Opportunity */}
          {planting.opportunity && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#2563eb" }}>
                <Star className="w-3.5 h-3.5" />New Opportunity
              </div>
              <div className="flex gap-3 pl-1">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#2563eb" }} />
                <div>
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{planting.opportunity.product}</span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{planting.opportunity.reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
