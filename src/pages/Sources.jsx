import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import { Button, ConfirmDialog } from "@/components/propwise/ui";
import SourceBadge from "@/components/propwise/SourceBadge";
import { useAnalysis } from "@/lib/AnalysisContext";
import {
  ShieldCheck, Plus, ExternalLink, Trash2, X, BookOpen, Info,
} from "lucide-react";

const CATEGORIES = [
  "Interest Rates",
  "Property Values",
  "Rental Market",
  "Taxes & Fees",
  "Economic Assumptions",
  "General References",
];

const STATUS_OPTIONS = ["Official", "Verified", "User Provided", "Reference", "Assumption"];

export default function Sources() {
  const { showToast } = useAnalysis();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Source.list("-updated_date", 100);
      setSources(list || []);
    } catch {
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const grouped = CATEGORIES.map((c) => ({
    category: c,
    items: sources.filter((s) => s.category === c),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen text-ink">
      <PropWiseHeader />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Trusted Sources</h1>
            <p className="mt-1 text-sm text-sub">See where external assumptions and reference data come from.</p>
          </div>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setAdding(true)}>Add Source</Button>
        </div>

        {/* Provenance legend */}
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-4">
          <span className="text-xs font-medium text-sub">How values are labeled:</span>
          <SourceBadge kind="user" />
          <SourceBadge kind="calc" />
          <SourceBadge kind="ext" />
          <SourceBadge kind="assum" />
          <SourceBadge kind="default" />
        </div>

        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-jade" />
          </div>
        ) : sources.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-jadebg text-jade">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-ink">No external data connected.</h3>
            <p className="mt-1.5 max-w-sm text-sm text-sub">
              PropWise never invents sources, URLs or verified statuses. Add a
              reference you trust to track where your assumptions come from.
            </p>
            <Button variant="primary" size="lg" className="mt-5" icon={Plus} onClick={() => setAdding(true)}>
              Add Source
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {grouped.map((g) => (
              <section key={g.category}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-sub">{g.category}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {g.items.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setDetail(s)}
                      className="group flex h-full flex-col rounded-xl border border-line bg-white p-4 text-left transition hover:border-jade/30 hover:shadow-[0_4px_14px_rgba(24,35,58,0.05)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-jadebg text-jade">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-semibold text-ink">{s.name}</span>
                        </div>
                        <SourceBadge kind={statusKind(s.status)} label={s.status} />
                      </div>
                      {s.description && <p className="mt-2 text-sm text-sub line-clamp-2">{s.description}</p>}
                      <div className="mt-3 flex items-center justify-between text-xs text-sub">
                        <span>{s.url ? "Reference available" : "No URL"}</span>
                        <span>{checkedLabel(s)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-10 flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-xs text-sub ring-1 ring-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sub" />
          <span>
            PropWise never fabricates source names, URLs, update dates or
            “verified” statuses. A source is only marked Verified if you confirm
            it after adding it here — the app does not validate external data
            automatically.
          </span>
        </div>
      </main>

      {adding && (
        <AddSource
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); load(); showToast("Source added."); }}
        />
      )}

      {detail && (
        <SourceDetail source={detail} onClose={() => setDetail(null)} onDelete={(id) => { setDetail(null); setDeleteTarget(id); }} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this source?"
        message="This will remove the reference from your Trusted Sources list."
        confirmLabel="Delete"
        danger
        onConfirm={async () => {
          try { await base44.entities.Source.delete(deleteTarget); load(); showToast("Source deleted."); }
          catch { showToast("Could not delete source.", "err"); }
          finally { setDeleteTarget(null); }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function statusKind(status) {
  switch (status) {
    case "Official": return "ext";
    case "Verified": return "ext";
    case "User Provided": return "user";
    case "Assumption": return "assum";
    default: return "calc";
  }
}

function checkedLabel(s) {
  if (s.last_checked) return `Last checked ${new Date(s.last_checked).toLocaleDateString()}`;
  if (s.updated_date) return `Added ${new Date(s.updated_date).toLocaleDateString()}`;
  return "—";
}

const EMPTY = { name: "", category: "Interest Rates", url: "", description: "", data_used: "", notes: "", status: "Reference", last_checked: "" };

function AddSource({ onClose, onSaved }) {
  const { showToast } = useAnalysis();
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) { showToast("Enter a source name.", "warn"); return; }
    setSaving(true);
    try {
      await base44.entities.Source.create({
        ...form,
        last_checked: form.last_checked || new Date().toISOString().slice(0, 10),
      });
      onSaved();
    } catch {
      showToast("Could not save source.", "err");
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Add Source" subtitle="Track a reference behind your assumptions.">
      <div className="space-y-3">
        <Field label="Source name *">
          <Input value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. RBI repo rate bulletin" />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Category *">
            <SelectInput value={form.category} onChange={(v) => set("category", v)} options={CATEGORIES} />
          </Field>
          <Field label="Status">
            <SelectInput value={form.status} onChange={(v) => set("status", v)} options={STATUS_OPTIONS} />
          </Field>
        </div>
        <Field label="Website / Reference URL">
          <Input value={form.url} onChange={(v) => set("url", v)} placeholder="https://…" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={(v) => set("description", v)} placeholder="What this source is." />
        </Field>
        <Field label="Data used">
          <Textarea value={form.data_used} onChange={(v) => set("data_used", v)} placeholder="Which assumption does this inform? e.g. Interest rate" />
        </Field>
        <Field label="Notes">
          <Textarea value={form.notes} onChange={(v) => set("notes", v)} placeholder="Optional notes." />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={saving} onClick={save}>Save Source</Button>
        </div>
      </div>
    </Modal>
  );
}

function SourceDetail({ source, onClose, onDelete }) {
  const s = source;
  return (
    <Modal onClose={onClose} title={s.name} subtitle={s.category} wide>
      <div className="space-y-3">
        <Row label="Status" value={<SourceBadge kind={statusKind(s.status)} label={s.status} />} />
        {s.url && (
          <Row label="Reference" value={
            <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-jade hover:underline">
              Open link <ExternalLink className="h-3.5 w-3.5" />
            </a>
          } />
        )}
        {s.description && <Row label="Description" value={<span className="text-sm text-ink">{s.description}</span>} />}
        {s.data_used && <Row label="Data used" value={<span className="text-sm text-ink">{s.data_used}</span>} />}
        {s.notes && <Row label="Notes" value={<span className="text-sm text-ink">{s.notes}</span>} />}
        <Row label="Last checked" value={<span className="text-sm text-ink">{checkedLabel(s)}</span>} />
        <div className="flex justify-between pt-2">
          <Button variant="danger" size="md" icon={Trash2} onClick={() => onDelete(s.id)}>Delete</Button>
          <Button variant="secondary" size="md" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ---- small local UI helpers (dark-mode aware via tokens) ---- */

function Modal({ children, title, subtitle, wide, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className={`w-full rounded-xl bg-white p-5 shadow-xl ring-1 ring-line ${wide ? "max-w-lg" : "max-w-md"}`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-sub">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-sub hover:bg-appbg" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "h-11 w-full rounded-lg border border-line bg-inputbg px-3 text-sm font-medium text-ink outline-none transition focus:border-jade focus:ring-2 focus:ring-jade/15";
function Input({ value, onChange, placeholder }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />;
}
function Textarea({ value, onChange, placeholder }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className={`${inputCls} h-auto py-2 leading-relaxed`} />;
}
function SelectInput({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-sub">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}