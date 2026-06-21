"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { analytics } from "@/lib/api";
import Link from "next/link";

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [velocity, setVelocity] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    analytics.dashboard().then(r => setData(r.data));
    analytics.velocity().then(r => setVelocity(r.data));
  }, []);

  if (!data) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">PMP Study App</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border text-center">
            <div className="text-3xl font-bold text-blue-600">{data.readiness_score}%</div>
            <div className="text-sm text-gray-500 mt-1">Exam Readiness</div>
          </div>
          <div className="bg-white p-4 rounded-xl border text-center">
            <div className="text-3xl font-bold text-green-600">{data.study_streak}</div>
            <div className="text-sm text-gray-500 mt-1">Day Streak</div>
          </div>
          <div className="bg-white p-4 rounded-xl border text-center">
            <div className="text-3xl font-bold text-purple-600">{data.quizzes_taken}</div>
            <div className="text-sm text-gray-500 mt-1">Quizzes Taken</div>
          </div>
          <div className="bg-white p-4 rounded-xl border text-center">
            <div className="text-3xl font-bold text-orange-600">{velocity?.total_study_hours || 0}h</div>
            <div className="text-sm text-gray-500 mt-1">Total Study Time</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-lg font-semibold mb-4">Study Velocity</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-600">Avg questions/day</span><span className="font-medium">{velocity?.avg_questions_per_day || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Avg minutes/day</span><span className="font-medium">{velocity?.avg_minutes_per_day || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Total hours studied</span><span className="font-medium">{velocity?.total_study_hours || 0}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-lg font-semibold mb-4">Knowledge Area Mastery</h2>
            <div className="space-y-3">
              {(data.mastery_heatmap || []).slice(0, 8).map((item: any) => (
                <div key={item.area}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{item.area}</span>
                    <span className="font-medium ml-2">{item.mastery}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full ${item.mastery >= 80 ? 'bg-green-500' : item.mastery >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.mastery}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border mt-6">
          <h2 className="text-lg font-semibold mb-4">Weak Areas to Focus On</h2>
          <div className="flex flex-wrap gap-2">
            {data.weak_areas?.length > 0 ? data.weak_areas.map((area: string) => (
              <span key={area} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">{area}</span>
            )) : <p className="text-gray-500 text-sm">No weak areas identified yet. Keep studying!</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
