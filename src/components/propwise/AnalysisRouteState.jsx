import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, FileQuestion } from 'lucide-react';

export default function AnalysisRouteState({ loading, error, onRetry }) {
  return <main className="mx-auto max-w-3xl px-4 py-16 text-ink">
    <div className="rounded-2xl border border-line bg-card px-6 py-16 text-center">
      {loading ? <><Loader2 className="mx-auto h-6 w-6 animate-spin text-jade" /><p className="mt-4 text-sub" role="status">Loading analysis…</p></> : <>
        <FileQuestion className="mx-auto h-8 w-8 text-jade" />
        <h1 className="mt-4 text-lg font-semibold">{error?.notFound ? 'Analysis not found' : 'Unable to load analysis'}</h1>
        <p className="mt-2 text-sm text-sub" role="alert">{error?.message || 'The link is invalid or this analysis is unavailable.'}</p>
        {!error?.notFound && <button onClick={onRetry} className="mt-5 rounded-lg bg-jade px-4 py-2 text-white">Retry</button>}
        <Link to="/analysis/new" className="mt-5 block text-jade underline">Create a new analysis</Link>
      </>}
    </div>
  </main>;
}