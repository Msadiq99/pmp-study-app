"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { analytics } from "@/lib/api";
import AppShell from "@/components/AppShell";

// Animated radial gauge
function ReadinessGauge({ score }: { score: number }) {
  const [animScore, setAnimScore] = useState(0);
  const R = 54, C = 2 * Math.PI * R;
  const offset = C - (animScore / 100) * C;

  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";
  const label = score >= 70 ? "Exam Ready" : score >= 50 ? "On Track" : "Needs Work";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="10"
            style={{ filter: "drop-shadow(inset 0 2px 4px rgba(0,0,0,0.5))" }} />
          <circle cx="70" cy="70" r={R} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)",
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color, textShadow: `0 0 20px ${color}` }}>
            {animScore}%
          </span>
          <span className="text-xs font-bold" style={{ color: "var(--color-muted-foreground)" }}>{label}</span>
        </div>
      </div>
      <div className="text-sm font-semibold mt-2" style={{ color: "var(--color-muted-foreground)" }}>Exam Readiness</div>
    </div>
  );
}

// Animated counter
function AnimCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <>{val}{suffix}</>;
}

// Mastery heatmap cell
function HeatCell({ mastery, area }: { mastery: number; area: string }) {
  const bg =
    mastery >= 80 ? "rgba(16,185,129,0.7)" :
    mastery >= 60 ? "rgba(245,158,11,0.6)" :
    mastery >= 40 ? "rgba(244,63,94,0.5)" :
    "rgba(100,116,139,0.3)";
  return (
    <div
      className="relative group cursor-default flex items-center justify-center rounded-lg text-xs font-bold text-white transition-all duration-300 hover:scale-110"
      style={{
        background: bg,
        boxShadow: `0 0 12px ${bg}, inset 0 1px 0 rgba(255,255,255,0.2)`,
        height: "52px",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      title={`${area}: ${mastery}%`}
    >
      {mastery}%
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
        {area}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { href: "/quiz", label: "Start Quiz", icon: "📝", gradient: "linear-gradient(135deg,#6366f1,#4f46e5)" },
  { href: "/exam", label: "Exam Sim", icon: "🎯", gradient: "linear-gradient(135deg,#a78bfa,#7c3aed)" },
  { href: "/flashcards", label: "Flashcards", icon: "🃏", gradient: "linear-gradient(135deg,#10b981,#059669)" },
  { href: "/chat", label: "AI Tutor", icon: "🤖", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
  { href: "/formulas", label: "EVM Lab", icon: "∑", gradient: "linear-gradient(135deg,#38bdf8,#0284c7)" },
  { href: "/timer", label: "Focus Timer", icon: "⏱", gradient: "linear-gradient(135deg,#f43f5e,#be123c)" },
];

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    analytics.dashboard()
      .then((r) => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--color-background)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl animate-pulse-glow" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }} />
        <div className="text-sm animate-pulse" style={{ color: "var(--color-muted-foreground)" }}>Loading dashboard…</div>
      </div>
    </div>
  );

  const stats = [
    { label: "Readiness", value: data?.readiness_score ?? 0, suffix: "%", icon: "🎯", cls: "stat-card-primary", accentColor: "#6366f1" },
    { label: "Study Streak", value: data?.study_streak ?? 0, suffix: "d", icon: "🔥", cls: "stat-card-gold", accentColor: "#f59e0b" },
    { label: "Flashcards", value: data?.flashcards_total ?? 0, suffix: "", icon: "🃏", cls: "stat-card-sky", accentColor: "#38bdf8" },
    { label: "Quizzes Taken", value: data?.quizzes_taken ?? 0, suffix: "", icon: "📝", cls: "stat-card-emerald", accentColor: "#10b981" },
    { label: "Study Sessions", value: data?.study_sessions ?? 0, suffix: "", icon: "📅", cls: "stat-card-rose", accentColor: "#f43f5e" },
  ];

  const heatmap = data?.mastery_heatmap ?? [];

  return (
    <AppShell>
      <div className="p-6 space-y-6 animate-fade-in">

        {/* ——— HERO BANNER ——— */}
        <div
          className="relative rounded-2xl overflow-hidden p-8 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, #1a1f3a 0%, #0f1729 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            boxShadow: "0 0 60px -20px rgba(99,102,241,0.4), var(--shadow-card)",
          }}
        >
          {/* Background glow blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
              style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
            <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full opacity-10 blur-3xl"
              style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
          </div>

          <div className="relative z-10">
            <div className="badge badge-primary mb-3">PMP PREPARATION PLATFORM</div>
            <h1 className="text-3xl font-black mb-2">
              Good morning, <span className="gradient-text">DemoUser</span> 👋
            </h1>
            <p className="text-sm mb-5" style={{ color: "var(--color-muted-foreground)" }}>
              You have <strong style={{ color: "var(--color-gold)" }}>3 weak areas</strong> to review and{" "}
              <strong style={{ color: "#818cf8" }}>47 days</strong> until your exam. Let's focus.
            </p>
            <div className="flex gap-3">
              <Link href="/quiz" className="btn-primary">📝 Start Practice Quiz</Link>
              <Link href="/chat" className="btn-ghost">🤖 Ask AI Tutor</Link>
            </div>
          </div>

          <div className="relative z-10 shrink-0 ml-8 hidden md:block">
            <ReadinessGauge score={data?.readiness_score ?? 0} />
          </div>
        </div>

        {/* ——— STAT CARDS ——— */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`stat-card ${s.cls} animate-slide-up delay-${(i + 1) * 100}`}
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black mb-0.5" style={{ color: s.accentColor, textShadow: `0 0 20px ${s.accentColor}60` }}>
                <AnimCounter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ——— MASTERY HEATMAP + RECENT QUIZZES ——— */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Mastery Grid */}
          <div className="card-skeu p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base" style={{ color: "var(--color-foreground)" }}>Mastery Heatmap</h2>
              <span className="badge badge-primary">12 Domains</span>
            </div>
            {heatmap.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {heatmap.map((item: any) => (
                  <HeatCell key={item.area} mastery={item.mastery} area={item.area} />
                ))}
              </div>
            ) : (
              <div className="inset-panel text-center py-8" style={{ color: "var(--color-muted-foreground)" }}>
                <div className="text-3xl mb-2 animate-float">📊</div>
                <p className="text-sm">Complete quizzes to build your heatmap</p>
              </div>
            )}

            {/* Weak Areas */}
            {data?.weak_areas?.length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
                <div className="text-xs font-bold mb-2" style={{ color: "var(--color-muted-foreground)" }}>⚠️ FOCUS AREAS</div>
                <div className="flex flex-wrap gap-2">
                  {data.weak_areas.map((a: string) => (
                    <span key={a} className="badge badge-rose">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Quizzes */}
          <div className="card-skeu p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base" style={{ color: "var(--color-foreground)" }}>Recent Quizzes</h2>
              <Link href="/quiz" className="text-xs" style={{ color: "var(--color-primary-light)" }}>View all →</Link>
            </div>
            <div className="space-y-3">
              {(data?.recent_quizzes ?? []).map((q: any) => (
                <div key={q.id} className="p-3 rounded-xl flex items-center justify-between transition-colors"
                  style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{q.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                      {new Date(q.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-lg font-black"
                    style={{ color: q.score >= 70 ? "var(--color-emerald)" : "var(--color-rose)", textShadow: `0 0 10px ${q.score >= 70 ? "rgba(16,185,129,0.5)" : "rgba(244,63,94,0.5)"}` }}>
                    {q.score}%
                  </div>
                </div>
              ))}
              {(!data?.recent_quizzes?.length) && (
                <div className="text-center py-8" style={{ color: "var(--color-muted-foreground)" }}>
                  <div className="text-3xl mb-2 animate-float">📝</div>
                  <p className="text-sm">No quizzes yet — start one!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ——— QUICK ACTION DOCK ——— */}
        <div className="card-skeu p-5">
          <div className="text-xs font-bold mb-4" style={{ color: "var(--color-muted-foreground)" }}>⚡ QUICK ACTIONS</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
                style={{
                  background: "var(--color-surface-3)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-inset)",
                  textDecoration: "none",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: a.gradient,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}>
                  {a.icon}
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--color-foreground)" }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
