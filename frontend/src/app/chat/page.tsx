"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { chat } from "@/lib/api";
import AppShell from "@/components/AppShell";

const SUGGESTED_PROMPTS = [
  "What are the 5 process groups in PMBOK?",
  "Explain Earned Value Management simply",
  "What's the difference between risk and issue?",
  "How does Agile differ from Predictive PM?",
  "Walk me through PERT estimation",
  "What is the critical path method?",
  "Explain stakeholder engagement levels",
  "How do you calculate CPI and SPI?",
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await chat.send(msg);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.response,
        sources: res.data.sources,
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full" style={{ height: "calc(100vh - 57px)" }}>

        {/* ——— Messages Area ——— */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5 animate-float"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                  boxShadow: "var(--shadow-glow-primary), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                🤖
              </div>
              <h2 className="text-2xl font-black mb-2 gradient-text">AI PMP Tutor</h2>
              <p className="text-sm max-w-sm mb-8" style={{ color: "var(--color-muted-foreground)" }}>
                Ask me anything about PMP concepts, formulas, processes, or Agile frameworks. Backed by your uploaded study materials.
              </p>

              {/* Suggested Prompts */}
              <div className="w-full max-w-2xl">
                <div className="text-xs font-bold mb-3" style={{ color: "var(--color-muted-foreground)" }}>
                  SUGGESTED QUESTIONS
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="text-left p-3 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02]"
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-foreground)",
                        boxShadow: "var(--shadow-inset)",
                      }}
                    >
                      <span style={{ color: "var(--color-primary-light)" }}>→ </span>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 mt-1"
                style={{
                  background: msg.role === "user"
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "linear-gradient(135deg,#0f172a,#1a2234)",
                  border: "1px solid var(--color-border)",
                  boxShadow: msg.role === "user" ? "var(--shadow-glow-primary)" : "var(--shadow-card)",
                  color: "white",
                }}
              >
                {msg.role === "user" ? "D" : "🤖"}
              </div>

              {/* Bubble */}
              <div className="max-w-[80%] space-y-2">
                <div
                  className="p-4 rounded-2xl leading-relaxed"
                  style={{
                    background: msg.role === "user"
                      ? "linear-gradient(135deg,rgba(99,102,241,0.35),rgba(99,102,241,0.2))"
                      : "var(--color-surface-2)",
                    border: `1px solid ${msg.role === "user" ? "rgba(99,102,241,0.4)" : "var(--color-border)"}`,
                    boxShadow: msg.role === "user"
                      ? "0 0 20px rgba(99,102,241,0.15)"
                      : "var(--shadow-card)",
                    color: "var(--color-foreground)",
                    fontSize: "0.875rem",
                    borderTopRightRadius: msg.role === "user" ? "4px" : "1rem",
                    borderTopLeftRadius: msg.role === "assistant" ? "4px" : "1rem",
                  }}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Sources */}
                {msg.sources?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((s: any, j: number) => (
                      <span key={j} className="badge badge-sky text-xs">
                        📄 {s.filename}{s.page ? ` · p.${s.page}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 animate-slide-up">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                style={{ background: "linear-gradient(135deg,#0f172a,#1a2234)", border: "1px solid var(--color-border)" }}>
                🤖
              </div>
              <div className="p-4 rounded-2xl" style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderTopLeftRadius: "4px",
              }}>
                <div className="flex gap-1.5 items-center h-5">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ——— Input Bar ——— */}
        <div
          className="shrink-0 p-4"
          style={{
            background: "rgba(10,15,30,0.9)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {/* Quick prompts (when chat is active) */}
          {messages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
              {SUGGESTED_PROMPTS.slice(0, 4).map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
                  style={{
                    background: "var(--color-surface-3)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted-foreground)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about PMP concepts, formulas, or exam strategies…"
              className="input-skeu flex-1"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="btn-primary px-5"
              style={{ opacity: (!input.trim() && !loading) ? 0.5 : 1 }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : "Send ↑"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
