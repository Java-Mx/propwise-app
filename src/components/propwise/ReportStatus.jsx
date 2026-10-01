import React from 'react';
import { useAnalysis } from '@/lib/AnalysisContext';
import { Button } from '@/components/propwise/ui';

export default function ReportStatus() {
  const { currentId, active, isSaving, saveError, storageError, requestSave, copyLink, busyId } = useAnalysis();
  return <div className="mb-5 rounded-lg border border-line bg-card p-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sub" aria-live="polite">{isSaving ? 'Saving to the database…' : active?.dirty ? 'Unsaved changes' : active?.status === 'draft' ? 'Report generated — save to Saved Analyses.' : `Saved${active?.saved_at ? ` · ${new Date(active.saved_at).toLocaleString()}` : ''}`}</span>
      <div className="flex gap-2">
        <Button loading={isSaving} disabled={!!busyId} onClick={requestSave}>Save Analysis</Button>
        {active?.status !== 'draft' && <Button variant="secondary" disabled={isSaving || !!busyId || active?.dirty} loading={busyId === currentId} onClick={() => copyLink(currentId)}>Copy Link</Button>}
      </div>
    </div>
    {saveError && <p className="mt-2 text-err" role="alert">{saveError}</p>}
    {storageError && <p className="mt-2 text-err" role="alert">{storageError}</p>}
  </div>;
}