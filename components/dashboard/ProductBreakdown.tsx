"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ProductStat } from "@/types";

interface Props { products: ProductStat[] }

const COLORS = ["#16a34a", "#15803d", "#86efac", "#4ade80", "#bbf7d0", "#166534"];

export function ProductBreakdown({ products }: Props) {
  const top = products.slice(0, 6).map(p => ({
    ...p,
    shortName: p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name,
  }));

  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="mb-4">
        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Revenue by Product</div>
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Top {top.length} products</div>
      </div>
      <div className="h-48" data-testid="chart-products">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="shortName" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={108} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`KES ${(v as number).toLocaleString()}`, "Revenue"]}
              labelStyle={{ color: "var(--foreground)", fontWeight: 500 }}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {top.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
