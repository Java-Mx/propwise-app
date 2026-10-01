import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/propwise/ui";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

const PW_MIN = 8;

export default function SecurityCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const requirements = [
    { ok: next.length >= PW_MIN, label: `At least ${PW_MIN} characters` },
    { ok: next.length > 0 && next !== current, label: "Different from current password" },
    { ok: next.length > 0 && next === confirm, label: "Passwords match" },
  ];

  const reset = () => { setCurrent(""); setNext(""); setConfirm(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (!current || !next || !confirm) { setError("Please fill in all password fields."); return; }
    if (next.length < PW_MIN) { setError(`New password must be at least ${PW_MIN} characters.`); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next === current) { setError("Choose a new password that differs from your current one."); return; }
    setSaving(true);
    try {
      const res = await base44.functions.invoke("manageAccount", { action: "changePassword", currentPassword: current, newPassword: next });
      if (res?.data?.ok) { reset(); setSuccess(true); setTimeout(() => setSuccess(false), 5000); }
      else setError(res?.data?.error || "Unable to change password. Please retry.");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Unable to change password. Please retry.");
    } finally { setSaving(false); }
  };

  const inputCls = "h-11 w-full rounded-lg border border-line bg-inputbg pl-10 pr-3 text-sm font-medium text-ink outline-none focus:border-jade focus:ring-2 focus:ring-jade/15";

  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-jadebg text-jade"><ShieldCheck className="h-5 w-5" /></div>
        <div>
          <h2 className="text-base font-semibold text-ink">Security</h2>
          <p className="text-sm text-sub">Change your password. Use a strong, unique password.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink">Current Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sub" />
            <input type={show ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" className={inputCls} placeholder="••••••••" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">New Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sub" />
            <input type={show ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" className={inputCls} placeholder="••••••••" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Confirm New Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sub" />
            <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputCls} placeholder="••••••••" />
          </div>
          <button type="button" onClick={() => setShow(s => !s)} className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-jade hover:underline">
            {show ? <><EyeOff className="h-3.5 w-3.5" /> Hide passwords</> : <><Eye className="h-3.5 w-3.5" /> Show passwords</>}
          </button>
        </div>

        <ul className="space-y-1">
          {requirements.map((r) => (
            <li key={r.label} className={"flex items-center gap-1.5 text-xs " + (r.ok ? "text-ok" : "text-sub")}>
              <span className={"h-1.5 w-1.5 rounded-full " + (r.ok ? "bg-ok" : "bg-line")} />
              {r.label}
            </li>
          ))}
        </ul>

        {error && <p className="text-xs text-err" role="alert">{error}</p>}
        {success && <p className="text-xs text-ok">Password changed successfully.</p>}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" loading={saving} disabled={!current || !next || !confirm}>Change password</Button>
        </div>
      </form>
    </section>
  );
}