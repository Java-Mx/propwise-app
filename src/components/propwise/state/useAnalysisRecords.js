import { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { readInputs, savePayload, validateAnalysis, errorMessage, newKey, isLocalId } from '@/components/propwise/state/analysisModel';

export default function useAnalysisRecords(store, userId, showToast, onAuthRequired) {
  const { ref, change } = store;
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const lock = useRef(false);
  const loadSequence = useRef(0);
  const listSequence = useRef(0);
  const accept = useCallback((record, preserveDirty = false) => {
    if (!record?.id) throw new Error('The database did not confirm the analysis ID. Please retry.');
    change(w => {
      const previous = w.records[record.id];
      const recover = preserveDirty && previous?.dirty && previous.updated_date === record.updated_date;
      const entry = recover ? { ...previous, status: record.status } : { inputs: readInputs(record), calculated: record.calculated, dirty: false, status: record.status, report_ready: record.report_ready ?? true, updated_date: record.updated_date, saved_at: record.saved_at };
      const input = entry.inputs;
      const wizard = record.report_ready === false && w.wizard?.analysisId !== record.id ? {
        draftKey: record.draft_key || newKey(), analysisId: record.id, step: 1, reached: 2,
        form: { reportName: input.title, fullName: input.owner_name, email: input.owner_email, location: input.property_location, ...Object.fromEntries(['property_type', 'property_price', 'monthly_income', 'existing_emi', 'amount_saved', 'home_loan_percentage', 'interest_rate', 'loan_tenure_years'].map(k => [k, input[k]])) },
      } : w.wizard;
      return { ...w, activeId: record.id, records: { ...w.records, [record.id]: entry }, wizard };
    });
    setLoadError(null);
    return record;
  }, [change]);
  const loadSaved = useCallback(async () => {
    if (!userId) return;
    const seq = ++listSequence.current;
    setListLoading(true); setListError(null);
    try {
      const list = await base44.entities.Analysis.filter({ created_by_id: userId, status: { $ne: 'draft' } }, '-updated_date', 500);
      if (seq === listSequence.current) setSavedAnalyses(list || []);
    } catch (e) { if (seq === listSequence.current) setListError(errorMessage(e, 'Unable to load saved analyses. Please retry.')); }
    finally { if (seq === listSequence.current) setListLoading(false); }
  }, [userId]);
  // Guest mode: an analysis can live entirely in the browser under a `local_*` id
  // until the user signs in to save or share it.
  const commitLocal = useCallback((data, opts = {}) => {
    const id = opts.existingId || `local_${newKey()}`;
    const inputs = readInputs(data);
    change(w => ({
      ...w,
      activeId: id,
      records: { ...w.records, [id]: { inputs, calculated: null, dirty: false, status: 'draft', report_ready: opts.reportReady ?? false, updated_date: new Date().toISOString(), saved_at: null } },
    }));
    return { id, ...inputs };
  }, [change]);
  const loadById = useCallback(async (id, fresh = false) => {
    const seq = ++loadSequence.current;
    setLoadError(null);
    if (isLocalId(id)) {
      const entry = ref.current.records[id];
      if (!entry) { if (seq === loadSequence.current) setLoadError({ id, notFound: true, message: 'This analysis is not available.' }); return null; }
      change(w => (w.activeId === id ? w : { ...w, activeId: id }));
      return { id, ...entry.inputs, calculated: entry.calculated, status: entry.status, report_ready: entry.report_ready, updated_date: entry.updated_date, saved_at: entry.saved_at };
    }
    try {
      const record = await base44.entities.Analysis.get(id);
      if (!record?.id || record.id !== id || record.created_by_id !== userId) throw Object.assign(new Error('Analysis not found or unavailable to this account.'), { status: 404 });
      if (seq !== loadSequence.current) return null;
      return accept(record, !fresh);
    } catch (e) {
      if (seq === loadSequence.current) setLoadError({ id, notFound: [404, 403].includes(e.status || e.response?.status), message: errorMessage(e, 'Unable to load this analysis. Please retry.') });
      return null;
    }
  }, [accept, userId, change, ref]);
  const initialize = useCallback(async (data, draftKey, draftId) => {
    if (lock.current) return null;
    if (!userId) { return commitLocal(data, { existingId: draftId || undefined, reportReady: false }); }
    lock.current = true; setIsSaving(true); setSaveError(null);
    try {
      const error = validateAnalysis(data, true); if (error) throw new Error(error);
      const matches = draftId ? [] : await base44.entities.Analysis.filter({ created_by_id: userId, draft_key: draftKey }, '-created_date', 1);
      const id = draftId || matches[0]?.id;
      const existing = id ? await base44.entities.Analysis.get(id) : null;
      const payload = { ...savePayload({ ...readInputs(existing || {}), ...data }), draft_key: draftKey, status: existing?.status || 'draft', report_ready: existing?.report_ready ?? false, lifecycle: existing?.saved_at ? 'updated' : 'created' };
      const record = id ? await base44.entities.Analysis.update(id, payload) : await base44.entities.Analysis.create(payload);
      return accept(record);
    } catch (e) { const message = errorMessage(e, 'Unable to initialize the analysis.'); setSaveError(message); throw new Error(message); }
    finally { lock.current = false; setIsSaving(false); }
  }, [accept, userId, commitLocal]);
  const write = useCallback(async (data, save = true) => {
    if (lock.current) return null;
    if (!userId) { onAuthRequired?.(window.location.pathname + window.location.search); return null; }
    lock.current = true; setIsSaving(true); setSaveError(null);
    try {
      const id = ref.current.activeId;
      if (!id) throw new Error('Start with Basic Information before saving a report.');
      const error = validateAnalysis(data); if (error) throw new Error(error);
      const prior = ref.current.records[id];
      const payload = { ...savePayload(data), report_ready: true, status: save ? 'saved' : (prior?.status || 'draft'), lifecycle: prior?.saved_at ? 'updated' : 'created', ...(save || prior?.status === 'saved' ? { saved_at: new Date().toISOString() } : {}) };
      let record;
      if (isLocalId(id)) {
        record = await base44.entities.Analysis.create({ ...payload, draft_key: newKey() });
        if (!record?.id) throw new Error('The database did not confirm the save. Please retry.');
        const realId = record.id;
        change(w => {
          const { [id]: _local, ...rest } = w.records;
          return { ...w, activeId: realId, records: { ...rest, [realId]: { inputs: readInputs(record), calculated: record.calculated, dirty: false, status: record.status, report_ready: true, updated_date: record.updated_date, saved_at: record.saved_at } } };
        });
      } else {
        record = await base44.entities.Analysis.update(id, payload);
        if (!record?.id || record.id !== id) throw new Error('The database did not confirm the save. Please retry.');
        change(w => {
          const current = w.records[id];
          const editedDuringSave = JSON.stringify(current.inputs) !== JSON.stringify(data);
          const entry = { ...current, ...(editedDuringSave ? {} : { inputs: readInputs(record), calculated: record.calculated }), dirty: editedDuringSave, status: record.status, report_ready: true, updated_date: record.updated_date, saved_at: record.saved_at };
          return { ...w, records: { ...w.records, [id]: entry } };
        });
      }
      if (save) { showToast('Analysis saved to the database.'); await loadSaved(); }
      return record;
    } catch (e) { const message = errorMessage(e, 'Unable to save this analysis. Please retry.'); setSaveError(message); showToast(message, 'err'); return null; }
    finally { lock.current = false; setIsSaving(false); }
  }, [ref, change, loadSaved, showToast, userId, onAuthRequired]);
  const action = useCallback(async (id, operation, message) => {
    if (lock.current) return false;
    lock.current = true; setBusyId(id); setSaveError(null);
    try { await operation(); showToast(message); await loadSaved(); return true; }
    catch (e) { const text = errorMessage(e, 'The operation failed. Please retry.'); setSaveError(text); showToast(text, 'err'); return false; }
    finally { lock.current = false; setBusyId(null); }
  }, [showToast, loadSaved]);
  const del = useCallback(id => action(id, async () => {
    await base44.entities.Analysis.delete(id);
    change(w => { const records = { ...w.records }; delete records[id]; return { ...w, records, activeId: w.activeId === id ? null : w.activeId, wizard: w.wizard?.analysisId === id ? null : w.wizard }; });
  }, 'Analysis deleted.'), [action, change]);
  const rename = useCallback((id, title) => action(id, async () => {
    if (!title?.trim()) throw new Error('Enter a report name.');
    const record = await base44.entities.Analysis.update(id, { title: title.trim(), lifecycle: 'updated' });
    if (record.id !== id) throw new Error('Rename was not confirmed.');
    change(w => { const cached = w.records[id]; return cached ? { ...w, records: { ...w.records, [id]: { ...cached, inputs: { ...cached.inputs, title: title.trim() }, updated_date: record.updated_date } } } : w; });
  }, 'Analysis renamed.'), [action, change]);
  const duplicate = useCallback(id => action(id, async () => {
    const record = await base44.entities.Analysis.get(id);
    const copy = await base44.entities.Analysis.create({ ...savePayload(record), title: `${record.title} — Copy`, draft_key: newKey(), report_ready: true, status: 'saved', lifecycle: 'created', saved_at: new Date().toISOString(), share_token: '' });
    if (!copy?.id || copy.id === id) throw new Error('Independent copy was not confirmed.');
  }, 'Independent analysis copy saved.'), [action]);
  const copyLink = useCallback(id => action(id, async () => {
    const record = await base44.entities.Analysis.get(id);
    if (record.status === 'draft') throw new Error('Save this report before sharing it.');
    const token = record.share_token || (newKey().replaceAll('-', '') + newKey().replaceAll('-', ''));
    if (!record.share_token) {
      const confirmed = await base44.entities.Analysis.update(id, { share_token: token });
      if (confirmed.share_token !== token) throw new Error('Shared link was not confirmed.');
      change(w => { const cached = w.records[id]; return cached ? { ...w, records: { ...w.records, [id]: { ...cached, updated_date: confirmed.updated_date } } } : w; });
    }
    const url = `${window.location.origin}/shared/${id}?token=${token}`;
    try { await navigator.clipboard.writeText(url); }
    catch { window.prompt('Copy the read-only report link:', url); return; }
  }, 'Read-only report link ready.'), [action, change]);
  return { savedAnalyses, listLoading, listError, loadSaved, loadById, loadError, setLoadError, initialize, write, isSaving, saveError, busyId, del, rename, duplicate, copyLink };
}