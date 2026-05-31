"use client";

import { CustomerStat } from "@/types";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props { customers: CustomerStat[] }

export function CustomerTable({ customers }: Props) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="mb-4">
        <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Customer Performance</div>
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Top customers by revenue · flagged if no order in 14+ days</div>
      </div>
      <div className="overflow-x-auto" data-testid="table-customers">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
              <th className="text-left pb-2 font-medium">Customer</th>
              <th className="text-right pb-2 font-medium">Revenue</th>
              <th className="text-right pb-2 font-medium">Orders</th>
              <th className="text-right pb-2 font-medium">Last Order</th>
              <th className="text-right pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.slice(0, 8).map((c, i) => {
              const atRisk = c.daysSinceLastOrder >= 14;
              return (
                <tr key={i} className="border-b last:border-0" style={{ borderColor: "var(--border)" }} data-testid={`row-customer-${i}`}>
                  <td className="py-2.5 pr-3 font-medium max-w-[140px] truncate" style={{ color: "var(--foreground)" }}>{c.name}</td>
                  <td className="py-2.5 text-right font-medium" style={{ color: "var(--foreground)" }}>KES {Math.round(c.revenue).toLocaleString()}</td>
                  <td className="py-2.5 text-right" style={{ color: "var(--muted-foreground)" }}>{c.orders}</td>
                  <td className="py-2.5 text-right" style={{ color: "var(--muted-foreground)" }}>{c.daysSinceLastOrder}d ago</td>
                  <td className="py-2.5 text-right">
                    {atRisk ? (
                      <span className="inline-flex items-center gap-1" style={{ color: "#d97706" }}>
                        <AlertTriangle className="w-3 h-3" />At risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1" style={{ color: "#16a34a" }}>
                        <CheckCircle2 className="w-3 h-3" />Active
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
