import Papa from "papaparse";
import { OrderRow, ParsedData, KpiData, ProductStat, CustomerStat, WeeklyRevenue } from "@/types";
import { format, parseISO, differenceInDays, startOfWeek, isValid } from "date-fns";

export const REQUIRED_COLUMNS = [
  "order_id",
  "order_date",
  "customer_name",
  "product_name",
  "quantity",
  "unit_price",
  "subtotal",
  "order_status",
];

export const OPTIONAL_COLUMNS = [
  "delivery_date",
  "customer_city",
  "payment_status",
  "salesperson",
];

export interface ColumnValidation {
  column: string;
  present: boolean;
  required: boolean;
}

export function validateColumns(headers: string[]): ColumnValidation[] {
  const normalized = headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return [
    ...REQUIRED_COLUMNS.map((col) => ({
      column: col,
      present: normalized.includes(col),
      required: true,
    })),
    ...OPTIONAL_COLUMNS.map((col) => ({
      column: col,
      present: normalized.includes(col),
      required: false,
    })),
  ];
}

export function parseCsv(file: File): Promise<{ rows: OrderRow[]; headers: string[]; validation: ColumnValidation[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const validation = validateColumns(headers);
        const rows = (results.data as Record<string, string>[]).map((row) => ({
          order_id: row.order_id || row.name || "",
          order_date: row.order_date || row.date_order || "",
          customer_name: row.customer_name || row.partner_id || "",
          product_name: row.product_name || row["order_line/product_id"] || "",
          quantity: parseFloat(row.quantity || row["order_line/product_uom_qty"] || "0") || 0,
          unit_price: parseFloat(row.unit_price || row["order_line/price_unit"] || "0") || 0,
          subtotal: parseFloat(row.subtotal || row["order_line/price_subtotal"] || "0") || 0,
          order_status: row.order_status || row.state || "sale",
          delivery_date: row.delivery_date || row.commitment_date || undefined,
          customer_city: row.customer_city || row["partner_id/city"] || undefined,
          payment_status: row.payment_status || row.invoice_status || undefined,
          salesperson: row.salesperson || row.user_id || undefined,
        }));
        resolve({ rows, headers, validation });
      },
      error: (err) => reject(err),
    });
  });
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  const d = parseISO(str.split(" ")[0]);
  return isValid(d) ? d : null;
}

function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function sumRevenue(rows: OrderRow[]): number {
  return rows.reduce((s, r) => s + (r.subtotal || r.quantity * r.unit_price), 0);
}

export function analyzeData(rows: OrderRow[]): ParsedData {
  // Filter only sale/done orders
  const activeRows = rows.filter((r) =>
    ["sale", "done", "confirmed", ""].includes(r.order_status.toLowerCase())
  );

  const validRows = activeRows.length > 0 ? activeRows : rows;

  // Dates
  const dates = validRows
    .map((r) => parseDate(r.order_date))
    .filter(Boolean) as Date[];
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const minDate = sortedDates[0] || new Date();
  const maxDate = sortedDates[sortedDates.length - 1] || new Date();

  // Products
  const byProduct = groupBy(validRows, "product_name");
  const products: ProductStat[] = Object.entries(byProduct)
    .map(([name, items]) => ({
      name,
      revenue: sumRevenue(items),
      orders: new Set(items.map((i) => i.order_id)).size,
      quantity: items.reduce((s, i) => s + i.quantity, 0),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Customers
  const byCustomer = groupBy(validRows, "customer_name");
  const today = new Date();
  const customers: CustomerStat[] = Object.entries(byCustomer)
    .map(([name, items]) => {
      const customerDates = items
        .map((i) => parseDate(i.order_date))
        .filter(Boolean) as Date[];
      const lastDate = customerDates.sort((a, b) => b.getTime() - a.getTime())[0] || today;
      return {
        name,
        revenue: sumRevenue(items),
        orders: new Set(items.map((i) => i.order_id)).size,
        lastOrderDate: format(lastDate, "yyyy-MM-dd"),
        daysSinceLastOrder: differenceInDays(today, lastDate),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Weekly revenue
  const weekMap: Record<string, { revenue: number; orders: Set<string> }> = {};
  validRows.forEach((row) => {
    const d = parseDate(row.order_date);
    if (!d) return;
    const weekKey = format(startOfWeek(d, { weekStartsOn: 1 }), "MMM d");
    if (!weekMap[weekKey]) weekMap[weekKey] = { revenue: 0, orders: new Set() };
    weekMap[weekKey].revenue += row.subtotal || row.quantity * row.unit_price;
    weekMap[weekKey].orders.add(row.order_id);
  });
  const weeklyRevenue: WeeklyRevenue[] = Object.entries(weekMap)
    .slice(-8)
    .map(([week, data]) => ({
      week,
      revenue: Math.round(data.revenue),
      orders: data.orders.size,
    }));

  // KPIs
  const totalRevenue = sumRevenue(validRows);
  const uniqueOrders = new Set(validRows.map((r) => r.order_id)).size;

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const thisWeekOrders = new Set(
    validRows
      .filter((r) => {
        const d = parseDate(r.order_date);
        return d && d >= oneWeekAgo;
      })
      .map((r) => r.order_id)
  ).size;

  // Growth: compare last 30 days vs prev 30 days
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);

  const last30 = sumRevenue(
    validRows.filter((r) => {
      const d = parseDate(r.order_date);
      return d && d >= thirtyDaysAgo;
    })
  );
  const prev30 = sumRevenue(
    validRows.filter((r) => {
      const d = parseDate(r.order_date);
      return d && d >= sixtyDaysAgo && d < thirtyDaysAgo;
    })
  );
  const growth = prev30 > 0 ? Math.round(((last30 - prev30) / prev30) * 100) : 0;

  const kpis: KpiData = {
    totalRevenue: Math.round(totalRevenue),
    totalOrders: uniqueOrders,
    topProduct: products[0]?.name || "N/A",
    topProductRevenue: Math.round(products[0]?.revenue || 0),
    topCustomer: customers[0]?.name || "N/A",
    topCustomerRevenue: Math.round(customers[0]?.revenue || 0),
    ordersThisWeek: thisWeekOrders,
    revenueGrowth: growth,
  };

  // Build CSV summary for OpenAI
  const csvSummary = buildCsvSummary(validRows, kpis, products, customers, weeklyRevenue, minDate, maxDate);

  return {
    rows: validRows,
    kpis,
    products,
    customers,
    weeklyRevenue,
    dateRange: {
      start: format(minDate, "MMM d, yyyy"),
      end: format(maxDate, "MMM d, yyyy"),
    },
    csvSummary,
  };
}

export function buildCsvSummary(
  rows: OrderRow[],
  kpis: KpiData,
  products: ProductStat[],
  customers: CustomerStat[],
  weeklyRevenue: WeeklyRevenue[],
  minDate: Date,
  maxDate: Date
): string {
  const uniqueOrders = new Set(rows.map((r) => r.order_id)).size;

  return `
MICROROOTSKE SALES DATA SUMMARY
================================
Date range: ${format(minDate, "MMM d, yyyy")} to ${format(maxDate, "MMM d, yyyy")}
Total line items: ${rows.length} | Unique orders: ${uniqueOrders}
Total revenue: KES ${kpis.totalRevenue.toLocaleString()}
Revenue growth (last 30d vs prior 30d): ${kpis.revenueGrowth > 0 ? "+" : ""}${kpis.revenueGrowth}%
Orders this week: ${kpis.ordersThisWeek}

TOP PRODUCTS BY REVENUE:
${products
  .slice(0, 8)
  .map(
    (p, i) =>
      `${i + 1}. ${p.name}: KES ${Math.round(p.revenue).toLocaleString()} (${p.orders} orders, ${Math.round(p.quantity)} units)`
  )
  .join("\n")}

TOP CUSTOMERS BY REVENUE:
${customers
  .slice(0, 8)
  .map(
    (c, i) =>
      `${i + 1}. ${c.name}: KES ${Math.round(c.revenue).toLocaleString()} (${c.orders} orders, last order: ${c.daysSinceLastOrder} days ago)`
  )
  .join("\n")}

AT-RISK CUSTOMERS (no order in 14+ days):
${customers
  .filter((c) => c.daysSinceLastOrder >= 14)
  .slice(0, 5)
  .map((c) => `- ${c.name}: ${c.daysSinceLastOrder} days since last order`)
  .join("\n") || "None"}

WEEKLY REVENUE TREND (last 8 weeks):
${weeklyRevenue.map((w) => `Week of ${w.week}: KES ${w.revenue.toLocaleString()} (${w.orders} orders)`).join("\n")}
`.trim();
}
