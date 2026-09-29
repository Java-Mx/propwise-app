import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { DEFAULT_INPUTS, computeAll, num, formatINR, formatCompact } from "@/lib/finance";

const AnalysisContext = createContext(null);

// Entity number fields — must be stored as numbers, never empty strings
// (empty strings fail the Analysis schema validation and cause "cannot save").
const NUM_FIELDS = [
  "property_price", "amount_saved", "home_loan_percentage", "monthly_income",
  "existing_emi", "interest_rate", "loan_tenure_years", "monthly_rent",
  "annual_rent_increase", "vacancy_rate", "annual_rental_maintenance",
  "other_rental_costs", "annual_appreciation", "projection_years",
];

// Coerce inputs into a persistence-safe payload matching the Analysis schema.
function sanitize(inputs) {
  const out = { ...inputs };
  NUM_FIELDS.forEach((f) => { out[f] = num(out[f]); });
  out.costs = Array.isArray(out.costs)
    ? out.costs.map((c) => ({ ...c, amount: num(c.amount) }))
    : [];
  out.scenarios = Array.isArray(out.scenarios)
    ? out.scenarios.map((s) => ({
        ...s,
        property_price: num(s.property_price),
        amount_saved: num(s.amount_saved),
        home_loan_percentage: num(s.home_loan_percentage),
        interest_rate: num(s.interest_rate),
        loan_tenure_years: num(s.loan_tenure_years),
        monthly_rent: num(s.monthly_rent),
      }))
    : [];
  out.title = (out.title || "").trim() || "Property Analysis";
  out.property_type = out.property_type || "Apartment";
  return out;
}

export function AnalysisProvider({ children }) {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ ...DEFAULT_INPUTS });
  const [currentId, setCurrentId] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const [namePrompt, setNamePrompt] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [loadError, setLoadError] = useState(null);
  const toastTimer = React.useRef(null);

  const r = useMemo(() => computeAll(inputs), [inputs]);

  const set = useCallback((field, value) => setInputs((p) => ({ ...p, [field]: value })), []);

  const showToast = useCallback((msg, tone = "ok") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, tone });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const loadSaved = useCallback(async () => {
    try {
      const list = await base44.entities.Analysis.list("-updated_date", 50);
      setSavedAnalyses(list || []);
    } catch (e) {
      console.error("[PropWise] loadSaved failed", e);
      setSavedAnalyses([]);
    }
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  // Load a record into state WITHOUT navigating (used by the /analysis/:id route).
  const loadById = useCallback(async (id) => {
    try {
      const rec = await base44.entities.Analysis.get(id);
      const { id: _i, created_date, updated_date, created_by_id, ...data } = rec;
      setInputs({ ...DEFAULT_INPUTS, ...data });
      setCurrentId(id);
      setLoadError(null);
      return rec;
    } catch (e) {
      console.error("[PropWise] loadById failed", e);
      setLoadError(id);
      return null;
    }
  }, []);

  const doSave = useCallback(async (overrideTitle) => {
    const title = (overrideTitle ?? inputs.title ?? "").trim() || "Property Analysis";
    const payload = sanitize({ ...inputs, title });
    try {
      if (currentId) {
        await base44.entities.Analysis.update(currentId, payload);
      } else {
        const created = await base44.entities.Analysis.create(payload);
        setCurrentId(created.id);
      }
      setInputs((p) => ({ ...p, title }));
      await loadSaved();
      showToast("Analysis saved successfully.");
    } catch (e) {
      console.error("[PropWise] save failed", e);
      showToast("Unable to save this analysis. Please try again.", "err");
    }
  }, [inputs, currentId, loadSaved, showToast]);

  const requestSave = useCallback(() => {
    if (!(inputs.title || "").trim()) {
      setNameVal("");
      setNamePrompt(true);
      return;
    }
    doSave();
  }, [inputs.title, doSave]);

  const confirmNameSave = useCallback(() => {
    setNamePrompt(false);
    const t = nameVal.trim();
    if (t) doSave(t);
  }, [nameVal, doSave]);

  // Open from Saved Analyses — loads then navigates to the stable report URL.
  const load = useCallback(async (id) => {
    const ok = await loadById(id);
    if (ok) {
      showToast("Analysis loaded");
      navigate(`/analysis/${id}`);
    } else {
      showToast("Could not load analysis", "err");
    }
  }, [loadById, navigate, showToast]);

  const del = useCallback(async (id) => {
    try {
      await base44.entities.Analysis.delete(id);
      if (id === currentId) {
        setCurrentId(null);
        setInputs({ ...DEFAULT_INPUTS });
      }
      await loadSaved();
      showToast("Analysis deleted");
    } catch (e) {
      console.error("[PropWise] delete failed", e);
      showToast("Could not delete analysis", "err");
    }
  }, [currentId, loadSaved, showToast]);

  // Create an independent copy with a new id.
  const duplicate = useCallback(async (id) => {
    try {
      const rec = await base44.entities.Analysis.get(id);
      const { id: _i, created_date, updated_date, created_by_id, ...data } = rec;
      const payload = sanitize({ ...data, title: `${(rec.title || "Property Analysis").trim()} — Copy` });
      await base44.entities.Analysis.create(payload);
      await loadSaved();
      showToast("Analysis duplicated");
    } catch (e) {
      console.error("[PropWise] duplicate failed", e);
      showToast("Could not duplicate analysis", "err");
    }
  }, [loadSaved, showToast]);

  // Copy a stable shareable URL pointing to the saved analysis id.
  const copyLink = useCallback(async (id) => {
    const url = `${window.location.origin}/analysis/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Copy this link: " + url, "warn");
    }
  }, [showToast]);

  const rename = useCallback(async (id, newTitle) => {
    const t = (newTitle || "").trim() || "Property Analysis";
    try {
      await base44.entities.Analysis.update(id, { title: t });
      if (id === currentId) setInputs((p) => ({ ...p, title: t }));
      await loadSaved();
      showToast("Analysis renamed");
    } catch (e) {
      console.error("[PropWise] rename failed", e);
      showToast("Could not rename analysis", "err");
    }
  }, [currentId, loadSaved, showToast]);

  const doNew = useCallback(() => {
    setInputs({ ...DEFAULT_INPUTS });
    setCurrentId(null);
    setLoadError(null);
    setConfirmNew(false);
    showToast("New analysis started");
    navigate("/analysis/affordability");
  }, [navigate, showToast]);

  const requestNew = useCallback(() => {
    if (r.hasInputs) setConfirmNew(true);
    else doNew();
  }, [r.hasInputs, doNew]);

  const exportReport = useCallback(() => {
    if (!r.hasInputs) {
      showToast("Complete an analysis before exporting a report.", "warn");
      return;
    }
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
  }, [r, inputs, showToast]);

  const value = {
    inputs,
    setInputs,
    set,
    r,
    currentId,
    savedAnalyses,
    loadSaved,
    requestSave,
    confirmNameSave,
    load,
    loadById,
    loadError,
    setLoadError,
    del,
    duplicate,
    copyLink,
    rename,
    requestNew,
    doNew,
    exportReport,
    toast,
    showToast,
    confirmNew,
    setConfirmNew,
    namePrompt,
    setNamePrompt,
    nameVal,
    setNameVal,
    hasInputs: r.hasInputs,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg ${
            toast.tone === "err" ? "bg-err" : toast.tone === "warn" ? "bg-warn" : "bg-ok"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </AnalysisContext.Provider>
  );
}

export const useAnalysis = () => useContext(AnalysisContext);