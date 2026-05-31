"use client";

import { useState, KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";

export function ChatInput({ onSend, isLoading }: { onSend: (msg: string) => void; isLoading: boolean }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const t = value.trim();
    if (!t || isLoading) return;
    onSend(t);
    setValue("");
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex gap-2 items-end border-t pt-4" style={{ borderColor: "var(--border)" }}>
      <textarea
        data-testid="input-chat"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        rows={2}
        disabled={isLoading}
        placeholder="Ask about your farm… (Enter to send)"
        className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-offset-0"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
          fontFamily: "inherit",
        }}
      />
      <button
        data-testid="button-send"
        onClick={handleSend}
        disabled={!value.trim() || isLoading}
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        {isLoading
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <SendHorizonal className="w-4 h-4" />}
      </button>
    </div>
  );
}
