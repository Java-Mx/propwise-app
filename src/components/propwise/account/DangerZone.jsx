import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/propwise/ui";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const close = () => { setOpen(false); setConfirm(""); setError(""); };

  const doDelete = async () => {
    setError(""); setDeleting(true);
    try {
      const res = await base44.functions.invoke("manageAccount", { action: "deleteAccount", confirm });
      // The browser SDK unwraps axios responses, so `res` is the JSON body directly.
      if (res?.ok) {
        // Account + user data deleted server-side. End the session and return
        // to the public landing page.
        await base44.auth.logout("/");
      } else {
        setError(res?.error || "Unable to delete your account. Please retry.");
        setDeleting(false);
      }
    } catch (e) {
      setError(e?.data?.error || e?.message || "Unable to delete your account. Please retry.");
      setDeleting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-err/30 bg-white p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBECEC] text-err"><AlertTriangle className="h-5 w-5" /></div>
        <div>
          <h2 className="text-base font-semibold text-err">Danger Zone</h2>
          <p className="text-sm text-sub">Permanently delete your account and all associated analyses. This cannot be undone.</p>
        </div>
      </div>
      <div className="mt-4">
        <Button variant="danger" size="md" icon={Trash2} onClick={() => setOpen(true)}>Delete account</Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !deleting && close()}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-ink">Delete your PropWise account?</h3>
            <p className="mt-2 text-sm text-sub">
              This permanently deletes your account and associated user data, including saved analyses. This action cannot be undone.
            </p>
            <div className="mt-4">
              <label className="text-sm font-medium text-ink">
                Type <span className="font-semibold text-err">DELETE</span> to confirm
              </label>
              <input
                autoFocus
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="DELETE"
                className="mt-1.5 h-11 w-full rounded-lg border border-line bg-inputbg px-3 text-sm font-medium text-ink outline-none focus:border-err focus:ring-2 focus:ring-err/20"
              />
            </div>
            {error && <p className="mt-3 text-sm text-err" role="alert">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" size="md" onClick={close} disabled={deleting}>Cancel</Button>
              <Button variant="danger" size="md" loading={deleting} disabled={confirm !== "DELETE"} onClick={doDelete}>
                Delete account
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}