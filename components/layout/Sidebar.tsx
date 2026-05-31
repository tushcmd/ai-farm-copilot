"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UploadCloud, LayoutDashboard, MessageSquare, Sprout, RotateCcw } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";

const navItems = [
  { href: "/", icon: UploadCloud, label: "Upload Data" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/chat", icon: MessageSquare, label: "Farm Copilot" },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar() {
  const pathname = usePathname();
  const { parsedData, fileName, resetAll } = useAnalysis();

  return (
    <aside className="w-60 min-h-screen flex flex-col border-r shrink-0"
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--primary)" }}>
            <Sprout className="w-4 h-4" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight" style={{ color: "var(--foreground)" }}>
              MicrorootsKE
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              AI Farm Copilot
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          const isLocked = href !== "/" && !parsedData;
          return (
            <Link
              key={href}
              href={isLocked ? "/" : href}
              data-testid={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "text-white"
                  : isLocked
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:opacity-80"
              )}
              style={
                isActive
                  ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                  : { color: "var(--foreground)" }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {href === "/chat" && parsedData && (
                <span className="ml-auto w-2 h-2 rounded-full bg-green-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* File info */}
      {parsedData && (
        <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="space-y-1">
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Data loaded</div>
            <div className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }} title={fileName || ""}>
              {fileName || "data.csv"}
            </div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {parsedData.rows.length} records · {parsedData.dateRange.start} – {parsedData.dateRange.end}
            </div>
          </div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
            GPT-4o Analyzed
          </span>
          <button
            data-testid="button-reset"
            onClick={resetAll}
            className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            <RotateCcw className="w-3 h-3" />
            Upload new file
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Built with Perplexity Computer
        </div>
      </div>
    </aside>
  );
}
