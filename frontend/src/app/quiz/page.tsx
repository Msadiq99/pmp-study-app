"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quiz } from "@/lib/api";
import Link from "next/link";

export default function QuizPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [config, setConfig] = useState({ title: "Practice Quiz", num_questions: 10, knowledge_area: "", question_types: ["mcq", "true_false"] });

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    quiz.list().then(r => setQuizzes(r.data));
  }, []);

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
    try {
      await quiz.submit(activeQuiz.id, { question_id: questionId, answer });
    } catch {}
  };

  const completeQuiz = async () => {
    await quiz.complete(activeQuiz.id);
    quiz.get(activeQuiz.id).then(r => setActiveQuiz(r.data));
  };

  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    const q = questions[currentQ];
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">PMP Study App</Link>
            <span className="text-sm text-gray-500">Score: {activeQuiz.score}%</span>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">{activeQuiz.title}</h1>
            <span className="text-sm text-gray-500">{currentQ + 1} / {questions.length}</span>
          </div>

          {q && (
            <div className="bg-white rounded-xl p-6 border">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{q.question_type}</span>
                <span className="text-xs text-gray-400">Difficulty: {Math.round(q.difficulty * 100)}%</span>
              </div>
              <p className="text-lg mb-6">{q.question_text}</p>

              {q.question_type === "mcq" && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => submitAnswer(q.id, opt)}
                      className={`w-full text-left p-3 rounded-lg border transition ${answers[q.id] === opt ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.question_type === "true_false" && (
                <div className="grid grid-cols-2 gap-3">
                  {["True", "False"].map(opt => (
                    <button key={opt} onClick={() => submitAnswer(q.id, opt)} className={`p-3 rounded-lg border font-medium transition ${answers[q.id] === opt ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"}`}>{opt}</button>
                  ))}
                </div>
              )}

              {q.question_type === "fill_blank" && (
                <input placeholder="Type your answer..." className="w-full px-4 py-2 border rounded-lg" value={answers[q.id] || ""} onChange={e => submitAnswer(q.id, e.target.value)} />
              )}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="px-4 py-2 border rounded-lg disabled:opacity-50">Previous</button>
            {currentQ < questions.length - 1 ? (
              <button onClick={() => setCurrentQ(currentQ + 1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Next</button>
            ) : (
              <button onClick={completeQuiz} className="px-4 py-2 bg-green-600 text-white rounded-lg">Complete Quiz</button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">PMP Study App</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Generate Quiz</button>
        </div>

        {showCreate && (
          <div className="bg-white p-6 rounded-xl border mb-6">
            <h3 className="font-semibold mb-4">Quiz Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input className="w-full px-3 py-2 border rounded-lg mt-1" value={config.title} onChange={e => setConfig({ ...config, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Questions</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg mt-1" value={config.num_questions} onChange={e => setConfig({ ...config, num_questions: parseInt(e.target.value) || 10 })} />
              </div>
            </div>
            <button onClick={generateQuiz} disabled={generating} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
              {generating ? "Generating..." : "Generate Quiz"}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {quizzes.map(q => (
            <div key={q.id} className="bg-white p-4 rounded-xl border flex items-center justify-between cursor-pointer hover:bg-gray-50" onClick={() => { setActiveQuiz(q); }}>
              <div>
                <p className="font-medium">{q.title}</p>
                <p className="text-sm text-gray-500">{q.total_questions} questions · {q.is_completed ? "Completed" : "In progress"}</p>
              </div>
              <span className={`text-lg font-bold ${q.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>{q.score}%</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
