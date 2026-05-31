export interface OrderRow {
  order_id: string;
  order_date: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  order_status: string;
  delivery_date?: string;
  customer_city?: string;
  payment_status?: string;
  salesperson?: string;
}

export interface KpiData {
  totalRevenue: number;
  totalOrders: number;
  topProduct: string;
  topProductRevenue: number;
  topCustomer: string;
  topCustomerRevenue: number;
  ordersThisWeek: number;
  revenueGrowth: number; // % vs prev period
}

export interface ProductStat {
  name: string;
  revenue: number;
  orders: number;
  quantity: number;
}

export interface CustomerStat {
  name: string;
  revenue: number;
  orders: number;
  lastOrderDate: string;
  daysSinceLastOrder: number;
}

export interface WeeklyRevenue {
  week: string;
  revenue: number;
  orders: number;
}

export interface ParsedData {
  rows: OrderRow[];
  kpis: KpiData;
  products: ProductStat[];
  customers: CustomerStat[];
  weeklyRevenue: WeeklyRevenue[];
  dateRange: { start: string; end: string };
  csvSummary: string;
}

export interface Insight {
  type: string;
  text: string;
}

export interface PlantingRecommendation {
  plant_now: { product: string; quantity: string; reason: string }[];
  reduce: { product: string; reason: string };
  opportunity: { product: string; reason: string };
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AnalysisState {
  parsedData: ParsedData | null;
  insights: Insight[];
  planting: PlantingRecommendation | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  messages: Message[];
  isChatLoading: boolean;
  fileName: string | null;
}
