"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { WeeklyRevenue } from "@/types";

interface Props { data: WeeklyRevenue[] }

function fmtKES(v: number) {
  return v >= 1000 ? `KES ${(v / 1000).toFixed(1)}k` : `KES ${v}`;
}

export function RevenueChart({ data }: Props) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="mb-4">
        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Weekly Revenue</div>
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Last 8 weeks</div>
      </div>
      <div style={{ height: 192, minHeight: 0 }} data-testid="chart-revenue">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtKES} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={72} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [fmtKES(v as number), "Revenue"]}
              labelStyle={{ color: "var(--foreground)", fontWeight: 500 }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} fill="url(#revGrad)" dot={{ fill: "#16a34a", r: 3 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
