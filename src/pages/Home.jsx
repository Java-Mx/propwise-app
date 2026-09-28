import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_INPUTS, computeAll, num, formatINR, formatCompact } from "@/lib/finance";
import AffordabilityTab from "@/components/propwise/AffordabilityTab";
import PropertyCostsTab from "@/components/propwise/PropertyCostsTab";
import InvestmentTab from "@/components/propwise/InvestmentTab";
import { Button, ConfirmDialog, EmptyState } from "@/components/propwise/ui";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import { Home as HomeIcon, Calculator, Wallet, TrendingUp, Plus, Pencil, Info } from "lucide-react";

const TABS = [
  { key: "affordability", label: "Affordability", icon: Calculator, question: "Can I afford this property?", sub: "Enter your financial details to estimate the monthly and long-term cost." },
  { key: "costs", label: "Property Costs", icon: Wallet, question: "What will this property actually cost me?", sub: "Add the extra costs beyond the loan." },
  { key: "investment", label: "Investment", icon: TrendingUp, question: "Who should consider this, and what if I rent it out?", sub: "See rental potential, buyer profile and projections." },
];

export default function Home() {
  const [inputs, setInputs] = useState({ ...DEFAULT_INPUTS });
  const [activeTab, setActiveTab] = useState("affordability");
  const [began, setBegan] = useState(false);
  const [invSub, setInvSub] = useState("profile");
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [titleEditing, setTitleEditing] = useState(false);

  const r = useMemo(() => computeAll(inputs), [inputs]);

  const set = useCallback((field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (num(inputs.property_price) > 0) setBegan(true);
  }, [inputs.property_price]);

  useEffect(() => { loadSaved(); }, []);

  const showToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2600);
  };

  const loadSaved = async () => {
    try {
      const list = await base44.entities.Analysis.list("-updated_date", 50);
      setSavedAnalyses(list || []);
    } catch (e) {
      setSavedAnalyses([]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const title = (inputs.title || "").trim() || "Property Analysis";
      const payload = { ...inputs, title };
      if (currentId) {
        await base44.entities.Analysis.update(currentId, payload);
        showToast("Analysis saved");
      } else {
        const created = await base44.entities.Analysis.create(payload);
        setCurrentId(created.id);
        setInputs((p) => ({ ...p, title }));
        showToast("Analysis saved");
      }
      loadSaved();
    } catch (e) {
      showToast("Something went wrong. Please try again.", "err");
    }
    setSaving(false);
  };

  const handleLoad = async (id) => {
    try {
      const rec = await base44.entities.Analysis.get(id);
      const { id: _id, created_date, updated_date, created_by_id, ...data } = rec;
      setInputs({ ...DEFAULT_INPUTS, ...data });
      setCurrentId(id);
      setBegan(true);
      setActiveTab("affordability");
      showToast("Analysis loaded");
    } catch (e) {
      showToast("Could not load analysis", "err");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await base44.entities.Analysis.delete(deleteTarget);
      if (deleteTarget === currentId) { setCurrentId(null); setInputs({ ...DEFAULT_INPUTS }); setBegan(false); }
      loadSaved();
      showToast("Analysis deleted");
    } catch (e) {
      showToast("Could not delete analysis", "err");
    }
    setDeleteTarget(null);
  };

  const handleNew = () => {
    setInputs({ ...DEFAULT_INPUTS });
    setCurrentId(null);
    setBegan(true);
    setActiveTab("affordability");
    setConfirmNew(false);
    showToast("New analysis started");
  };

  const handleStart = () => setBegan(true);

  const handleNavigate = ({ tab, anchor, invSub: inv }) => {
    setActiveTab(tab);
    if (inv) setInvSub(inv);
    if (!began) setBegan(true);
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 90);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleExport = () => {
    if (!r.hasInputs) { showToast("Enter a property price first", "warn"); return; }
    const lines = [
      `PropWise — Property Analysis Report`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `Analysis: ${inputs.title || "Untitled"}`,
      ``,
      `PROPERTY`,
      `  Property price: ${formatINR(r.price)}`,
      `  Available savings: ${formatINR(r.saved)}`,
      `  Property type: ${inputs.property_type}`,
      ``,
      `LOAN`,
      `  Home loan percentage: ${r.loanPct || 0}%`,
      `  Maximum eligible loan: ${formatINR(r.maxLoanEligibility)}`,
      `  Actual loan required: ${formatINR(r.actualLoan)}`,
      `  Down payment: ${formatINR(r.downPayment)}`,
      `  Interest rate: ${r.rate || 0}%  |  Tenure: ${r.tenure || 0} years`,
      `  Estimated EMI: ${formatINR(r.emi)}`,
      `  Total interest: ${formatINR(r.totalInterest)}`,
      `  Total repayment: ${formatINR(r.totalRepayment)}`,
      ``,
      `MONTHLY COST`,
      `  Total monthly cost: ${formatINR(r.totalMonthlyCost)}`,
      `  Income burden: ${r.incomeBurden.toFixed(1)}% (${r.level.label})`,
      ``,
      `FUTURE VALUE`,
      `  Appreciation: ${r.appreciation || 0}%`,
      `  Value after 10 years: ${formatINR(r.fv(10))}`,
      ``,
      `RENTAL`,
      `  Monthly rent: ${formatINR(r.monthlyRent)}`,
      `  Gross yield: ${r.grossYield.toFixed(2)}%`,
      `  Net yield: ${r.netYield.toFixed(2)}%`,
      `  Net monthly outflow: ${formatINR(r.netMonthlyOutflow)}`,
      ``,
      `This is an estimate based on user-provided assumptions and does not constitute financial advice.`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `propwise-analysis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Report exported");
  };

  const activeTabObj = TABS.find((t) => t.key === activeTab);

  return (
    <div className="min-h-screen bg-pagebg text-ink">
      {/* Header */}
      <PropWiseHeader
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onNew={() => setConfirmNew(true)}
        onSave={handleSave}
        saving={saving}
        onExport={handleExport}
        savedAnalyses={savedAnalyses}
        onLoadSaved={handleLoad}
        onDeleteSaved={setDeleteTarget}
        onRefreshSaved={loadSaved}
        analysisTitle={inputs.title}
        onRename={(t) => set("title", t)}
        formatPrice={formatShortPrice}
      />

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {!began ? (
          <EmptyState
            icon={HomeIcon}
            title="No property analysis yet."
            message="Enter your property price and financial details to begin."
            action={<Button variant="primary" size="lg" icon={Plus} onClick={handleStart}>Start Analysis</Button>}
          />
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-ink">{activeTabObj.question}</h1>
                <p className="mt-1 text-sm text-sub">{activeTabObj.sub}</p>
              </div>
              <div className="flex items-center gap-2">
                {titleEditing ? (
                  <input
                    autoFocus
                    value={inputs.title || ""}
                    onChange={(e) => set("title", e.target.value)}
                    onBlur={() => setTitleEditing(false)}
                    onKeyDown={(e) => e.key === "Enter" && setTitleEditing(false)}
                    placeholder="Analysis name"
                    className="h-9 w-48 rounded-lg border border-line bg-inputbg px-3 text-sm font-medium text-ink outline-none focus:border-jade/50 focus:ring-2 focus:ring-jade/15"
                  />
                ) : (
                  <button onClick={() => setTitleEditing(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-medium text-sub hover:text-ink">
                    <Pencil className="h-3.5 w-3.5" />
                    {inputs.title || "Name this analysis"}
                  </button>
                )}
              </div>
            </div>

            {activeTab === "affordability" && <AffordabilityTab inputs={inputs} set={set} r={r} />}
            {activeTab === "costs" && <PropertyCostsTab inputs={inputs} set={set} r={r} />}
            {activeTab === "investment" && <InvestmentTab inputs={inputs} set={set} r={r} sub={invSub} setSub={setInvSub} />}
          </>
        )}
      </main>

      {/* Disclaimer */}
      <footer className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-xs text-sub ring-1 ring-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sub" />
          <span>Estimates are based on user-provided assumptions and may differ from actual costs. PropWise is for informational and decision-support purposes only — not financial, investment, tax or legal advice.</span>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm text-white shadow-lg ${toast.tone === "err" ? "bg-err" : toast.tone === "warn" ? "bg-warn" : "bg-brand"}`}>
          {toast.msg}
        </div>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmNew}
        title="Start a new property analysis?"
        message="This will clear the current inputs. Save first if you want to keep the current analysis."
        confirmLabel="Start New"
        onConfirm={handleNew}
        onCancel={() => setConfirmNew(false)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this analysis?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function formatShortPrice(p) {
  if (!p) return "—";
  if (p >= 10000000) return "₹" + (p / 10000000).toFixed(1) + " Cr";
  if (p >= 100000) return "₹" + (p / 100000).toFixed(1) + " L";
  return "₹" + p;
}