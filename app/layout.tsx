import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AnalysisProviderWrapper } from "@/components/layout/AnalysisProviderWrapper";
import { Sidebar } from "@/components/layout/Sidebar";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Farm Copilot | MicrorootsKE",
  description: "AI-powered business intelligence for MicrorootsKE microgreens farm. Upload Odoo exports, get insights, chat with your data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full flex bg-[var(--background)] text-[var(--foreground)] antialiased">
        <AnalysisProviderWrapper>
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {children}
          </main>
        </AnalysisProviderWrapper>
      </body>
    </html>
  );
}
