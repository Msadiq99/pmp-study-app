"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { analytics } from "@/lib/api";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      localStorage.setItem("token", "demo-token");
      localStorage.setItem("user", JSON.stringify({ id: 1, email: "demo@pmpstudy.app", username: "DemoUser" }));
    }
    analytics.dashboard().then((r) => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">PMP Study App</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-blue-600 font-medium">Dashboard</Link>
            <Link href="/upload" className="text-gray-600 hover:text-blue-600">Upload</Link>
            <Link href="/flashcards" className="text-gray-600 hover:text-blue-600">Flashcards</Link>
            <Link href="/quiz" className="text-gray-600 hover:text-blue-600">Quiz</Link>
            <Link href="/chat" className="text-gray-600 hover:text-blue-600">AI Tutor</Link>
            <Link href="/formulas" className="text-gray-600 hover:text-blue-600">Formulas</Link>
            <Link href="/analytics" className="text-gray-600 hover:text-blue-600">Analytics</Link>
            <Link href="/exam" className="text-gray-600 hover:text-blue-600">Exam Sim</Link>
            <Link href="/voice" className="text-gray-600 hover:text-blue-600">Voice</Link>
            <Link href="/groups" className="text-gray-600 hover:text-blue-600">Groups</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Exam Readiness" value={`${data?.readiness_score || 0}%`} color="blue" />
          <StatCard title="Documents" value={data?.documents_uploaded || 0} color="green" />
          <StatCard title="Flashcards" value={data?.flashcards_total || 0} color="purple" />
          <StatCard title="Study Streak" value={`${data?.study_streak || 0} days`} color="orange" />
        </div>

        {data?.weak_areas?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border">
            <h2 className="text-lg font-semibold mb-4">Areas to Focus On</h2>
            <div className="flex flex-wrap gap-2">
              {data.weak_areas.map((area: string) => (
                <span key={area} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">{area}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-4">Mastery Heatmap</h2>
            <div className="space-y-3">
              {(data?.mastery_heatmap || []).map((item: any) => (
                <div key={item.area}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.area}</span>
                    <span className="font-medium">{item.mastery}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.mastery >= 80 ? 'bg-green-500' : item.mastery >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${item.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
              {(!data?.mastery_heatmap || data.mastery_heatmap.length === 0) && (
                <p className="text-gray-500 text-sm">Start studying to see your mastery heatmap!</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-4">Recent Quizzes</h2>
            <div className="space-y-3">
              {(data?.recent_quizzes || []).map((q: any) => (
                <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{q.title}</span>
                  <span className={`text-sm font-bold ${q.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                    {q.score}%
                  </span>
                </div>
              ))}
              {(!data?.recent_quizzes || data.recent_quizzes.length === 0) && (
                <p className="text-gray-500 text-sm">No quizzes taken yet. Start a quiz!</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link href="/flashcards" className="bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition">
            <div className="text-2xl mb-1">🃏</div>
            <div className="text-sm font-medium">Flashcards</div>
          </Link>
          <Link href="/quiz" className="bg-green-600 text-white p-4 rounded-xl text-center hover:bg-green-700 transition">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-sm font-medium">Practice Quiz</div>
          </Link>
          <Link href="/exam" className="bg-purple-600 text-white p-4 rounded-xl text-center hover:bg-purple-700 transition">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-sm font-medium">Exam Simulation</div>
          </Link>
          <Link href="/chat" className="bg-orange-600 text-white p-4 rounded-xl text-center hover:bg-orange-700 transition">
            <div className="text-2xl mb-1">🤖</div>
            <div className="text-sm font-medium">AI Tutor</div>
          </Link>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: any; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className={`rounded-xl p-6 ${colors[color] || colors.blue}`}>
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
