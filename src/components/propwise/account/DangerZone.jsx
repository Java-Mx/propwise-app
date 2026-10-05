import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/propwise/ui";
import { AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";

export default function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");

  const close = () => { setOpen(false); setConfirm(""); setError(""); };

  const doDelete = async () => {
    setError(""); setDeleting(true);
    try {
      // The functions client does not unwrap responses, so `res` is the full
      // axios response and the JSON body lives at `res.data`.
      const res = await base44.functions.invoke("manageAccount", { action: "deleteAccount", confirm });
      if (res?.data?.ok) {
        // Account + user data deleted server-side. The session is now invalid,
        // so the SDK's logout() would redirect to the server logout endpoint
        // which 401s (the user no longer exists). Drop the local token ourselves
        // and return to the public landing page.
        setDeleted(true);
        try {
          window.localStorage.removeItem("base44_access_token");
          window.localStorage.removeItem("token");
        } catch (_) { /* ignore storage errors */ }
        setTimeout(() => { window.location.href = "/"; }, 1400);
      } else {
        setError(res?.data?.error || "Unable to delete your account. Please retry.");
        setDeleting(false);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Unable to delete your account. Please retry.");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !deleting && !deleted && close()}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {deleted ? (
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jadebg text-jade"><CheckCircle2 className="h-6 w-6" /></div>
                <h3 className="mt-3 text-lg font-semibold text-ink">Account deleted</h3>
                <p className="mt-1.5 text-sm text-sub">Your PropWise account and associated data have been permanently removed. Redirecting you home…</p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}