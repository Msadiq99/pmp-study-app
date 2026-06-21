"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { flashcards } from "@/lib/api";
import Link from "next/link";

export default function FlashcardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [mode, setMode] = useState<"list" | "review">("list");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({ front: "", back: "", knowledge_area: "" });
  const [stats, setStats] = useState({ reviewed: 0, correct: 0 });

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    flashcards.list().then(r => setCards(r.data));
    flashcards.due(20).then(r => setDueCards(r.data));
  }, []);

  const startReview = () => {
    if (dueCards.length === 0) return;
    setMode("review");
    setCurrentIndex(0);
    setFlipped(false);
    setStats({ reviewed: 0, correct: 0 });
  };

  const handleReview = async (rating: number) => {
    const card = dueCards[currentIndex];
    try {
      await flashcards.review(card.id, { rating, review_time_ms: 0 });
      setStats(s => ({ reviewed: s.reviewed + 1, correct: s.correct + (rating >= 3 ? 1 : 0) }));
      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setFlipped(false);
      } else {
        setMode("list");
        flashcards.due(20).then(r => setDueCards(r.data));
      }
    } catch {}
  };

  const addCard = async () => {
    if (!newCard.front || !newCard.back) return;
    await flashcards.create(newCard);
    setNewCard({ front: "", back: "", knowledge_area: "" });
    setShowAdd(false);
    flashcards.list().then(r => setCards(r.data));
  };

  if (mode === "review") {
    const card = dueCards[currentIndex];
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-gray-500">{currentIndex + 1} / {dueCards.length}</span>
            <span className="text-sm text-gray-500">Correct: {stats.correct}/{stats.reviewed}</span>
          </div>
          <div
            onClick={() => setFlipped(!flipped)}
            className="bg-white rounded-2xl shadow-lg p-8 min-h-[300px] flex items-center justify-center cursor-pointer border"
          >
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">{flipped ? "Answer" : "Question"}</p>
              <p className="text-xl">{flipped ? card.back : card.front}</p>
            </div>
          </div>
          {flipped && (
            <div className="grid grid-cols-4 gap-3 mt-6">
              <button onClick={() => handleReview(1)} className="py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">Again</button>
              <button onClick={() => handleReview(2)} className="py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium">Hard</button>
              <button onClick={() => handleReview(3)} className="py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">Good</button>
              <button onClick={() => handleReview(4)} className="py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">Easy</button>
            </div>
          )}
          <button onClick={() => setMode("list")} className="mt-4 text-gray-500 hover:text-gray-700 text-sm">← Back to cards</button>
        </div>
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
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <div className="flex gap-3">
            <button onClick={startReview} disabled={dueCards.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Review Due ({dueCards.length})
            </button>
            <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              + Add Card
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="bg-white p-6 rounded-xl border mb-6">
            <h3 className="font-semibold mb-4">New Flashcard</h3>
            <div className="space-y-3">
              <input placeholder="Front (Question)" className="w-full px-4 py-2 border rounded-lg" value={newCard.front} onChange={e => setNewCard({ ...newCard, front: e.target.value })} />
              <textarea placeholder="Back (Answer)" className="w-full px-4 py-2 border rounded-lg" rows={3} value={newCard.back} onChange={e => setNewCard({ ...newCard, back: e.target.value })} />
              <input placeholder="Knowledge Area (optional)" className="w-full px-4 py-2 border rounded-lg" value={newCard.knowledge_area} onChange={e => setNewCard({ ...newCard, knowledge_area: e.target.value })} />
              <button onClick={addCard} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Card</button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {cards.map(card => (
            <div key={card.id} className="bg-white p-4 rounded-xl border">
              <div className="mb-2">
                <span className="text-xs text-gray-400">Q</span>
                <p className="font-medium">{card.front}</p>
              </div>
              <div className="mb-2">
                <span className="text-xs text-gray-400">A</span>
                <p className="text-gray-600 text-sm">{card.back}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Due: {new Date(card.due_date).toLocaleDateString()}</span>
                {card.knowledge_area && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{card.knowledge_area}</span>}
              </div>
            </div>
          ))}
        </div>
        {cards.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No flashcards yet</p>
            <p className="text-sm">Add cards manually or they'll be generated from your uploaded documents.</p>
          </div>
        )}
      </main>
    </div>
  );
}
