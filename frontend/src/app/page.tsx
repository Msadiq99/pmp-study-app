"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FEATURES = [
  { icon: "📚", title: "Upload & Learn", desc: "Upload PMBOK PDFs. AI extracts content and generates adaptive study materials automatically.", color: "#6366f1" },
  { icon: "🧠", title: "Adaptive Learning", desc: "FSRS spaced repetition and personalized study paths that evolve with your performance.", color: "#10b981" },
  { icon: "🎯", title: "Exam Simulation", desc: "180-question timed exams matching the real PMP test format and domain distribution.", color: "#f59e0b" },
  { icon: "🤖", title: "AI Tutor Chat", desc: "Ask anything about PMP concepts and get cited answers backed by your own documents.", color: "#38bdf8" },
  { icon: "∑", title: "EVM Formula Lab", desc: "Interactive sliders for real-time Earned Value calculations with live AI assessment.", color: "#a78bfa" },
  { icon: "🔗", title: "ITTO Knowledge Graph", desc: "Visual interactive map of PMBOK Inputs, Tools, and Outputs for every process.", color: "#f43f5e" },
  { icon: "⏱", title: "Focus Timer", desc: "Skeuomorphic Pomodoro timer with session tracking and deep work mode.", color: "#6366f1" },
  { icon: "📊", title: "Pass Predictor", desc: "AI-powered probability engine that scores your readiness by PMI exam domain.", color: "#10b981" },
  { icon: "📅", title: "Study Planner", desc: "Kanban-style daily planner with AI-suggested tasks based on your weak areas.", color: "#f59e0b" },
];

const STATS = [
  { value: "180", label: "Exam Questions", suffix: "" },
  { value: "47", label: "PMP Formulas", suffix: "+" },
  { value: "12", label: "PMBOK Domains", suffix: "" },
  { value: "3", label: "AI Study Modes", suffix: "" },
];

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", "dummy-bypass-token");
      localStorage.setItem("user", JSON.stringify({ id: 1, email: "demo@pmpstudy.app", username: "DemoUser" }));
      // Small delay for the animation to show, then redirect
      const t = setTimeout(() => router.push("/dashboard"), 1800);
      return () => clearTimeout(t);
    }
  }, [router]);

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background: "var(--color-background, #0a0f1e)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", top: "-10%", left: "-10%",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", bottom: "0%", right: "-5%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", top: "40%", right: "20%",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.06), transparent 70%)",
          filter: "blur(30px)",
        }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,15,30,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "1rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "linear-gradient(135deg, #818cf8, #4f46e5)",
            boxShadow: "0 0 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "white", fontSize: "1rem",
          }}>P</div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#e2e8f0" }}>PMP Master</span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            padding: "0.5rem 1.25rem",
            background: "linear-gradient(135deg, #818cf8, #4f46e5)",
            color: "white", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "0.75rem", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
            boxShadow: "0 0 16px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          Enter Platform →
        </button>
      </nav>

      {/* Hero Section */}
      <main style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ textAlign: "center", paddingTop: "5rem", paddingBottom: "4rem" }}>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.35rem 1rem", borderRadius: "9999px",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em",
            color: "#818cf8", marginBottom: "1.5rem",
          }}>
            ✨ AI-POWERED PMP PREPARATION PLATFORM
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 900, lineHeight: 1.1,
            color: "#e2e8f0", marginBottom: "1.5rem",
          }}>
            Ace Your{" "}
            <span style={{
              background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              PMP Certification
            </span>
            <br />on the First Try
          </h1>

          <p style={{
            fontSize: "1.125rem", color: "#94a3b8", maxWidth: "600px",
            margin: "0 auto 2.5rem", lineHeight: 1.7,
          }}>
            Intelligent study tools powered by your own uploaded materials — adaptive quizzes, 
            EVM formula sandbox, ITTO knowledge graphs, and a live pass predictor.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "0.875rem 2rem",
                background: "linear-gradient(135deg, #818cf8, #4f46e5)",
                color: "white", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "0.875rem", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                boxShadow: "0 0 30px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(0,0,0,0.4)",
                position: "relative", overflow: "hidden",
              }}
            >
              🚀 Start Studying Free
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "0.875rem 2rem",
                background: "transparent",
                color: "#94a3b8", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "0.875rem", fontWeight: 600, fontSize: "1rem", cursor: "pointer",
              }}
            >
              View Dashboard →
            </button>
          </div>

          {/* Stats Row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem", maxWidth: "700px", margin: "0 auto 5rem",
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                padding: "1.25rem 0.75rem",
                background: "linear-gradient(135deg, rgba(26,34,52,0.8), rgba(17,24,39,0.8))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: "2rem", fontWeight: 900, fontFamily: "JetBrains Mono, monospace",
                  background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {s.value}{s.suffix}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, marginTop: "0.25rem", letterSpacing: "0.05em" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div style={{ marginBottom: "6rem" }}>
          <h2 style={{
            textAlign: "center", fontSize: "1.75rem", fontWeight: 800,
            color: "#e2e8f0", marginBottom: "0.75rem",
          }}>
            Everything you need to pass
          </h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: "3rem", fontSize: "0.95rem" }}>
            9 purpose-built tools, all in one premium platform
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                onClick={() => router.push("/dashboard")}
                style={{
                  padding: "1.5rem",
                  background: "linear-gradient(135deg, rgba(26,34,52,0.8), rgba(17,24,39,0.7))",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "1.25rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                  opacity: mounted ? 1 : 0,
                  animation: mounted ? `slideUp 0.4s ease ${i * 0.05}s forwards` : "none",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.borderColor = `${f.color}40`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 30px -10px ${f.color}60`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)";
                }}
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `${f.color}20`, border: `1px solid ${f.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.25rem", marginBottom: "1rem",
                  boxShadow: `0 0 16px ${f.color}20`,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.5rem" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.825rem", color: "#64748b", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Redirect notice */}
        <div style={{ textAlign: "center", paddingBottom: "3rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1.5rem", borderRadius: "9999px",
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            fontSize: "0.8rem", color: "#34d399",
          }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#10b981",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            Redirecting to dashboard automatically…
          </div>
        </div>
      </main>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
