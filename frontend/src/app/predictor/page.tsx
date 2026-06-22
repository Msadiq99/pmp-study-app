"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";

const DOMAINS = [
  { id: "people", label: "People Domain", weight: 0.42, description: "Leadership, team management, stakeholder engagement", icon: "👥", color: "#6366f1" },
  { id: "process", label: "Process Domain", weight: 0.50, description: "Technical PM skills, planning, monitoring, EVM", icon: "⚙️", color: "#10b981" },
  { id: "business", label: "Business Environment", weight: 0.08, description: "Strategic alignment, benefits, organizational change", icon: "🏢", color: "#f59e0b" },
];

const FORMULA_AREAS = [
  { id: "evm", label: "Earned Value Mgmt", icon: "💰" },
  { id: "schedule", label: "Schedule Analysis", icon: "📅" },
  { id: "risk", label: "Risk Quantification", icon: "⚠️" },
  { id: "comms", label: "Communication Math", icon: "📡" },
];

function getPassProbability(scores: Record<string, number>, formulaScores: Record<string, number>): number {
  const PASS_THRESHOLD = 0.7;
  const domains = DOMAINS;
  let weightedScore = 0;
  domains.forEach(d => {
    weightedScore += (scores[d.id] ?? 50) / 100 * d.weight;
  });
  // Formula proficiency adds up to 10% bonus
  const formulaBonus = Object.values(formulaScores).reduce((a, b) => a + b, 0) / (FORMULA_AREAS.length * 100) * 0.10;
  const raw = Math.min(1, weightedScore + formulaBonus);
  // Sigmoid-like mapping to pass probability
  const k = 12;
  const prob = 1 / (1 + Math.exp(-k * (raw - PASS_THRESHOLD)));
  return Math.round(prob * 100);
}

function getRating(score: number) {
  if (score >= 85) return { label: "Above Target", color: "#10b981", glow: "rgba(16,185,129,0.5)", emoji: "🏆" };
  if (score >= 70) return { label: "On Track", color: "#f59e0b", glow: "rgba(245,158,11,0.5)", emoji: "✅" };
  if (score >= 55) return { label: "Needs Work", color: "#f59e0b", glow: "rgba(245,158,11,0.4)", emoji: "⚠️" };
  return { label: "High Risk", color: "#f43f5e", glow: "rgba(244,63,94,0.5)", emoji: "🚨" };
}

function getRecommendations(scores: Record<string, number>, prob: number): string[] {
  const recs: string[] = [];
  if (scores.people < 65) recs.push("Focus on stakeholder engagement and conflict resolution techniques.");
  if (scores.process < 65) recs.push("Drill EVM formulas (CPI, SPI, EAC) and schedule compression methods.");
  if (scores.business < 65) recs.push("Review benefits realization and business case justification frameworks.");
  if (prob < 70) recs.push("Take at least 2 full 180-question practice exams before exam day.");
  if (prob >= 80) recs.push("You're on track! Keep up daily reviews and maintain your study streak.");
  return recs.length ? recs : ["Great preparation! Stay consistent and review any weak spots weekly."];
}

export default function PredictorPage() {
  const [scores, setScores] = useState<Record<string, number>>({ people: 60, process: 55, business: 50 });
  const [formulaScores, setFormulaScores] = useState<Record<string, number>>({ evm: 60, schedule: 50, risk: 55, comms: 65 });

  const prob = getPassProbability(scores, formulaScores);
  const rating = getRating(prob);
  const recommendations = getRecommendations(scores, prob);

  const R = 80, C = 2 * Math.PI * R;
  const dashOffset = C - (prob / 100) * C;

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: "var(--color-foreground)" }}>PMP Pass Predictor</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            Adjust your estimated domain scores to see your predicted pass probability
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">

          {/* Left — Sliders */}
          <div className="md:col-span-3 space-y-5">

            {/* Domain Scores */}
            <div className="card-skeu p-6">
              <h2 className="font-bold text-sm mb-5" style={{ color: "var(--color-foreground)" }}>
                Domain Self-Assessment
              </h2>
              <div className="space-y-6">
                {DOMAINS.map(d => {
                  const val = scores[d.id] ?? 50;
                  const r = getRating(val);
                  return (
                    <div key={d.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{d.icon}</span>
                            <span className="text-sm font-bold" style={{ color: "var(--color-foreground)" }}>{d.label}</span>
                            <span className="badge text-xs" style={{ background: `${d.color}25`, color: d.color, border: `1px solid ${d.color}50` }}>
                              {Math.round(d.weight * 100)}% of exam
                            </span>
                          </div>
                          <div className="text-xs ml-8 mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>{d.description}</div>
                        </div>
                        <div className="text-xl font-black font-mono shrink-0 ml-4"
                          style={{ color: r.color, textShadow: `0 0 12px ${r.glow}` }}>
                          {val}%
                        </div>
                      </div>
                      <input
                        type="range" min={0} max={100} value={val}
                        onChange={e => setScores(p => ({ ...p, [d.id]: parseInt(e.target.value) }))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${d.color} 0%, ${d.color} ${val}%, rgba(0,0,0,0.4) ${val}%, rgba(0,0,0,0.4) 100%)`,
                          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formula Proficiency */}
            <div className="card-skeu p-6">
              <h2 className="font-bold text-sm mb-5" style={{ color: "var(--color-foreground)" }}>Formula Proficiency</h2>
              <div className="grid grid-cols-2 gap-4">
                {FORMULA_AREAS.map(f => {
                  const val = formulaScores[f.id] ?? 50;
                  return (
                    <div key={f.id} className="inset-panel">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--color-foreground)" }}>
                          {f.icon} {f.label}
                        </span>
                        <span className="text-sm font-black font-mono" style={{ color: "#818cf8" }}>{val}%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} value={val}
                        onChange={e => setFormulaScores(p => ({ ...p, [f.id]: parseInt(e.target.value) }))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${val}%, rgba(0,0,0,0.4) ${val}%, rgba(0,0,0,0.4) 100%)`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Prediction Panel */}
          <div className="md:col-span-2 space-y-5">
            <div className="card-skeu p-6 flex flex-col items-center text-center">
              {/* Probability Gauge */}
              <div className="relative mb-4">
                <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
                  <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="14"
                    style={{ filter: "drop-shadow(inset 0 2px 4px rgba(0,0,0,0.5))" }} />
                  <circle cx="100" cy="100" r={R} fill="none" stroke={rating.color} strokeWidth="14"
                    strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dashOffset}
                    style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1), stroke 0.3s ease",
                      filter: `drop-shadow(0 0 10px ${rating.glow})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl mb-1">{rating.emoji}</div>
                  <div className="text-4xl font-black" style={{ color: rating.color, textShadow: `0 0 20px ${rating.glow}` }}>
                    {prob}%
                  </div>
                  <div className="text-xs font-bold" style={{ color: rating.color }}>{rating.label}</div>
                </div>
              </div>

              <div className="text-sm font-bold mb-1" style={{ color: "var(--color-foreground)" }}>
                Pass Probability
              </div>
              <div className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                Based on weighted domain scores and PMI pass thresholds
              </div>

              <div className="divider w-full" />

              {/* Domain Breakdown */}
              <div className="w-full space-y-3">
                {DOMAINS.map(d => (
                  <div key={d.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "var(--color-muted-foreground)" }}>{d.icon} {d.label}</span>
                      <span className="font-mono font-bold" style={{ color: d.color }}>{scores[d.id]}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{
                        width: `${scores[d.id]}%`,
                        background: `linear-gradient(90deg,${d.color}cc,${d.color})`,
                        boxShadow: `0 0 8px ${d.color}60`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card-skeu p-5">
              <h3 className="font-bold text-sm mb-4" style={{ color: "var(--color-foreground)" }}>
                🎯 AI Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map((r, i) => (
                  <div key={i} className="flex gap-3 text-sm p-3 rounded-xl"
                    style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}>
                    <span style={{ color: "var(--color-primary-light)" }}>→</span>
                    <span style={{ color: "var(--color-foreground)" }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
