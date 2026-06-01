"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/context/AnalysisContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ProductBreakdown } from "@/components/dashboard/ProductBreakdown";
import { CustomerTable } from "@/components/dashboard/CustomerTable";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { PlantingCard } from "@/components/dashboard/PlantingCard";
import { BarChart2, Users, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { parsedData, insights, planting, isAnalyzing, analysisError } = useAnalysis();

  useEffect(() => {
    if (!parsedData) router.replace("/");
  }, [parsedData, router]);

  if (!parsedData) return null;

  const { kpis, products, customers, weeklyRevenue, dateRange } = parsedData;

  return (
    <div className="flex-1 flex flex-col" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>Farm Dashboard</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {dateRange.start} – {dateRange.end} · {parsedData.rows.length} records
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border"
            style={{ color: "var(--muted-foreground)", borderColor: "var(--border)", background: "var(--muted)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Analyzed by Llama 3.3 70B
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Revenue"
            value={`KES ${kpis.totalRevenue.toLocaleString()}`}
            trend={kpis.revenueGrowth}
            icon={<TrendingUp className="w-4 h-4" />}
            highlight
          />
          <KpiCard
            label="Total Orders"
            value={kpis.totalOrders.toString()}
            subtext={`${kpis.ordersThisWeek} this week`}
            icon={<ShoppingCart className="w-4 h-4" />}
          />
          <KpiCard
            label="Top Product"
            value={kpis.topProduct.length > 18 ? kpis.topProduct.slice(0, 18) + "…" : kpis.topProduct}
            subtext={`KES ${kpis.topProductRevenue.toLocaleString()}`}
            icon={<Package className="w-4 h-4" />}
          />
          <KpiCard
            label="Top Customer"
            value={kpis.topCustomer.length > 18 ? kpis.topCustomer.slice(0, 18) + "…" : kpis.topCustomer}
            subtext={`KES ${kpis.topCustomerRevenue.toLocaleString()}`}
            icon={<Users className="w-4 h-4" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueChart data={weeklyRevenue} />
          <ProductBreakdown products={products} />
        </div>

        {/* Insights + Planting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InsightsPanel insights={insights} isLoading={isAnalyzing} error={analysisError} />
          <PlantingCard planting={planting} isLoading={isAnalyzing} />
        </div>

        {/* Customers */}
        <CustomerTable customers={customers} />
      </div>
    </div>
  );
}
