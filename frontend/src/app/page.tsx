"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  const startDemo = () => {
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("user", JSON.stringify({ id: 1, email: "demo@pmpstudy.app", username: "DemoUser" }));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">PMP Study App</h1>
        <div className="flex gap-4">
          <button onClick={startDemo} className="px-4 py-2 border border-white/30 rounded-lg hover:bg-white/10 transition">Live Demo</button>
          <a href="https://github.com/Msadiq99/pmp-study-app" target="_blank" rel="noopener" className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition font-medium">GitHub</a>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">Ace Your PMP Certification</h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          AI-powered study platform with adaptive learning, practice exams, and intelligent tutoring to help you pass the PMP exam on your first try.
        </p>
        <div className="flex justify-center gap-4 mb-16">
          <button onClick={startDemo} className="px-8 py-3 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition font-semibold text-lg">Try Live Demo</button>
          <a href="https://github.com/Msadiq99/pmp-study-app" target="_blank" rel="noopener" className="px-8 py-3 border-2 border-white/40 rounded-lg hover:bg-white/10 transition font-semibold text-lg">View on GitHub</a>
        </div>
        <p className="text-blue-200 text-sm mb-8">This is a static demo with mock data. For full AI features, deploy the complete app with Docker.</p>

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
