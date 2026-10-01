import { useCallback, useRef, useState } from 'react';
import { DEFAULT_INPUTS } from '@/lib/finance';

export default function useAnalysisWorkspace(userId) {
  const storageKey = `propwise:workspace:${userId || 'guest'}`;
  const [storageError, setStorageError] = useState(null);
  const [workspace, setWorkspace] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (stored && typeof stored.records === 'object' && stored.records !== null) return stored;
      const legacy = userId ? JSON.parse(localStorage.getItem('propwise:active')) : null;
      return { activeId: legacy?.currentId || null, records: {}, wizard: null };
    } catch { return { activeId: null, records: {}, wizard: null }; }
  });
  const ref = useRef(workspace);
  const change = useCallback(updater => {
    const next = updater(ref.current);
    ref.current = next;
    setWorkspace(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStorageError(null); }
    catch { setStorageError('Browser draft recovery is unavailable. Keep this page open and save your work to the database.'); }
    return next;
  }, [storageKey]);
  const active = workspace.records[workspace.activeId];
  const inputs = active?.inputs || DEFAULT_INPUTS;
  const setInputs = useCallback(updater => change(w => {
    if (!w.activeId || !w.records[w.activeId]) return w;
    const previous = w.records[w.activeId];
    const nextInputs = typeof updater === 'function' ? updater(previous.inputs) : updater;
    const wizard = w.wizard?.analysisId === w.activeId ? {
      ...w.wizard,
      form: { ...w.wizard.form, reportName: nextInputs.title, fullName: nextInputs.owner_name, email: nextInputs.owner_email, location: nextInputs.property_location, ...Object.fromEntries(['property_type', 'property_price', 'monthly_income', 'existing_emi', 'amount_saved', 'home_loan_percentage', 'interest_rate', 'loan_tenure_years'].map(k => [k, nextInputs[k]])) },
    } : w.wizard;
    return { ...w, wizard, records: { ...w.records, [w.activeId]: { ...previous, inputs: nextInputs, dirty: true, calculated: null } } };
  }), [change]);
  const set = useCallback((field, value) => setInputs(p => ({ ...p, [field]: value })), [setInputs]);
  const saveWizard = useCallback(wizard => change(w => ({ ...w, wizard })), [change]);
  const reset = useCallback(() => change(w => ({ ...w, activeId: null, wizard: null })), [change]);
  return { workspace, ref, change, inputs, setInputs, set, saveWizard, reset, storageError, currentId: workspace.activeId, active };
}