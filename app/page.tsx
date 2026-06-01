"use client";

import { CsvDropzone } from "@/components/upload/CsvDropzone";
import { FileText, BarChart2, MessageSquare, Sprout } from "lucide-react";

const STEPS = [
  { icon: FileText,     label: "Upload CSV",   desc: "Export from Odoo Sales → Orders" },
  { icon: BarChart2,    label: "AI Analysis",  desc: "Llama 3.3 70B analyzes your business data" },
  { icon: MessageSquare,label: "Get Insights", desc: "Dashboard + chat with your data" },
];

const QUESTIONS = [
  "What should we plant next week?",
  "Which product makes the most revenue?",
  "Who are our best customers?",
  "What inventory is at risk?",
];

export default function UploadPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-10">
        {/* Header */}
        <div className="text-center space-y-2 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
            <Sprout className="w-3.5 h-3.5" />
            AI Farm Copilot · MicrorootsKE
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
            Understand your farm business in seconds
          </h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Upload your Odoo sales export and get AI-powered insights, revenue forecasts, and planting recommendations.
          </p>
        </div>

        <CsvDropzone />

        {/* How it works */}
        <div className="w-full max-w-xl">
          <div className="text-xs font-medium text-center mb-4 uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)" }}>How it works</div>
          <div className="grid grid-cols-3 gap-3">
            {STEPS.map(({ icon: Icon, label, desc }, i) => (
              <div key={i} className="text-center space-y-2 p-3 rounded-lg border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: "var(--accent)" }}>
                  <Icon className="w-4 h-4" style={{ color: "var(--accent-foreground)" }} />
                </div>
                <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{label}</div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample questions */}
        <div className="w-full max-w-xl space-y-2">
          <div className="text-xs font-medium text-center uppercase tracking-wider"
            style={{ color: "var(--muted-foreground)" }}>Questions you can ask</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {QUESTIONS.map(q => (
              <span key={q} className="text-xs px-3 py-1.5 rounded-full border"
                style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                {q}
              </span>
            ))}
          </div>
        </div>

        {/* Odoo export hint */}
        <div className="w-full max-w-xl rounded-lg border p-4"
          style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
          <div className="text-xs font-medium mb-2" style={{ color: "var(--foreground)" }}>Exporting from Odoo?</div>
          <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color: "var(--muted-foreground)" }}>
            <li>Go to Sales → Orders → Orders</li>
            <li>Select all orders · click Action → Export</li>
            <li>Include: <span className="font-mono" style={{ color: "var(--foreground)" }}>name, date_order, partner_id, order_line/product_id, order_line/product_uom_qty, order_line/price_unit, order_line/price_subtotal, state</span></li>
            <li>Export as CSV (UTF-8)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
