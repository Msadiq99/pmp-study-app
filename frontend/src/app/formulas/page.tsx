"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formulas } from "@/lib/api";
import Link from "next/link";

export default function FormulasPage() {
  const router = useRouter();
  const [allFormulas, setFormulas] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [calculator, setCalculator] = useState<any>(null);
  const [calcInputs, setCalcInputs] = useState<Record<string, string>>({});
  const [calcResult, setCalcResult] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    formulas.list().then(r => setFormulas(r.data));
    formulas.categories().then(r => setCategories(r.data));
  }, []);

  const filtered = selectedCat ? allFormulas.filter(f => f.category === selectedCat) : allFormulas;

  const openCalculator = (f: any) => {
    setCalculator(f);
    setCalcInputs({});
    setCalcResult(null);
  };

  const runCalc = async () => {
    const inputs: Record<string, number> = {};
    for (const [k, v] of Object.entries(calcInputs)) {
      inputs[k] = parseFloat(v) || 0;
    }
    try {
      const res = await formulas.calculate(calculator.name, inputs);
      setCalcResult(res.data);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">PMP Study App</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">PMP Formulas & Calculator</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setSelectedCat("")} className={`px-3 py-1 rounded-full text-sm ${!selectedCat ? "bg-blue-600 text-white" : "bg-gray-200"}`}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)} className={`px-3 py-1 rounded-full text-sm capitalize ${selectedCat === c ? "bg-blue-600 text-white" : "bg-gray-200"}`}>{c}</button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(f => (
            <div key={f.name} className="bg-white p-5 rounded-xl border">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{f.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full capitalize">{f.category}</span>
              </div>
              <p className="text-blue-600 font-mono text-lg mb-2">{f.formula}</p>
              <p className="text-sm text-gray-600 mb-3">{f.description}</p>
              {f.variables && (
                <div className="text-xs text-gray-400 mb-3">
                  {Object.entries(f.variables).map(([k, v]) => <span key={k} className="mr-3">{k}: {v as string}</span>)}
                </div>
              )}
              {f.example && <p className="text-xs text-gray-500 mb-3 italic">Example: {f.example}</p>}
              <button onClick={() => openCalculator(f)} className="text-sm text-blue-600 hover:underline">Open Calculator →</button>
            </div>
          ))}
        </div>

        {calculator && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">{calculator.name}</h3>
              <p className="text-blue-600 font-mono mb-4">{calculator.formula}</p>
              <div className="space-y-3 mb-4">
                {calculator.variables && Object.entries(calculator.variables).map(([k, v]) => (
                  <div key={k}>
                    <label className="text-sm font-medium">{k} ({v as string})</label>
                    <input type="number" className="w-full px-3 py-2 border rounded-lg mt-1" value={calcInputs[k] || ""} onChange={e => setCalcInputs({ ...calcInputs, [k]: e.target.value })} />
                  </div>
                ))}
              </div>
              {calcResult && (
                <div className={`p-3 rounded-lg mb-4 ${calcResult.error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {calcResult.error ? calcResult.error : `Result: ${calcResult.result}`}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={runCalc} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Calculate</button>
                <button onClick={() => setCalculator(null)} className="px-4 py-2 border rounded-lg">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
