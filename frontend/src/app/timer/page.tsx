"use client";
import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";

const MODES = [
  { label: "Focus", minutes: 25, color: "#6366f1", glow: "rgba(99,102,241,0.5)", icon: "🎯" },
  { label: "Short Break", minutes: 5, color: "#10b981", glow: "rgba(16,185,129,0.5)", icon: "☕" },
  { label: "Long Break", minutes: 15, color: "#38bdf8", glow: "rgba(56,189,248,0.5)", icon: "🌿" },
];

const SESSIONS_PER_SET = 4;

export default function TimerPage() {
  const [modeIdx, setModeIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mode = MODES[modeIdx];

  // Reset timer when mode changes
  useEffect(() => {
    pause();
    setSecondsLeft(mode.minutes * 60);
  }, [modeIdx]);

  // Countdown logic
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (modeIdx === 0) {
              setSessionsToday(p => p + 1);
              setTotalToday(p => p + MODES[0].minutes);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  const pause = () => {
    setRunning(false);
    clearInterval(intervalRef.current!);
  };

  const reset = () => {
    pause();
    setSecondsLeft(mode.minutes * 60);
  };

  const total = mode.minutes * 60;
  const progress = 1 - secondsLeft / total;
  const R = 110;
  const C = 2 * Math.PI * R;
  const dashOffset = C * (1 - progress);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: "var(--color-foreground)" }}>Focus Timer</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            Pomodoro-style deep work sessions for maximum retention
          </p>
        </div>

        {/* Mode Selector */}
        <div
          className="flex gap-2 mb-8 p-1.5 rounded-2xl"
          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
        >
          {MODES.map((m, i) => (
            <button
              key={m.label}
              onClick={() => setModeIdx(i)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
              style={{
                background: i === modeIdx ? `linear-gradient(135deg,${m.color}40,${m.color}20)` : "transparent",
                border: i === modeIdx ? `1px solid ${m.color}60` : "1px solid transparent",
                color: i === modeIdx ? m.color : "var(--color-muted-foreground)",
                boxShadow: i === modeIdx ? `0 0 16px ${m.color}30` : "none",
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Clock Face — Skeuomorphic Circle */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            {/* Outer bezel ring */}
            <div
              className="rounded-full"
              style={{
                width: 300, height: 300,
                background: "linear-gradient(145deg, #1e2540, #0d1020)",
                boxShadow: `0 0 0 2px rgba(255,255,255,0.04), 0 0 60px ${mode.glow}40, 0 8px 32px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.05), inset 0 -2px 4px rgba(0,0,0,0.5)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}
            >
              {/* SVG arc */}
              <svg width="300" height="300" viewBox="0 0 300 300" className="absolute inset-0 -rotate-90">
                {/* Track */}
                <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="14" />
                {/* Progress Arc */}
                <circle
                  cx="150" cy="150" r={R}
                  fill="none"
                  stroke={mode.color}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={dashOffset}
                  style={{
                    transition: running ? "stroke-dashoffset 1s linear" : "none",
                    filter: `drop-shadow(0 0 10px ${mode.color})`,
                  }}
                />
              </svg>

              {/* Clock Face Center */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-xs font-black tracking-widest mb-2 uppercase" style={{ color: mode.color }}>
                  {mode.icon} {mode.label}
                </div>
                <div
                  className="font-black text-6xl font-mono tracking-tight"
                  style={{
                    color: "var(--color-foreground)",
                    textShadow: `0 0 30px ${mode.glow}`,
                    letterSpacing: "-2px",
                  }}
                >
                  {mins}:{secs}
                </div>
                <div className="text-xs mt-2 font-semibold" style={{ color: "var(--color-muted-foreground)" }}>
                  {Math.round(progress * 100)}% complete
                </div>
              </div>

              {/* Tick marks */}
              {Array.from({ length: 60 }, (_, i) => {
                const angle = (i * 6 - 90) * (Math.PI / 180);
                const isMajor = i % 5 === 0;
                const r1 = 135, r2 = isMajor ? 125 : 130;
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      width: "2px", height: isMajor ? "10px" : "5px",
                      background: isMajor ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                      left: "50%",
                      top: `calc(50% - ${r2}px)`,
                      transform: `translateX(-50%) rotate(${i * 6}deg)`,
                      transformOrigin: `1px ${r2}px`,
                      borderRadius: "1px",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={reset} className="btn-ghost w-24">↺ Reset</button>
          <button
            onClick={() => setRunning(r => !r)}
            className="btn-primary w-32 text-base"
            style={{
              background: running
                ? "linear-gradient(135deg,#f43f5e,#be123c)"
                : `linear-gradient(135deg,${mode.color},${mode.color}cc)`,
              boxShadow: `var(--shadow-btn), 0 0 20px ${running ? "rgba(244,63,94,0.4)" : mode.glow}`,
            }}
          >
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
        </div>

        {/* Session Progress */}
        <div className="card-skeu p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: "var(--color-foreground)" }}>Today's Progress</h3>
            <span className="badge badge-gold">🔥 {totalToday} min focused</span>
          </div>

          <div className="flex gap-2 mb-4">
            {Array.from({ length: SESSIONS_PER_SET }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-3 rounded-full transition-all duration-500"
                style={{
                  background: i < sessionsToday % SESSIONS_PER_SET || (sessionsToday > 0 && sessionsToday % SESSIONS_PER_SET === 0)
                    ? `linear-gradient(90deg,${MODES[0].color},${MODES[0].color}cc)`
                    : "rgba(0,0,0,0.4)",
                  boxShadow: i < sessionsToday % SESSIONS_PER_SET
                    ? `0 0 8px ${MODES[0].glow}` : "inset 0 1px 3px rgba(0,0,0,0.5)",
                }}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="inset-panel py-3">
              <div className="text-2xl font-black font-mono" style={{ color: MODES[0].color }}>{sessionsToday}</div>
              <div className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>Sessions</div>
            </div>
            <div className="inset-panel py-3">
              <div className="text-2xl font-black font-mono" style={{ color: "var(--color-gold)" }}>{totalToday}</div>
              <div className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>Minutes</div>
            </div>
            <div className="inset-panel py-3">
              <div className="text-2xl font-black font-mono" style={{ color: "var(--color-emerald)" }}>
                {Math.floor(sessionsToday / SESSIONS_PER_SET)}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>Full Sets</div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl text-sm" style={{
            background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.05))",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "var(--color-muted-foreground)",
          }}>
            💡 <strong style={{ color: "var(--color-primary-light)" }}>Tip:</strong> Research shows that 4 focused Pomodoro sessions
            per day maximises long-term retention for certification exams.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
