import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { formatINR, formatCompact } from "@/lib/finance";
import { useAuth } from '@/lib/AuthContext';
import useAnalysisWorkspace from '@/components/propwise/state/useAnalysisWorkspace';
import useAnalysisRecords from '@/components/propwise/state/useAnalysisRecords';
import { reportResults } from '@/components/propwise/state/analysisModel';

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useAnalysisWorkspace(user?.id);
  const { inputs, setInputs, set, currentId, active, workspace, saveWizard } = store;
  const [toast, setToast] = useState(null);
  const [confirmNew, setConfirmNew] = useState(false);
  const [namePrompt, setNamePrompt] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [openingId, setOpeningId] = useState(null);
  const openLock = React.useRef(false);
  const toastTimer = React.useRef(null);
  const showToast = useCallback((msg, tone = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, tone });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const records = useAnalysisRecords(store, user?.id, showToast);
  const { savedAnalyses, loadSaved, loadById, loadError, setLoadError, del, duplicate, copyLink, rename } = records;
  const r = useMemo(() => reportResults(inputs, active?.calculated), [inputs, active?.calculated]);
  const analysisPath = useCallback((route, module) => {
    if (!currentId || !active?.report_ready) return '/analysis/new';
    const group = route.includes('property-costs') ? 'costs' : route.includes('investment') ? 'investment' : 'affordability';
    return `/analysis/${currentId}?group=${group}${module ? `&m=${module}` : ''}`;
  }, [currentId, active?.report_ready]);
  const doSave = useCallback(async overrideTitle => {
    const record = await records.write({ ...inputs, title: overrideTitle ?? inputs.title });
    if (record) navigate(`/analysis/${record.id}${window.location.search}`, { replace: true });
    return record;
  }, [records.write, inputs, navigate]);
  const requestSave = useCallback(() => {
    if (!currentId) { navigate('/analysis/new'); return; }
    if (!inputs.title?.trim()) { setNameVal(''); setNamePrompt(true); return; }
    return doSave();
  }, [currentId, inputs.title, doSave, navigate]);
  const confirmNameSave = useCallback(async () => { if (await doSave(nameVal.trim())) setNamePrompt(false); }, [doSave, nameVal]);
  const load = useCallback(async id => {
    if (openLock.current || records.isSaving || records.busyId) return;
    openLock.current = true; setOpeningId(id);
    try {
      if (await loadById(id, true)) navigate(`/analysis/${id}`);
      else showToast('Unable to open this analysis. Please retry.', 'err');
    } finally { openLock.current = false; setOpeningId(null); }
  }, [loadById, navigate, showToast, records.isSaving, records.busyId]);
  const startAnalysis = useCallback(async data => {
    setInputs(data);
    const record = await records.write(data, false);
    if (record) navigate(`/analysis/${record.id}`);
    return record;
  }, [setInputs, records.write, navigate]);
  const doNew = useCallback(() => {
    if (records.isSaving || records.busyId) return;
    setConfirmNew(false);
    store.reset();
    navigate('/analysis/new');
  }, [store.reset, navigate, records.isSaving, records.busyId]);
  const requestNew = useCallback(() => { if (active?.dirty) setConfirmNew(true); else doNew(); }, [active?.dirty, doNew]);

  const exportReport = useCallback(() => {
    if (!r.hasInputs) {
      showToast("Complete an analysis before exporting a report.", "warn");
      return;
    }
    const lines = [
      `PropWise — Property Analysis Report`,
      ``,
      `Report Name: ${inputs.title || "Untitled"}`,
      inputs.owner_name ? `Prepared for: ${inputs.owner_name}` : ``,
      inputs.property_location ? `Property: ${inputs.property_location}` : ``,
      `Generated: ${new Date().toLocaleString()}`,
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
    ...records,
    wizard: workspace.wizard,
    saveWizard,
    initializeAnalysis: records.initialize,
    analysisId: currentId,
    active,
    storageError: store.storageError,
    analysisPath,
    openingId,
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
    startAnalysis,
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