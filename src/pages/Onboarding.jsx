import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/lib/AnalysisContext";
import Logo from "@/components/propwise/Logo";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";

const STEPS = ["Basic Information", "Property Details", "Financial Details", "Analysis"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INPUT_CLS =
  "h-12 w-full rounded-xl border border-line bg-inputbg px-3.5 text-sm font-medium text-ink outline-none transition placeholder:text-sub/50 focus:border-jade focus:ring-2 focus:ring-jade/15";

export default function Onboarding() {
  const navigate = useNavigate();
  const analysis = useAnalysis();
  const [form, setForm] = useState({ reportName: "", fullName: "", email: "", location: "" });
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const errors = {
    reportName: form.reportName.trim() ? "" : "Please enter a report name.",
    fullName: form.fullName.trim() ? "" : "Please enter your name.",
    email: !form.email.trim() || !EMAIL_RE.test(form.email.trim()) ? "Please enter a valid email address." : "",
  };
  const isValid = !errors.reportName && !errors.fullName && !errors.email;

  const setField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setTouched((p) => ({ ...p, [k]: true }));
    setSubmitError(null);
  };

  const submit = (e) => {
    if (e) e.preventDefault();
    setTouched({ reportName: true, fullName: true, email: true });
    if (!isValid) return;
    try {
      setSubmitError(null);
      analysis.startAnalysis({
        reportName: form.reportName.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        location: form.location.trim(),
      });
    } catch (err) {
      console.error("[PropWise] startAnalysis failed", err);
      setSubmitError("Unable to start this analysis. Please try again.");
    }
  };

  const back = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <div className="min-h-screen text-ink">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 md:py-12">
        <div className="flex items-center justify-between">
          <button
            onClick={back}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg text-sm font-medium text-sub transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Logo size={48} />
        </div>

        <div className="mx-auto mt-8 w-full max-w-[560px] md:mt-12">
          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <span className="text-jade">Step 1 of 4</span>
            <span className="text-sub/70">·</span>
            <span className="hidden text-sub sm:inline">{STEPS.join("  ·  ")}</span>
            <span className="text-sub sm:hidden">Basic Information</span>
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-ink md:text-[28px]">
            Let's set up your property analysis
          </h1>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-sub">
            Tell us a few basic details before we begin. You can change these later.
          </p>

          <form
            onSubmit={submit}
            className="mt-7 rounded-[24px] border border-line bg-white p-5 shadow-[0_8px_30px_rgba(24,35,58,0.06)] md:p-10"
          >
            <div className="space-y-4">
              <Field label="Report Name" error={touched.reportName && errors.reportName}>
                <input
                  type="text"
                  value={form.reportName}
                  onChange={(e) => setField("reportName", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, reportName: true }))}
                  placeholder="e.g. Pune Apartment Analysis"
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="Your Name" error={touched.fullName && errors.fullName}>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                  placeholder="Enter your name"
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="Email Address" error={touched.email && errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  placeholder="you@example.com"
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="Property / Location (Optional)">
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  placeholder="e.g. Wakad, Pune"
                  className={INPUT_CLS}
                />
              </Field>
            </div>

            {submitError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-err/20 bg-[#FBECEC] px-3 py-2.5 text-sm text-err">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="mt-7 flex justify-end">
              <button
                type="submit"
                disabled={!isValid}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-jade px-6 text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(47,143,131,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(47,143,131,0.24)] active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
              >
                Continue to Property Analysis
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-sub">
            Your details stay with this analysis. We won't send emails or share your information.
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium text-err">{error}</p>}
    </div>
  );
}