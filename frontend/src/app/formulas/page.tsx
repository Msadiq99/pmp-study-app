"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formulas } from "@/lib/api";
import AppShell from "@/components/AppShell";

export default function FormulasPage() {
  const router = useRouter();
  const [allFormulas, setFormulas] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [calculator, setCalculator] = useState<any>(null);
  const [calcInputs, setCalcInputs] = useState<Record<string, string>>({});
  const [calcResult, setCalcResult] = useState<any>(null);

  // EVM Sandbox State
  const [evmInputs, setEvmInputs] = useState({
    pv: 100000,
    ev: 90000,
    ac: 110000,
    bac: 500000,
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    formulas.list().then(r => setFormulas(r.data));
    formulas.categories().then(r => setCategories(r.data));
  }, [router]);

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

  const handleEvmSlider = (key: string, value: number) => {
    setEvmInputs(prev => ({ ...prev, [key]: value }));
  };

  // EVM Sandbox Calculations
  const { pv, ev, ac, bac } = evmInputs;
  const cv = ev - ac;
  const sv = ev - pv;
  const cpi = ac > 0 ? ev / ac : 0;
  const spi = pv > 0 ? ev / pv : 0;
  const eac = cpi > 0 ? bac / cpi : 0;
  const etc = eac - ac;
  const vac = bac - eac;
  const tcpi = bac - ac > 0 ? (bac - ev) / (bac - ac) : 0;

  const getHealthColor = (val: number, threshold: number, isRatio = false) => {
    if (isRatio) {
      return val >= threshold ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200";
    }
    return val >= threshold ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200";
  };

  const getStatusMessage = () => {
    let msg = "";
    if (cpi >= 1 && spi >= 1) msg = "Great job! You are under budget and ahead of schedule.";
    else if (cpi < 1 && spi >= 1) msg = "You are ahead of schedule but over budget. Consider reducing costs.";
    else if (cpi >= 1 && spi < 1) msg = "You are under budget but behind schedule. Consider crashing or fast-tracking.";
    else msg = "Warning: You are over budget and behind schedule. Project requires immediate corrective action.";
    return msg;
  };

  return (
    <AppShell>
      <div className="p-6 animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: "var(--color-foreground)" }}>PMP Formulas &amp; EVM Sandbox</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>Interactive tools for mastering PMP quantitative concepts</p>
        </div>

        {/* EVM Sandbox Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-10">
          <h2 className="text-xl font-bold mb-6">Interactive EVM Sandbox</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Inputs */}
            <div className="space-y-6">
              {[
                { key: 'pv', label: 'Planned Value (PV)', max: 200000 },
                { key: 'ev', label: 'Earned Value (EV)', max: 200000 },
                { key: 'ac', label: 'Actual Cost (AC)', max: 200000 },
                { key: 'bac', label: 'Budget at Completion (BAC)', max: 1000000, step: 10000 },
              ].map((input) => (
                <div key={input.key}>
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-semibold text-gray-700">{input.label}</label>
                    <span className="text-sm font-mono text-blue-600">${evmInputs[input.key as keyof typeof evmInputs].toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={input.max}
                    step={input.step || 1000}
                    value={evmInputs[input.key as keyof typeof evmInputs]}
                    onChange={(e) => handleEvmSlider(input.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Right: Outputs */}
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${getHealthColor(cpi, 1, true)}`}>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">CPI</div>
                  <div className="text-2xl font-black font-mono">{cpi.toFixed(2)}</div>
                </div>
                <div className={`p-4 rounded-xl border ${getHealthColor(spi, 1, true)}`}>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">SPI</div>
                  <div className="text-2xl font-black font-mono">{spi.toFixed(2)}</div>
                </div>
                <div className={`p-4 rounded-xl border ${getHealthColor(cv, 0)}`}>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Cost Variance</div>
                  <div className="text-xl font-black font-mono">${cv.toLocaleString()}</div>
                </div>
                <div className={`p-4 rounded-xl border ${getHealthColor(sv, 0)}`}>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Schedule Var.</div>
                  <div className="text-xl font-black font-mono">${sv.toLocaleString()}</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="text-sm font-bold text-blue-800 mb-2">AI Assessment</h3>
                <p className="text-blue-900 font-medium">{getStatusMessage()}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs border-t border-blue-200 pt-3">
                  <div><span className="opacity-70">EAC:</span> <span className="font-mono font-bold">${Math.round(eac).toLocaleString()}</span></div>
                  <div><span className="opacity-70">ETC:</span> <span className="font-mono font-bold">${Math.round(etc).toLocaleString()}</span></div>
                  <div><span className="opacity-70">VAC:</span> <span className={`font-mono font-bold ${vac >= 0 ? "text-green-600" : "text-red-600"}`}>${Math.round(vac).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Formula Library</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setSelectedCat("")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCat ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 border hover:bg-gray-50"}`}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${selectedCat === c ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 border hover:bg-gray-50"}`}>{c}</button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(f => (
            <div key={f.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900">{f.name}</h3>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full capitalize font-semibold">{f.category}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
                <p className="text-blue-600 font-mono font-semibold">{f.formula}</p>
              </div>
              <p className="text-sm text-gray-600 mb-4 h-10 line-clamp-2">{f.description}</p>
              {f.variables && (
                <div className="text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                  {Object.entries(f.variables).map(([k, v]) => <div key={k}><span className="font-bold text-gray-700">{k}:</span> {v as string}</div>)}
                </div>
              )}
              {f.example && <p className="text-xs text-gray-500 mb-4 italic pb-4 border-b">Ex: {f.example}</p>}
              <button onClick={() => openCalculator(f)} className="w-full mt-2 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                Open Calculator
              </button>
            </div>
          ))}
        </div>

        {calculator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold mb-2 text-gray-900">{calculator.name}</h3>
              <div className="bg-gray-50 p-4 rounded-xl mb-6 border">
                <p className="text-blue-600 font-mono font-bold text-center">{calculator.formula}</p>
              </div>
              <div className="space-y-4 mb-6">
                {calculator.variables && Object.entries(calculator.variables).map(([k, v]) => (
                  <div key={k}>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{k} <span className="font-normal text-gray-500">({v as string})</span></label>
                    <input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder={`Enter ${k}`} value={calcInputs[k] || ""} onChange={e => setCalcInputs({ ...calcInputs, [k]: e.target.value })} />
                  </div>
                ))}
              </div>
              {calcResult && (
                <div className={`p-4 rounded-xl mb-6 font-medium ${calcResult.error ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-800 border border-green-200"}`}>
                  {calcResult.error ? calcResult.error : `Result: ${calcResult.result}`}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={runCalc} className="flex-1 py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">Calculate</button>
                <button onClick={() => setCalculator(null)} className="px-6 py-3 font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
