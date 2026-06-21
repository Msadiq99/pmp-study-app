"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { exam } from "@/lib/api";
import Link from "next/link";

export default function ExamPage() {
  const router = useRouter();
  const [examData, setExamData] = useState<any>(null);
  const [starting, setStarting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 || !examData) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, examData]);

  const startExam = async () => {
    setStarting(true);
    try {
      const res = await exam.simulate();
      setExamData(res.data);
      setTimeLeft(res.data.time_limit_minutes * 60);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to start exam");
    } finally {
      setStarting(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (examData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">PMP Study App</Link>
            <div className="flex items-center gap-4">
              <span className={`text-lg font-mono font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>{formatTime(timeLeft)}</span>
              <span className="text-sm text-gray-500">Question {currentQ + 1} of 180</span>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-8 border text-center">
            <h2 className="text-xl font-bold mb-4">PMP Exam Simulation</h2>
            <p className="text-gray-600 mb-6">This is a simulated 180-question PMP exam with a 230-minute time limit.</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {examData.domains && Object.entries(examData.domains).map(([key, domain]: [string, any]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium">{domain.name}</div>
                  <div className="text-sm text-gray-500">{Math.round(domain.weight * 100)}% of exam</div>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-left mb-6">
              <h3 className="font-semibold mb-2">Exam Instructions:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {examData.instructions?.map((inst: string, i: number) => (
                  <li key={i}>• {inst}</li>
                ))}
              </ul>
            </div>
            <button onClick={() => router.push("/quiz")} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Start Practice Instead
            </button>
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
        <h1 className="text-2xl font-bold mb-6">PMP Exam Simulation</h1>
        <div className="bg-white p-8 rounded-xl border text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold mb-2">Ready to simulate the real PMP exam?</h2>
          <p className="text-gray-600 mb-6">180 questions | 230 minutes | People (42%), Process (50%), Business Environment (8%)</p>
          <button onClick={startExam} disabled={starting} className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium text-lg">
            {starting ? "Setting up exam..." : "Start Exam Simulation"}
          </button>
        </div>
      </main>
    </div>
  );
}
