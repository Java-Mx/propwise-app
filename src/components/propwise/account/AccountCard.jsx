import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/propwise/ui";
import { displayName } from "@/lib/AuthContext";
import { Pencil, Mail, Calendar } from "lucide-react";

function initials(name, email) {
  const base = (name || email || "?").trim();
  const parts = base.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 1).toUpperCase();
}

export default function AccountCard({ user, onNameUpdated }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(() => displayName(user) || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const start = () => { setName(displayName(user) || ""); setEditing(true); setError(""); setSuccess(false); };
  const cancel = () => { setEditing(false); setError(""); setName(displayName(user) || ""); };

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter your full name."); return; }
    setSaving(true); setError(""); setSuccess(false);
    try {
      const res = await base44.functions.invoke("manageAccount", { action: "updateName", display_name: trimmed });
      // The browser SDK unwraps axios responses, so `res` is the JSON body directly.
      if (res?.ok) {
        setEditing(false);
        setSuccess(true);
        await onNameUpdated?.();
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(res?.error || "Unable to update your profile. Please retry.");
      }
    } catch (e) {
      setError(e?.data?.error || e?.message || "Unable to update your profile. Please retry.");
    } finally { setSaving(false); }
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-jade text-lg font-semibold text-white">
          {initials(displayName(user), user?.email)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-ink">Account</h2>
          <p className="text-sm text-sub">Your identity and profile details.</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-sub">Full Name</label>
          {editing ? (
            <div className="mt-1.5 flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                className="h-11 flex-1 rounded-lg border border-line bg-inputbg px-3 text-sm font-medium text-ink outline-none focus:border-jade focus:ring-2 focus:ring-jade/15"
              />
              <Button variant="secondary" size="md" onClick={cancel} disabled={saving}>Cancel</Button>
              <Button variant="primary" size="md" loading={saving} onClick={save}>Save</Button>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink">{displayName(user) || "—"}</span>
              <Button variant="ghost" size="sm" icon={Pencil} onClick={start}>Edit</Button>
            </div>
          )}
          {error && <p className="mt-1.5 text-xs text-err" role="alert">{error}</p>}
          {success && <p className="mt-1.5 text-xs text-ok">Profile updated successfully.</p>}
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-sub">Email</label>
          <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-ink">
            <Mail className="h-4 w-4 text-sub" />
            <span className="truncate">{user?.email || "—"}</span>
            <span className="ml-1 rounded-full bg-appbg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sub">Read-only</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-sub">Member since</label>
          <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-ink">
            <Calendar className="h-4 w-4 text-sub" />
            <span>{user?.created_date ? new Date(user.created_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}