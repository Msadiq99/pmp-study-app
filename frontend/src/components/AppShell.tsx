"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "⊞", label: "Dashboard", section: "main" },
  { href: "/quiz", icon: "📝", label: "Practice Quiz", section: "study" },
  { href: "/exam", icon: "🎯", label: "Exam Simulator", section: "study" },
  { href: "/flashcards", icon: "🃏", label: "Flashcards", section: "study" },
  { href: "/chat", icon: "🤖", label: "AI Tutor", section: "study" },
  { href: "/formulas", icon: "∑", label: "EVM Formulas", section: "tools" },
  { href: "/ittos", icon: "🔗", label: "ITTO Graph", section: "tools" },
  { href: "/planner", icon: "📅", label: "Study Planner", section: "tools" },
  { href: "/timer", icon: "⏱", label: "Focus Timer", section: "tools" },
  { href: "/predictor", icon: "📊", label: "Pass Predictor", section: "tools" },
  { href: "/analytics", icon: "📈", label: "Analytics", section: "insights" },
  { href: "/upload", icon: "⬆", label: "Upload Docs", section: "insights" },
  { href: "/groups", icon: "👥", label: "Study Groups", section: "insights" },
  { href: "/voice", icon: "🎙", label: "Voice Mode", section: "insights" },
];

const SECTION_LABELS: Record<string, string> = {
  main: "OVERVIEW",
  study: "STUDY TOOLS",
  tools: "POWER TOOLS",
  insights: "INSIGHTS",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [daysUntilExam] = useState(47);
  const [showSettings, setShowSettings] = useState(false);
  const [aiProvider, setAiProvider] = useState("");
  const [aiModel, setAiModel] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("study_streak");
    setStreak(stored ? parseInt(stored) : 7);
    setAiProvider(localStorage.getItem("x_ai_provider") || "ollama_local");
    setAiModel(localStorage.getItem("x_ai_model") || "llama3.2");
  }, []);

  const saveSettings = () => {
    localStorage.setItem("x_ai_provider", aiProvider);
    localStorage.setItem("x_ai_model", aiModel);
    setShowSettings(false);
  };

  const modelOptions: Record<string, string[]> = {
    "ollama_local": ["llama3.2", "llama3", "mistral", "gemma2"],
    "ollama_cloud": ["llama3.2", "llama3", "mistral", "gemma2"],
    "openai": ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
    "claude": ["claude-3-5-sonnet-20240620", "claude-3-haiku-20240307", "claude-3-opus-20240229"],
    "gemini": ["gemini-1.5-pro", "gemini-1.5-flash"]
  };

  const groupedNav = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof NAV_ITEMS>);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-background)" }}>
      {/* ===== SIDEBAR ===== */}
      <aside
        className="glass-sidebar flex flex-col shrink-0 transition-all duration-300 z-50"
        style={{ width: collapsed ? "64px" : "240px" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div
            className="flex items-center justify-center rounded-xl text-white font-black text-sm shrink-0 animate-pulse-glow"
            style={{
              width: "36px", height: "36px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              boxShadow: "0 0 16px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            P
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <div className="font-bold text-sm" style={{ color: "var(--color-foreground)" }}>PMP Master</div>
              <div className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Study Platform</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-xs rounded-lg p-1 transition-colors"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* Exam Countdown */}
        {!collapsed && (
          <div className="mx-3 mt-3 p-3 rounded-xl animate-slide-up" style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))",
            border: "1px solid rgba(99,102,241,0.25)",
          }}>
            <div className="text-xs font-semibold mb-1" style={{ color: "var(--color-muted-foreground)" }}>EXAM COUNTDOWN</div>
            <div className="font-black text-2xl gradient-text">{daysUntilExam}</div>
            <div className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>days remaining</div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {Object.entries(groupedNav).map(([section, items]) => (
            <div key={section} className="mb-2">
              {!collapsed && (
                <div className="px-3 py-1.5 text-xs font-bold tracking-widest"
                  style={{ color: "var(--color-muted-foreground)", opacity: 0.5 }}>
                  {SECTION_LABELS[section]}
                </div>
              )}
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? "active" : ""} ${collapsed ? "justify-center" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="text-base">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        {!collapsed && (
          <div className="p-3 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "var(--color-surface-2)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                D
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: "var(--color-foreground)" }}>DemoUser</div>
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: "var(--color-gold)" }}>🔥</span>
                  <span className="text-xs font-bold" style={{ color: "var(--color-gold)" }}>{streak} day streak</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="glass-navbar shrink-0 flex items-center justify-between px-6 py-3 z-40">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
              {NAV_ITEMS.find(n => n.href === pathname)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="badge badge-gold text-xs">
              🔥 {streak} day streak
            </div>
            <div className="badge badge-primary text-xs">
              ⏳ {daysUntilExam}d to exam
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="btn-ghost text-xs flex items-center gap-1"
            >
              <span>⚙️</span> Settings
            </button>
            <button
              onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
              className="btn-ghost text-xs"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass-panel p-6 rounded-2xl w-full max-w-md animate-scale-up border" style={{ borderColor: "var(--color-border)" }}>
              <h2 className="text-xl font-bold mb-4 gradient-text">AI Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-muted-foreground)" }}>AI Provider</label>
                  <select
                    value={aiProvider}
                    onChange={(e) => {
                      setAiProvider(e.target.value);
                      setAiModel(modelOptions[e.target.value]?.[0] || "");
                    }}
                    className="w-full p-2 rounded-lg bg-black/20 border text-white"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <option value="ollama_local">Ollama (Local)</option>
                    <option value="ollama_cloud">Ollama (Cloud)</option>
                    <option value="openai">OpenAI</option>
                    <option value="claude">Anthropic Claude</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-muted-foreground)" }}>Model</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/20 border text-white"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {(modelOptions[aiProvider] || []).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "var(--color-background)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
