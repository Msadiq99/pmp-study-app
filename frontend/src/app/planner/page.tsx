"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";

interface Task {
  id: number;
  title: string;
  area: string;
  type: "quiz" | "flashcard" | "reading" | "formula" | "review";
  priority: "high" | "medium" | "low";
  done: boolean;
  ai?: boolean;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  quiz: { icon: "📝", color: "#6366f1" },
  flashcard: { icon: "🃏", color: "#10b981" },
  reading: { icon: "📖", color: "#38bdf8" },
  formula: { icon: "∑", color: "#f59e0b" },
  review: { icon: "🔁", color: "#a78bfa" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: "High", color: "#f43f5e" },
  medium: { label: "Medium", color: "#f59e0b" },
  low: { label: "Low", color: "#10b981" },
};

const AI_SUGGESTIONS: Task[] = [
  { id: 100, title: "Practice 15 Schedule Management questions", area: "Schedule", type: "quiz", priority: "high", done: false, ai: true },
  { id: 101, title: "Review Communication Channels formula", area: "Communication", type: "formula", priority: "high", done: false, ai: true },
  { id: 102, title: "Study Change Control Process", area: "Integration", type: "reading", priority: "medium", done: false, ai: true },
  { id: 103, title: "Complete Flashcard deck: Risk Management", area: "Risk", type: "flashcard", priority: "medium", done: false, ai: true },
];

const INITIAL_TODAY: Task[] = [
  { id: 1, title: "Review Stakeholder Engagement Matrix", area: "Stakeholder", type: "review", priority: "high", done: false },
  { id: 2, title: "Practice EVM calculations (CPI, SPI)", area: "Cost", type: "formula", priority: "high", done: false },
  { id: 3, title: "10-question quiz on Risk Management", area: "Risk", type: "quiz", priority: "medium", done: true },
];

const INITIAL_WEEK: Task[] = [
  { id: 10, title: "Complete PMBOK Ch. 4 review", area: "Integration", type: "reading", priority: "medium", done: false },
  { id: 11, title: "Agile vs Predictive comparison flashcards", area: "Agile", type: "flashcard", priority: "low", done: false },
  { id: 12, title: "Mock exam: Procurement domain", area: "Procurement", type: "quiz", priority: "medium", done: false },
];

function TaskCard({ task, onToggle, onMove, canMove }: {
  task: Task;
  onToggle: () => void;
  onMove?: () => void;
  canMove?: boolean;
}) {
  const tc = TYPE_CONFIG[task.type];
  const pc = PRIORITY_CONFIG[task.priority];
  return (
    <div
      className="p-4 rounded-xl transition-all duration-300 hover:-translate-y-0.5 group"
      style={{
        background: task.done ? "rgba(0,0,0,0.2)" : "var(--color-surface-3)",
        border: `1px solid ${task.done ? "rgba(255,255,255,0.04)" : "var(--color-border)"}`,
        boxShadow: task.done ? "none" : "var(--shadow-inset)",
        opacity: task.done ? 0.6 : 1,
      }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 transition-all duration-200"
          style={{
            background: task.done ? "linear-gradient(135deg,#10b981,#059669)" : "rgba(0,0,0,0.3)",
            border: `1px solid ${task.done ? "#10b981" : "var(--color-border-strong)"}`,
            boxShadow: task.done ? "0 0 8px rgba(16,185,129,0.4)" : "inset 0 1px 3px rgba(0,0,0,0.4)",
            color: "white",
            fontSize: "10px",
          }}
        >
          {task.done ? "✓" : ""}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm" style={{ color: tc.color }}>{tc.icon}</span>
            {task.ai && <span className="badge badge-primary text-xs">✨ AI</span>}
            <span className="badge text-xs" style={{ background: `${pc.color}20`, color: pc.color, border: `1px solid ${pc.color}40` }}>
              {pc.label}
            </span>
          </div>
          <p className={`text-sm font-medium ${task.done ? "line-through" : ""}`}
            style={{ color: task.done ? "var(--color-muted-foreground)" : "var(--color-foreground)" }}>
            {task.title}
          </p>
          <div className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{task.area}</div>
        </div>
      </div>

      {canMove && onMove && (
        <div className="mt-3 pt-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderTop: "1px solid var(--color-border)" }}>
          <button onClick={onMove} className="text-xs font-semibold" style={{ color: "var(--color-primary-light)" }}>
            + Move to Today
          </button>
        </div>
      )}
    </div>
  );
}

function Column({ title, icon, accent, tasks, onToggle, onMove, canMove, badge }: {
  title: string; icon: string; accent: string; tasks: Task[];
  onToggle: (id: number) => void;
  onMove?: (task: Task) => void;
  canMove?: boolean;
  badge?: string;
}) {
  const done = tasks.filter(t => t.done).length;
  return (
    <div className="flex flex-col" style={{ minHeight: "400px" }}>
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="text-base">{icon}</span>
        <h2 className="font-bold text-sm" style={{ color: "var(--color-foreground)" }}>{title}</h2>
        {badge && <span className="badge badge-primary ml-auto">{badge}</span>}
        <span className="ml-auto text-xs font-mono" style={{ color: "var(--color-muted-foreground)" }}>
          {done}/{tasks.length}
        </span>
      </div>

      {/* Progress */}
      <div className="progress-track mb-4">
        <div className="progress-fill"
          style={{
            width: tasks.length ? `${(done / tasks.length) * 100}%` : "0%",
            background: `linear-gradient(90deg,${accent}cc,${accent})`,
            boxShadow: `0 0 8px ${accent}60`,
          }} />
      </div>

      <div className="space-y-3">
        {tasks.map(t => (
          <TaskCard
            key={t.id} task={t}
            onToggle={() => onToggle(t.id)}
            onMove={onMove ? () => onMove(t) : undefined}
            canMove={canMove}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8" style={{ color: "var(--color-muted-foreground)" }}>
            <div className="text-3xl mb-2 animate-float">✅</div>
            <p className="text-sm">All clear!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlannerPage() {
  const [todayTasks, setTodayTasks] = useState<Task[]>(INITIAL_TODAY);
  const [weekTasks, setWeekTasks] = useState<Task[]>(INITIAL_WEEK);
  const [backlog, setBacklog] = useState<Task[]>(AI_SUGGESTIONS);

  const toggleToday = (id: number) => setTodayTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const toggleWeek = (id: number) => setWeekTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const moveToToday = (task: Task) => {
    setBacklog(b => b.filter(t => t.id !== task.id));
    setTodayTasks(ts => [...ts, { ...task, done: false }]);
  };

  const completedToday = todayTasks.filter(t => t.done).length;
  const totalToday = todayTasks.length;

  return (
    <AppShell>
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--color-foreground)" }}>Study Planner</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          {completedToday > 0 && (
            <div className="badge badge-emerald text-sm px-4 py-2">
              🎯 {completedToday}/{totalToday} done today
            </div>
          )}
        </div>

        {/* Daily Summary Banner */}
        <div className="card-skeu p-5 mb-6"
          style={{
            background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))",
            border: "1px solid rgba(99,102,241,0.25)",
          }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">📅</div>
              <div>
                <div className="font-bold" style={{ color: "var(--color-foreground)" }}>
                  Today's Focus: Schedule Management
                </div>
                <div className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  AI identified this as your weakest area — 3 tasks queued
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="inset-panel px-4 py-2 text-center">
                <div className="text-xl font-black" style={{ color: "var(--color-primary-light)" }}>{totalToday - completedToday}</div>
                <div className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>remaining</div>
              </div>
              <div className="inset-panel px-4 py-2 text-center">
                <div className="text-xl font-black" style={{ color: "var(--color-emerald)" }}>{completedToday}</div>
                <div className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-skeu p-5">
            <Column title="Today" icon="🎯" accent="#6366f1" tasks={todayTasks} onToggle={toggleToday} />
          </div>
          <div className="card-skeu p-5">
            <Column title="This Week" icon="📆" accent="#10b981" tasks={weekTasks} onToggle={toggleWeek} />
          </div>
          <div className="card-skeu p-5">
            <Column
              title="AI Suggestions"
              icon="✨" accent="#f59e0b"
              tasks={backlog}
              onToggle={() => {}}
              onMove={moveToToday}
              canMove
              badge="AI"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
