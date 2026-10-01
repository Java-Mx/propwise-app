import React, { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { readInputs, reportResults } from '@/components/propwise/state/analysisModel';
import { useTheme } from '@/lib/theme';
import Logo from '@/components/propwise/Logo';
import AnalysisRouteState from '@/components/propwise/AnalysisRouteState';
import ReportSummary from '@/components/propwise/report/ReportSummary';
import ReportProjections from '@/components/propwise/report/ReportProjections';

export default function SharedReport() {
  const { id } = useParams();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  const { theme, setTheme } = useTheme();
  const { data: report, isPending, error, refetch } = useQuery({
    queryKey: ['shared-report', id, token], retry: false,
    queryFn: async () => {
      const response = await base44.functions.invoke('readSharedReport', { analysisId: id, token });
      if (!response.data?.report || response.data.report.id !== id) throw new Error('Shared report not found.');
      return response.data.report;
    },
  });
  if (isPending || error) return <AnalysisRouteState loading={isPending} error={error ? { notFound: error.status === 404 || error.response?.status === 404, message: error.response?.data?.error || error.message } : null} onRetry={refetch} />;
  const r = reportResults(readInputs(report), report.calculated);
  return <div className="min-h-screen text-ink">
    <header className="border-b border-line bg-card"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4"><Link to="/"><Logo size={48} /></Link><button className="rounded-lg border border-line px-3 py-2 text-sm text-sub" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Switch theme</button></div></header>
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <div><p className="text-xs font-semibold uppercase text-sub">Read-only report</p><h1 className="mt-1 break-words text-2xl font-semibold">{report.title}</h1><p className="mt-1 text-sm text-sub">Prepared for {report.owner_name}{report.property_location ? ` · ${report.property_location}` : ''}</p><p className="mt-1 text-xs text-sub">Saved {new Date(report.saved_at || report.updated_date).toLocaleString()}</p></div>
      <ReportSummary report={report} r={r} />
      <ReportProjections r={r} />
    </main>
    <footer className="mx-auto max-w-7xl px-4 pb-10 text-xs text-sub">Estimates based on user-provided assumptions. Not financial, investment, tax, legal or lending advice.</footer>
  </div>;
}