import React, { useState, useEffect } from "react";
import { useLocation, useParams, Navigate } from "react-router-dom";
import AnalysisRouteState from '@/components/propwise/AnalysisRouteState';
import ReportStatus from '@/components/propwise/ReportStatus';
import { useAnalysis } from "@/lib/AnalysisContext";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import ModuleHost from "@/components/propwise/ModuleHost";
import { Info, Pencil, FileQuestion, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/propwise/BottomNav";

const ROUTE_GROUP = {
  "/analysis/affordability": "affordability",
  "/analysis/property-costs": "costs",
  "/analysis/investment": "investment",
};

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { inputs, set, currentId, active, loadById, loadError, analysisPath } = useAnalysis();
  const requestedGroup = new URLSearchParams(location.search).get('group');
  const group = ['affordability', 'costs', 'investment'].includes(requestedGroup) ? requestedGroup : 'affordability';
  const [titleEditing, setTitleEditing] = useState(false);
  const [loadedId, setLoadedId] = useState(null);
  const [retry, setRetry] = useState(0);
  const targetId = id || currentId;
  useEffect(() => {
    if (!targetId) return;
    let cancelled = false;
    setLoadedId(null);
    loadById(targetId).then(record => { if (!cancelled && record) setLoadedId(targetId); });
    return () => { cancelled = true; };
  }, [targetId, loadById, retry]);
  if (!id) {
    if (targetId && (loadedId !== targetId || !active)) return <AnalysisRouteState loading={loadError?.id !== targetId} error={loadError?.id === targetId ? loadError : null} onRetry={() => setRetry(v => v + 1)} />;
    const route = analysisPath(location.pathname, new URLSearchParams(location.search).get('m'));
    return <Navigate to={route} replace />;
  }
  if (loadError?.id === id || loadedId !== id || currentId !== id) return <AnalysisRouteState loading={loadError?.id !== id} error={loadError?.id === id ? loadError : null} onRetry={() => setRetry(v => v + 1)} />;
  if (!active?.report_ready) return <Navigate to="/analysis/new" replace />;

  return (
    <div className="min-h-screen text-ink">
      <PropWiseHeader />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sub">Report</div>
            <div className="mt-0.5 truncate text-base font-semibold text-ink">{inputs.title || "Untitled analysis"}</div>
            {inputs.owner_name && (
              <div className="mt-0.5 truncate text-xs text-sub">
                Prepared for {inputs.owner_name}{inputs.property_location ? ` · ${inputs.property_location}` : ""}
              </div>
            )}
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
                className="h-10 w-48 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink outline-none focus:border-jade focus:ring-2 focus:ring-jade/15"
              />
            ) : (
              <button
                onClick={() => setTitleEditing(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-sm font-medium text-sub hover:text-ink"
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </button>
            )}
          </div>
        </div>

        <ReportStatus />
        <ModuleHost key={id} group={group} />
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-28 md:pb-10">
        <div className="flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-xs text-sub ring-1 ring-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sub" />
          <span>
            PropWise provides estimates based on user-provided assumptions and is intended for informational and
            decision-support purposes. It does not constitute financial, investment, tax, legal or lending advice.
          </span>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}