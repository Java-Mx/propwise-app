import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_INPUTS, DEMO_INPUTS, computeAll } from "@/lib/finance";
import AffordabilityTab from "@/components/propwise/AffordabilityTab";
import PropertyCostsTab from "@/components/propwise/PropertyCostsTab";
import InvestmentTab from "@/components/propwise/InvestmentTab";
import { Home as HomeIcon, Calculator, Wallet, TrendingUp, Sparkles, Save, FolderOpen, Plus } from "lucide-react";

const TABS = [
  { key: "affordability", label: "Affordability", icon: Calculator, question: "Can I afford this property?" },
  { key: "costs", label: "Property Costs", icon: Wallet, question: "What will this property actually cost me?" },
  { key: "investment", label: "Investment", icon: TrendingUp, question: "Who should consider this, and what if I rent it out?" },
];

export default function Home() {
  const [inputs, setInputs] = useState({ ...DEFAULT_INPUTS });
  const [activeTab, setActiveTab] = useState("affordability");
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const r = useMemo(() => computeAll(inputs), [inputs]);

  const set = useCallback((field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  const loadSaved = useCallback(async () => {
    try {
      const list = await base44.entities.Analysis.list("-updated_date", 50);
      setSavedAnalyses(list || []);
    } catch (e) {
      setSavedAnalyses([]);
    }
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...inputs, title: inputs.title || "My Property Analysis" };
      if (currentId) {
        await base44.entities.Analysis.update(currentId, payload);
        showToast("Analysis updated");
      } else {
        const created = await base44.entities.Analysis.create(payload);
        setCurrentId(created.id);
        showToast("Analysis saved");
      }
      loadSaved();
    } catch (e) {
      showToast("Could not save — please sign in");
    }
    setSaving(false);
  };

  const handleLoad = async (id) => {
    try {
      const rec = await base44.entities.Analysis.get(id);
      const { id: _id, created_date, updated_date, created_by_id, ...data } = rec;
      setInputs({ ...DEFAULT_INPUTS, ...data });
      setCurrentId(id);
      setShowSaved(false);
      setActiveTab("affordability");
      showToast("Analysis loaded");
    } catch (e) {
      showToast("Could not load analysis");
    }
  };

  const handleNew = () => {
    setInputs({ ...DEFAULT_INPUTS });
    setCurrentId(null);
    setActiveTab("affordability");
    showToast("New analysis started");
  };

  const handleDemo = () => {
    setInputs({ ...DEMO_INPUTS, title: "Demo Analysis" });
    setCurrentId(null);
    setActiveTab("affordability");
    showToast("Demo data loaded");
  };

  const activeTabObj = TABS.find((t) => t.key === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <HomeIcon className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight">PropWise</div>
              <div className="hidden text-[11px] text-slate-400 sm:block">Understand the real cost of your next home.</div>
            </div>
          </div>

          <nav className="ml-2 hidden items-center gap-1 sm:flex">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  activeTab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleDemo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Sparkles className="h-3.5 w-3.5" /> Demo
            </button>
            <div className="relative">
              <button
                onClick={() => { setShowSaved((v) => !v); loadSaved(); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <FolderOpen className="h-3.5 w-3.5" /> Saved
              </button>
              {showSaved && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-100 bg-white p-2 shadow-lg">
                  {savedAnalyses.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-slate-400">No saved analyses yet</div>
                  ) : (
                    savedAnalyses.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleLoad(a.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                          a.id === currentId ? "bg-slate-50 font-medium" : ""
                        }`}
                      >
                        <span className="truncate text-slate-700">{a.title || "Untitled"}</span>
                        <span className="ml-2 shrink-0 text-xs text-slate-400">{formatShortPrice(a.property_price)}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={handleNew}
              title="New Analysis"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                activeTab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{activeTabObj.question}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === "affordability" && "Enter your figures to see EMI, monthly cost, payoff time and future value."}
            {activeTab === "costs" && "Add the extra costs beyond the loan — monthly, annual and one-time."}
            {activeTab === "investment" && "See rental potential, a suitable-buyer profile and a yearly projection."}
          </p>
        </div>

        {activeTab === "affordability" && <AffordabilityTab inputs={inputs} set={set} r={r} />}
        {activeTab === "costs" && <PropertyCostsTab inputs={inputs} set={set} r={r} />}
        {activeTab === "investment" && <InvestmentTab inputs={inputs} set={set} r={r} />}
      </main>

      {/* Disclaimer */}
      <footer className="mx-auto max-w-6xl px-4 pb-10">
        <p className="rounded-xl bg-slate-100/70 px-4 py-3 text-xs leading-relaxed text-slate-500">
          PropWise provides estimates based on user-provided information and assumptions. Property values, rental
          income, interest rates and future costs may change. This tool is intended for informational and
          decision-support purposes and does not constitute financial, investment, tax, legal or lending advice.
        </p>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function formatShortPrice(p) {
  if (!p) return "—";
  if (p >= 10000000) return "₹" + (p / 10000000).toFixed(1) + " Cr";
  if (p >= 100000) return "₹" + (p / 100000).toFixed(1) + " L";
  return "₹" + p;
}