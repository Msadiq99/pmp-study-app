"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quiz } from "@/lib/api";
import AppShell from "@/components/AppShell";

export default function QuizPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [config, setConfig] = useState({
    title: "Practice Quiz",
    num_questions: 10,
    knowledge_area: "",
    question_types: ["mcq", "true_false"],
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    quiz.list().then(r => setQuizzes(r.data));
  }, [router]);

  const generateQuiz = async () => {
    setGenerating(true);
    try {
      const res = await quiz.generate(config);
      setActiveQuiz(res.data);
      setShowCreate(false);
      setCurrentQ(0);
      setAnswers({});
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const submitAnswer = async (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
    setShowExplanation(true);
    try { await quiz.submit(activeQuiz.id, { question_id: questionId, answer }); } catch {}
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    setCurrentQ(c => c + 1);
  };

  const completeQuiz = async () => {
    await quiz.complete(activeQuiz.id);
    quiz.get(activeQuiz.id).then(r => setActiveQuiz(r.data));
  };

  /* ===== ACTIVE QUIZ VIEW ===== */
  if (activeQuiz) {
    const questions = activeQuiz.questions ?? [];
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    const answered = answers[q?.id];
    const isCorrect = q && answered === q.correct_answer;

    return (
      <AppShell>
        <div className="p-6 max-w-3xl mx-auto animate-fade-in">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setActiveQuiz(null)} className="btn-ghost text-xs">
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <span className="badge badge-primary">{activeQuiz.title}</span>
              <span className="text-sm font-mono" style={{ color: "var(--color-muted-foreground)" }}>
                {currentQ + 1} / {questions.length}
              </span>
            </div>
          </div>

          {/* Progress Track */}
          <div className="mb-6">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              <span>Question {currentQ + 1}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>

          {q && (
            <div className="space-y-4 animate-slide-up">
              {/* Question Card — Skeuomorphic Paper Look */}
              <div
                className="relative rounded-2xl p-6 overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, #1c2540, #141929)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                {/* Top-left corner fold effect */}
                <div
                  className="absolute top-0 right-0 w-12 h-12"
                  style={{
                    background: "linear-gradient(225deg, rgba(99,102,241,0.15) 50%, transparent 50%)",
                    borderLeft: "1px solid rgba(99,102,241,0.2)",
                    borderBottom: "1px solid rgba(99,102,241,0.2)",
                    borderBottomLeftRadius: "8px",
                  }}
                />

                {/* Meta */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="badge badge-primary">{q.question_type?.replace("_", " ")}</span>
                  <span className="badge badge-sky">{q.knowledge_area}</span>
                  <span className="badge badge-gold">
                    Difficulty: {Math.round((q.difficulty ?? 0.5) * 100)}%
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-lg font-semibold leading-relaxed" style={{ color: "var(--color-foreground)" }}>
                  {q.question_text}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {q.question_type === "mcq" && (q.options ?? []).map((opt: string, idx: number) => {
                  const isSelected = answered === opt;
                  const isRight = answered && opt === q.correct_answer;
                  const isWrong = isSelected && !isRight;

                  return (
                    <button
                      key={opt}
                      onClick={() => !answered && submitAnswer(q.id, opt)}
                      disabled={!!answered}
                      className="w-full text-left p-4 rounded-xl transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: isRight ? "linear-gradient(135deg,rgba(16,185,129,0.25),rgba(16,185,129,0.1))"
                          : isWrong ? "linear-gradient(135deg,rgba(244,63,94,0.25),rgba(244,63,94,0.1))"
                          : isSelected ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(99,102,241,0.1))"
                          : "var(--color-surface-3)",
                        border: `1px solid ${isRight ? "rgba(16,185,129,0.5)" : isWrong ? "rgba(244,63,94,0.5)" : isSelected ? "rgba(99,102,241,0.5)" : "var(--color-border)"}`,
                        boxShadow: isRight ? "0 0 20px rgba(16,185,129,0.2)" : isWrong ? "0 0 20px rgba(244,63,94,0.2)" : "none",
                        cursor: answered ? "default" : "pointer",
                        transform: isSelected ? "translateX(4px)" : "",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                          style={{
                            background: isRight ? "rgba(16,185,129,0.3)" : isWrong ? "rgba(244,63,94,0.3)" : "var(--color-surface-2)",
                            border: `1px solid ${isRight ? "rgba(16,185,129,0.5)" : isWrong ? "rgba(244,63,94,0.5)" : "var(--color-border)"}`,
                            color: isRight ? "#34d399" : isWrong ? "#fb7185" : "var(--color-muted-foreground)",
                          }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{opt}</span>
                        {isRight && <span className="ml-auto text-lg">✅</span>}
                        {isWrong && <span className="ml-auto text-lg">❌</span>}
                      </div>
                    </button>
                  );
                })}

                {q.question_type === "true_false" && (
                  <div className="grid grid-cols-2 gap-3">
                    {["True", "False"].map((opt) => {
                      const isSelected = answered === opt;
                      const isRight = answered && opt === q.correct_answer;
                      const isWrong = isSelected && !isRight;
                      return (
                        <button
                          key={opt}
                          onClick={() => !answered && submitAnswer(q.id, opt)}
                          disabled={!!answered}
                          className="p-5 rounded-xl font-bold text-lg transition-all duration-300"
                          style={{
                            background: isRight ? "linear-gradient(135deg,rgba(16,185,129,0.3),rgba(16,185,129,0.1))"
                              : isWrong ? "linear-gradient(135deg,rgba(244,63,94,0.3),rgba(244,63,94,0.1))"
                              : "var(--color-surface-3)",
                            border: `1px solid ${isRight ? "rgba(16,185,129,0.5)" : isWrong ? "rgba(244,63,94,0.5)" : "var(--color-border)"}`,
                            color: opt === "True" ? "#34d399" : "#fb7185",
                            boxShadow: "var(--shadow-inset)",
                            cursor: answered ? "default" : "pointer",
                          }}
                        >
                          {opt === "True" ? "✓ True" : "✗ False"}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.question_type === "fill_blank" && (
                  <input
                    className="input-skeu"
                    placeholder="Type your answer..."
                    value={answers[q.id] || ""}
                    onChange={e => submitAnswer(q.id, e.target.value)}
                  />
                )}
              </div>

              {/* Explanation Panel — slides up after answer */}
              {answered && q.explanation && (
                <div
                  className="animate-slide-up rounded-xl p-5"
                  style={{
                    background: isCorrect
                      ? "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))"
                      : "linear-gradient(135deg,rgba(244,63,94,0.15),rgba(244,63,94,0.05))",
                    border: `1px solid ${isCorrect ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{isCorrect ? "🎉" : "💡"}</span>
                    <span className="font-bold" style={{ color: isCorrect ? "#34d399" : "#fb7185" }}>
                      {isCorrect ? "Correct!" : "Incorrect — Review this concept"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-foreground)" }}>
                    {q.explanation}
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowExplanation(false); setCurrentQ(Math.max(0, currentQ - 1)); }}
                  disabled={currentQ === 0}
                  className="btn-ghost"
                  style={{ opacity: currentQ === 0 ? 0.4 : 1 }}
                >
                  ← Previous
                </button>
                <div className="flex-1" />
                {currentQ < questions.length - 1 ? (
                  <button onClick={nextQuestion} className="btn-primary" disabled={!answered}>
                    Next Question →
                  </button>
                ) : (
                  <button onClick={completeQuiz} className="btn-primary"
                    style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                    Complete Quiz 🎯
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  /* ===== QUIZ LIST VIEW ===== */
  return (
    <AppShell>
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--color-foreground)" }}>Practice Quizzes</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
              Generate AI-powered quizzes from your study materials
            </p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            ✨ Generate Quiz
          </button>
        </div>

        {/* Create Quiz Panel */}
        {showCreate && (
          <div className="card-skeu p-6 mb-6 animate-slide-up">
            <h3 className="font-bold text-base mb-5" style={{ color: "var(--color-foreground)" }}>Quiz Configuration</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="text-xs font-bold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>QUIZ TITLE</label>
                <input className="input-skeu" value={config.title}
                  onChange={e => setConfig({ ...config, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>QUESTIONS</label>
                <input type="number" className="input-skeu" value={config.num_questions}
                  onChange={e => setConfig({ ...config, num_questions: parseInt(e.target.value) || 10 })}
                  min={5} max={50} />
              </div>
              <div>
                <label className="text-xs font-bold mb-2 block" style={{ color: "var(--color-muted-foreground)" }}>KNOWLEDGE AREA</label>
                <input className="input-skeu" placeholder="Leave blank for all areas" value={config.knowledge_area}
                  onChange={e => setConfig({ ...config, knowledge_area: e.target.value })} />
              </div>
            </div>
            <button onClick={generateQuiz} disabled={generating} className="btn-primary">
              {generating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating with AI...
                </span>
              ) : "✨ Generate Quiz"}
            </button>
          </div>
        )}

        {/* Quiz List */}
        <div className="space-y-3">
          {quizzes.map((q, i) => (
            <div
              key={q.id}
              className="card-skeu p-5 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform"
              onClick={() => setActiveQuiz(q)}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div>
                <div className="font-semibold" style={{ color: "var(--color-foreground)" }}>{q.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="badge badge-primary">{q.total_questions} questions</span>
                  <span className={`badge ${q.is_completed ? "badge-emerald" : "badge-gold"}`}>
                    {q.is_completed ? "✓ Completed" : "In Progress"}
                  </span>
                </div>
              </div>
              <div
                className="text-3xl font-black font-mono"
                style={{
                  color: q.score >= 70 ? "var(--color-emerald)" : "var(--color-rose)",
                  textShadow: `0 0 15px ${q.score >= 70 ? "rgba(16,185,129,0.5)" : "rgba(244,63,94,0.5)"}`,
                }}
              >
                {q.score}%
              </div>
            </div>
          ))}

          {!quizzes.length && (
            <div className="card-skeu p-12 text-center">
              <div className="text-5xl mb-4 animate-float">📝</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--color-foreground)" }}>No quizzes yet</h3>
              <p className="text-sm mb-5" style={{ color: "var(--color-muted-foreground)" }}>
                Generate your first AI-powered quiz to get started
              </p>
              <button onClick={() => setShowCreate(true)} className="btn-primary">✨ Generate Quiz</button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
