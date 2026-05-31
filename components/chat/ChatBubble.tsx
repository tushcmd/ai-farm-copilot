"use client";

import { Message } from "@/types";
import { Sprout, User } from "lucide-react";
import { format } from "date-fns";

export function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`bubble-${message.role}-${message.id}`}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1"
        style={isUser
          ? { background: "var(--primary)", color: "var(--primary-foreground)" }
          : { background: "#dcfce7", color: "#16a34a" }}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Sprout className="w-3.5 h-3.5" />}
      </div>
      <div className={`max-w-[75%] space-y-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
          style={isUser
            ? { background: "var(--primary)", color: "var(--primary-foreground)", borderRadius: "1rem 0.25rem 1rem 1rem" }
            : { background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "0.25rem 1rem 1rem 1rem" }}>
          {message.content}
        </div>
        <div className={`text-xs px-1 ${isUser ? "text-right" : "text-left"}`}
          style={{ color: "var(--muted-foreground)" }}>
          {format(message.timestamp, "h:mm a")}
        </div>
      </div>
    </div>
  );
}
