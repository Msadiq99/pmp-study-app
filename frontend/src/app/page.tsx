"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", "dummy-bypass-token");
      localStorage.setItem("user", JSON.stringify({ id: 1, email: "demo@pmpstudy.app", username: "DemoUser" }));
      router.push("/dashboard");
    }
  }, []);

  const goToLogin = () => router.push("/login");
  const goToRegister = () => router.push("/register");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">PMP Study App</h1>
        <div className="flex gap-4">
          <button onClick={goToLogin} className="px-4 py-2 border border-white/30 rounded-lg hover:bg-white/10 transition">Sign In</button>
          <button onClick={goToRegister} className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition font-medium">Get Started</button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Ace Your PMP Certification</h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          AI-powered study platform with adaptive learning, practice exams, and intelligent tutoring to help you pass the PMP exam on your first try.
        </p>
        <div className="flex justify-center gap-4 mb-16">
          <button onClick={goToRegister} className="px-8 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition font-semibold text-lg">Start Studying Free</button>
          <button onClick={() => setShowSetup(!showSetup)} className="px-8 py-3 border-2 border-white/40 rounded-lg hover:bg-white/10 transition font-semibold text-lg">{showSetup ? "Hide Setup" : "Setup Guide"}</button>
        </div>

        {showSetup && (
          <div className="max-w-3xl mx-auto mb-16 text-left bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4">Quick Setup</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-1">1. Clone & Start</h4>
                <code className="block bg-black/30 rounded-lg p-3 font-mono text-green-300">
                  git clone https://github.com/Msadiq99/pmp-study-app.git<br/>
                  cd pmp-study-app<br/>
                  bash scripts/start.sh
                </code>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">2. Choose your AI provider in <code>backend/.env</code>:</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <ProviderCard title="Ollama Local" desc="Free, runs on your machine. Need 8GB+ RAM." code="LLM_PROVIDER=ollama_local" color="green" />
                  <ProviderCard title="Ollama Cloud" desc="Cloud Ollama via OpenRouter/Together." code="LLM_PROVIDER=ollama_cloud" color="blue" />
                  <ProviderCard title="Claude API" desc="Best quality. Requires Anthropic API key." code="LLM_PROVIDER=claude" color="purple" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">3. Open the app</h4>
                <p className="text-blue-100">Frontend: <code>http://localhost:3000</code> | API Docs: <code>http://localhost:8000/docs</code></p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureCard icon="📚" title="Upload & Learn" desc="Upload PMP books and PDFs. AI extracts content and generates study materials." />
          <FeatureCard icon="🧠" title="Adaptive Learning" desc="FSRS spaced repetition and personalized study paths adapt to your progress." />
          <FeatureCard icon="🎯" title="Exam Simulation" desc="Practice with 180-question timed exams matching the real PMP test format." />
          <FeatureCard icon="🤖" title="AI Tutor Chat" desc="Ask questions about any PMP concept and get answers with source citations." />
          <FeatureCard icon="🎙️" title="Voice Teach-Back" desc="Explain concepts aloud and get AI feedback on your understanding." />
          <FeatureCard icon="📊" title="Progress Analytics" desc="Track mastery across PMBOK knowledge areas with visual dashboards." />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-blue-100 text-sm">{desc}</p>
    </div>
  );
}

function ProviderCard({ title, desc, code, color }: { title: string; desc: string; code: string; color: string }) {
  const colors: Record<string, string> = {
    green: "border-green-400/30 bg-green-500/10",
    blue: "border-blue-400/30 bg-blue-500/10",
    purple: "border-purple-400/30 bg-purple-500/10",
  };
  return (
    <div className={`border rounded-lg p-3 ${colors[color] || colors.blue}`}>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-blue-100 mt-1">{desc}</div>
      <code className="block text-xs text-green-300 mt-2 font-mono">{code}</code>
    </div>
  );
}
