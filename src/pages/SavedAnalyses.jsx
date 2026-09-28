import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/lib/AnalysisContext";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import { Button, ConfirmDialog } from "@/components/propwise/ui";
import { FolderOpen, Trash2, Plus } from "lucide-react";

export default function SavedAnalyses() {
  const navigate = useNavigate();
  const { savedAnalyses, loadSaved, load, del } = useAnalysis();
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  return (
    <div className="min-h-screen text-ink">
      <PropWiseHeader />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Saved Analyses</h1>
        <p className="mt-1 text-sm text-sub">Open, review or delete your saved property analyses.</p>

        <div className="mt-6">
          {savedAnalyses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5F1] text-jade">
                <FolderOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-ink">No saved analyses yet.</h3>
              <p className="mt-1 text-sm text-sub">Start a new analysis and save it to see it here.</p>
              <Button
                variant="primary"
                size="lg"
                className="mt-5"
                icon={Plus}
                onClick={() => navigate("/analysis/affordability")}
              >
                Start New Analysis
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAnalyses.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{a.title || "Untitled"}</div>
                    <div className="mt-0.5 text-xs text-sub">
                      {formatPrice(a.property_price)}
                      {a.updated_date ? ` · Updated ${new Date(a.updated_date).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => load(a.id)}>
                    Open
                  </Button>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTarget(a.id)}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this analysis?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => { del(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function formatPrice(p) {
  if (!p) return "—";
  if (p >= 10000000) return "₹" + (p / 10000000).toFixed(1) + " Cr";
  if (p >= 100000) return "₹" + (p / 100000).toFixed(1) + " L";
  return "₹" + p;
}