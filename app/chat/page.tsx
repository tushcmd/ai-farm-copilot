"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/context/AnalysisContext";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestedChips } from "@/components/chat/SuggestedChips";
import { Message } from "@/types";
import { Sprout } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const { parsedData, messages, addMessage, isChatLoading, setIsChatLoading } = useAnalysis();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!parsedData) router.replace("/");
  }, [parsedData, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessage = async (content: string) => {
    if (!parsedData || isChatLoading || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setIsChatLoading(true);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, csvSummary: parsedData.csvSummary }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setStreamingContent(full);
        }
      }

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: full,
        timestamp: new Date(),
      });
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      });
    } finally {
      setStreamingContent("");
      setIsStreaming(false);
      setIsChatLoading(false);
    }
  };

  if (!parsedData) return null;

  return (
    <div className="flex-1 flex flex-col h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="px-6 py-4 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#dcfce7" }}>
            <Sprout className="w-4 h-4" style={{ color: "#16a34a" }} />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Farm Copilot</div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Knows your {parsedData.rows.length} orders · {parsedData.dateRange.start} – {parsedData.dateRange.end}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />GPT-4o
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" data-testid="messages-container">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-6">
            <div className="text-center space-y-1">
              <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>What do you want to know?</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                I have full access to your MicrorootsKE sales data.
              </div>
            </div>
            <SuggestedChips onSelect={sendMessage} />
          </div>
        )}

        {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}

        {isStreaming && streamingContent && (
          <ChatBubble message={{ id: "streaming", role: "assistant", content: streamingContent, timestamp: new Date() }} />
        )}

        {isStreaming && !streamingContent && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: "#dcfce7" }}>
              <Sprout className="w-3.5 h-3.5" style={{ color: "#16a34a" }} />
            </div>
            <div className="rounded-2xl px-4 py-3 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "var(--muted-foreground)", animationDelay: `${i * 150}ms`, opacity: 0.5 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-6 shrink-0">
        <ChatInput onSend={sendMessage} isLoading={isChatLoading || isStreaming} />
      </div>
    </div>
  );
}
