import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/lib/AnalysisContext";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import { Button, ConfirmDialog } from "@/components/propwise/ui";
import {
  FolderOpen, Trash2, Plus, Link2, Copy, Pencil, MoreHorizontal,
} from "lucide-react";

export default function SavedAnalyses() {
  const navigate = useNavigate();
  const { savedAnalyses, loadSaved, load, del, duplicate, copyLink, rename, requestNew, listLoading, listError, saveError, busyId, isSaving, openingId } = useAnalysis();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const doRename = async () => {
    if (renameTarget && await rename(renameTarget, renameVal)) setRenameTarget(null);
  };

  return (
    <div className="min-h-screen text-ink">
      <PropWiseHeader />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Saved Analyses</h1>
        <p className="mt-1 text-sm text-sub">Open, duplicate, rename or delete your saved property analyses.</p>

        {saveError && <p className="mt-3 text-sm text-err" role="alert">{saveError}</p>}
        <div className="mt-6">
          {listLoading ? <p className="py-8 text-sm text-sub" role="status">Loading saved analyses…</p> : listError ? <div className="rounded-xl border border-line bg-card p-5"><p className="text-sm text-err" role="alert">{listError}</p><Button className="mt-3" onClick={loadSaved}>Retry</Button></div> : savedAnalyses.length === 0 ? (
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
                onClick={requestNew}
              >
                Start New Analysis
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAnalyses.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">{a.title || "Untitled"}</div>
                    <div className="mt-0.5 truncate text-xs text-sub">
                      {a.owner_name ? `Prepared for ${a.owner_name}` : "—"}
                      {a.property_location ? ` · ${a.property_location}` : ""}
                    </div>
                    <div className="mt-0.5 text-xs text-sub">
                      {formatPrice(a.property_price)}
                      {a.updated_date ? ` · Updated ${new Date(a.updated_date).toLocaleDateString()}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" loading={openingId === a.id} disabled={isSaving || !!busyId || !!openingId} onClick={() => load(a.id)}>
                      Open
                    </Button>
                    <Button variant="ghost" size="sm" disabled={isSaving || !!busyId} icon={Link2} onClick={() => copyLink(a.id)} title="Copy link">
                      <span className="hidden sm:inline">Link</span>
                    </Button>
                    <Button variant="ghost" size="sm" loading={busyId === a.id} disabled={isSaving || !!busyId} icon={Copy} onClick={() => duplicate(a.id)} title="Duplicate">
                      <span className="hidden sm:inline">Copy</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Pencil}
                      disabled={isSaving || !!busyId}
                      onClick={() => { setRenameVal(a.title || ""); setRenameTarget(a.id); }}
                      title="Rename"
                    >
                      <span className="hidden sm:inline">Rename</span>
                    </Button>
                    <Button variant="danger" size="sm" disabled={isSaving || !!busyId} icon={Trash2} onClick={() => setDeleteTarget(a.id)} title="Delete">
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
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
        loading={busyId === deleteTarget}
        onConfirm={async () => { if (await del(deleteTarget)) setDeleteTarget(null); }}
        onCancel={() => { if (!busyId) setDeleteTarget(null); }}
      />

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRenameTarget(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-ink">Rename analysis</h3>
            <div className="mt-3 flex h-11 items-center rounded-md border border-line bg-white px-3">
              <input
                autoFocus
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doRename()}
                placeholder="Analysis name"
                className="w-full bg-transparent text-sm text-ink outline-none"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" size="md" onClick={() => setRenameTarget(null)}>Cancel</Button>
              <Button variant="primary" size="md" loading={busyId === renameTarget} disabled={!renameVal.trim()} onClick={doRename}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatPrice(p) {
  if (!p) return "—";
  if (p >= 10000000) return "₹" + (p / 10000000).toFixed(1) + " Cr";
  if (p >= 100000) return "₹" + (p / 100000).toFixed(1) + " L";
  return "₹" + p;
}