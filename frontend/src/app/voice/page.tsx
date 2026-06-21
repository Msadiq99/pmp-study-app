"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { study } from "@/lib/api";
import Link from "next/link";

export default function VoicePage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [topic, setTopic] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      setEvaluation(null);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const evaluateTeachBack = async () => {
    if (!transcript || !topic) return;
    setEvaluating(true);
    try {
      const res = await study.evaluateVoice({ text: transcript, topic });
      setEvaluation(res.data);
    } catch {
      setEvaluation({ understanding_score: 0, strengths: [], gaps: ["Could not evaluate"], suggestions: [] });
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">PMP Study App</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Voice Teach-Back</h1>
        <p className="text-gray-600 mb-8">Explain a PMP concept aloud. AI evaluates your understanding using the Feynman Technique.</p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">What topic are you explaining?</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Critical Path Method, Earned Value Management" className="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div className="bg-white p-6 rounded-xl border mb-6">
          <div className="text-center">
            <button onClick={toggleRecording} className={`w-24 h-24 rounded-full text-white text-2xl transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isRecording ? '⏹' : '🎙️'}
            </button>
            <p className="text-sm text-gray-500 mt-3">{isRecording ? "Recording... Click to stop" : "Click to start recording"}</p>
          </div>
          {transcript && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-400 mb-1">Your explanation:</p>
              <p className="text-gray-700">{transcript}</p>
            </div>
          )}
        </div>

        {transcript && topic && (
          <button onClick={evaluateTeachBack} disabled={evaluating} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium mb-6">
            {evaluating ? "Evaluating..." : "Get AI Evaluation"}
          </button>
        )}

        {evaluation && (
          <div className="bg-white p-6 rounded-xl border">
            <div className="text-center mb-6">
              <div className={`text-5xl font-bold ${evaluation.understanding_score >= 70 ? 'text-green-600' : evaluation.understanding_score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {evaluation.understanding_score}%
              </div>
              <div className="text-gray-500">Understanding Score</div>
            </div>
            <div className="space-y-4">
              {evaluation.strengths?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">Strengths</h3>
                  <ul className="text-sm space-y-1">{evaluation.strengths.map((s: string, i: number) => <li key={i}>✓ {s}</li>)}</ul>
                </div>
              )}
              {evaluation.gaps?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-600 mb-2">Gaps</h3>
                  <ul className="text-sm space-y-1">{evaluation.gaps.map((g: string, i: number) => <li key={i}>✗ {g}</li>)}</ul>
                </div>
              )}
              {evaluation.suggestions?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-600 mb-2">Suggestions</h3>
                  <ul className="text-sm space-y-1">{evaluation.suggestions.map((s: string, i: number) => <li key={i}>💡 {s}</li>)}</ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
