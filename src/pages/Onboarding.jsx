import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "@/lib/AnalysisContext";
import { cn } from "@/lib/utils";
import Logo from "@/components/propwise/Logo";
import { NumberInput, PercentInput, Select, ChoiceInput } from "@/components/propwise/ui";
import { ArrowLeft, ArrowRight, AlertCircle, Check, Pencil } from "lucide-react";
import {
  num, PROPERTY_TYPES, TENURE_OPTIONS, INTEREST_OPTIONS, LOAN_PCT_OPTIONS,
  formatINR, formatCompact,
} from "@/lib/finance";

const STEPS = [
  { key: "basic", label: "BASIC INFORMATION" },
  { key: "property", label: "PROPERTY DETAILS" },
  { key: "financial", label: "FINANCIAL DETAILS" },
  { key: "analysis", label: "ANALYSIS" },
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INPUT_CLS =
  "h-12 w-full rounded-xl border border-line bg-inputbg px-3.5 text-sm font-medium text-ink outline-none transition placeholder:text-sub/50 focus:border-jade focus:ring-2 focus:ring-jade/15";

export default function Onboarding() {
  const navigate = useNavigate();
  const analysis = useAnalysis();
  const [step, setStep] = useState(1);
  const [reached, setReached] = useState(1);
  const [form, setForm] = useState({
    reportName: "", fullName: "", email: "", location: "",
    property_type: "Apartment", property_price: "",
    monthly_income: "", existing_emi: "", amount_saved: "",
    home_loan_percentage: "", interest_rate: "", loan_tenure_years: "",
  });
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setTouched((p) => ({ ...p, [k]: true }));
    setSubmitError(null);
  };

  const errs = {
    reportName: form.reportName.trim() ? "" : "Please enter a report name.",
    fullName: form.fullName.trim() ? "" : "Please enter your name.",
    email: !form.email.trim() || !EMAIL_RE.test(form.email.trim()) ? "Please enter a valid email address." : "",
    property_price: num(form.property_price) > 0 ? "" : "Enter the property price.",
    monthly_income: num(form.monthly_income) > 0 ? "" : "Enter your monthly income.",
    home_loan_percentage:
      num(form.home_loan_percentage) > 0 && num(form.home_loan_percentage) <= 95 ? "" : "Enter a loan percentage (1–95).",
    interest_rate: num(form.interest_rate) > 0 ? "" : "Enter the interest rate.",
    loan_tenure_years: num(form.loan_tenure_years) > 0 ? "" : "Select the loan tenure.",
  };

  const stepValid = (s) => {
    if (s === 1) return !errs.reportName && !errs.fullName && !errs.email;
    if (s === 2) return !errs.property_price;
    if (s === 3)
      return !errs.monthly_income && !errs.home_loan_percentage && !errs.interest_rate && !errs.loan_tenure_years;
    return true;
  };
  const allValid = stepValid(1) && stepValid(2) && stepValid(3);

  const touchStep = (s) => {
    if (s === 1) setTouched((p) => ({ ...p, reportName: true, fullName: true, email: true }));
    if (s === 2) setTouched((p) => ({ ...p, property_price: true }));
    if (s === 3) setTouched((p) => ({ ...p, monthly_income: true, home_loan_percentage: true, interest_rate: true, loan_tenure_years: true }));
  };

  const goNext = () => {
    if (!stepValid(step)) { touchStep(step); return; }
    const n = Math.min(4, step + 1);
    setStep(n);
    setReached((r) => Math.max(r, n));
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));
  const goTo = (n) => { if (n <= reached) setStep(n); };

  const finish = () => {
    if (!allValid) {
      touchStep(1); touchStep(2); touchStep(3);
      setStep(1);
      setSubmitError("Please complete all required details before viewing the report.");
      return;
    }
    try {
      setSubmitError(null);
      analysis.startAnalysis({
        title: form.reportName.trim(),
        owner_name: form.fullName.trim(),
        owner_email: form.email.trim(),
        property_location: form.location.trim(),
        property_type: form.property_type,
        property_price: num(form.property_price),
        amount_saved: num(form.amount_saved),
        monthly_income: num(form.monthly_income),
        existing_emi: num(form.existing_emi),
        home_loan_percentage: num(form.home_loan_percentage),
        interest_rate: num(form.interest_rate),
        loan_tenure_years: num(form.loan_tenure_years),
      });
    } catch (err) {
      console.error("[PropWise] startAnalysis failed", err);
      setSubmitError("Unable to start this analysis. Please try again.");
    }
  };

  const back = () => { if (window.history.length > 1) navigate(-1); else navigate("/"); };

  return (
    <div className="min-h-screen text-ink">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 md:py-12">
        <div className="flex items-center justify-between">
          <button onClick={back} className="inline-flex h-9 items-center gap-1.5 rounded-lg text-sm font-medium text-sub transition hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Logo size={48} />
        </div>

        <div className="mx-auto mt-8 w-full max-w-[560px] md:mt-12">
          {/* Step indicator — functional, current step highlighted, completed steps revisitable */}
          <div className="mb-6 flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <div className="flex items-center gap-2">
              <span className="text-jade">Step {step} of 4</span>
              <span className="text-sub/70">·</span>
              <span className="text-sub sm:hidden">{STEPS[step - 1].label}</span>
              <span className="hidden sm:inline">
                {STEPS.map((s, i) => {
                  const n = i + 1;
                  const isCurrent = n === step;
                  const reachable = n <= reached;
                  return (
                    <React.Fragment key={s.key}>
                      <button
                        type="button"
                        onClick={() => goTo(n)}
                        disabled={!reachable}
                        className={cn(
                          "transition",
                          isCurrent ? "text-jade" : "text-sub",
                          reachable ? "cursor-pointer hover:text-ink" : "cursor-not-allowed"
                        )}
                      >
                        {s.label}
                      </button>
                      {i < STEPS.length - 1 && <span className="text-sub/70"> · </span>}
                    </React.Fragment>
                  );
                })}
              </span>
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-ink md:text-[28px]">
            {step === 4 ? "Review your analysis" : "Let's set up your property analysis"}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-sub">
            {step === 1 && "Tell us a few basic details. You can change these later."}
            {step === 2 && "Enter the property you're analysing."}
            {step === 3 && "Enter your income and loan assumptions."}
            {step === 4 && "Confirm the details below to generate your full report."}
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); if (step < 4) goNext(); else finish(); }}
            className="mt-7 rounded-[24px] border border-line bg-white p-5 shadow-[0_8px_30px_rgba(24,35,58,0.06)] md:p-10"
          >
            {step === 1 && (
              <div className="space-y-4">
                <Field label="Report Name" error={touched.reportName && errs.reportName}>
                  <input type="text" value={form.reportName} onChange={(e) => set("reportName", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, reportName: true }))}
                    placeholder="e.g. Pune Apartment Analysis" className={INPUT_CLS} />
                </Field>
                <Field label="Your Name" error={touched.fullName && errs.fullName}>
                  <input type="text" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                    placeholder="Enter your name" className={INPUT_CLS} />
                </Field>
                <Field label="Email Address" error={touched.email && errs.email}>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    placeholder="you@example.com" className={INPUT_CLS} />
                </Field>
                <Field label="Property / Location (Optional)">
                  <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)}
                    placeholder="e.g. Wakad, Pune" className={INPUT_CLS} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Field label="Property Type">
                  <Select value={form.property_type} onChange={(v) => set("property_type", v)} options={PROPERTY_TYPES} />
                </Field>
                <Field label="Property Price" error={touched.property_price && errs.property_price}>
                  <NumberInput value={form.property_price} onChange={(v) => set("property_price", v)} prefix="₹" />
                </Field>
                <p className="text-xs text-sub">This is the price you're considering paying for the property.</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Field label="Monthly Income" error={touched.monthly_income && errs.monthly_income}>
                  <NumberInput value={form.monthly_income} onChange={(v) => set("monthly_income", v)} prefix="₹" />
                </Field>
                <Field label="Existing Monthly EMI (Optional)" hint="Any loan EMIs you already pay.">
                  <NumberInput value={form.existing_emi} onChange={(v) => set("existing_emi", v)} prefix="₹" />
                </Field>
                <Field label="Amount Saved (Down Payment)" hint="Savings available to put down now.">
                  <NumberInput value={form.amount_saved} onChange={(v) => set("amount_saved", v)} prefix="₹" />
                </Field>
                <Field label="Home Loan Percentage" error={touched.home_loan_percentage && errs.home_loan_percentage}>
                  <ChoiceInput value={form.home_loan_percentage} onChange={(v) => set("home_loan_percentage", v)} options={LOAN_PCT_OPTIONS} />
                </Field>
                <Field label="Interest Rate (% per year)" error={touched.interest_rate && errs.interest_rate}>
                  <ChoiceInput value={form.interest_rate} onChange={(v) => set("interest_rate", v)} options={INTEREST_OPTIONS} />
                </Field>
                <Field label="Loan Tenure" error={touched.loan_tenure_years && errs.loan_tenure_years}>
                  <Select value={form.loan_tenure_years} onChange={(v) => set("loan_tenure_years", v)} options={TENURE_OPTIONS} placeholder="Select tenure" />
                </Field>
              </div>
            )}

            {step === 4 && <Review form={form} onEdit={goTo} allValid={allValid} />}

            {submitError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-err/20 bg-[#FBECEC] px-3 py-2.5 text-sm text-err">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="mt-7 flex items-center gap-3">
              {step > 1 && (
                <button type="button" onClick={goBack}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-[15px] font-semibold text-ink transition hover:bg-appbg sm:w-auto">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              )}
              {step < 4 ? (
                <button type="submit"
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-jade px-6 text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(47,143,131,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(47,143,131,0.24)] active:translate-y-0 sm:flex-none">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="submit" disabled={!allValid}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-jade px-6 text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(47,143,131,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(47,143,131,0.24)] active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:flex-none">
                  <Check className="h-4 w-4" /> Continue to full report
                </button>
              )}
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

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-err">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-sub">{hint}</p>
      ) : null}
    </div>
  );
}

function Review({ form, onEdit, allValid }) {
  const rows = [
    { step: 1, label: "Report Name", value: form.reportName || "—" },
    { step: 1, label: "Owner", value: form.fullName || "—" },
    { step: 1, label: "Email", value: form.email || "—" },
    { step: 1, label: "Location", value: form.location || "—" },
    { step: 2, label: "Property Type", value: form.property_type },
    { step: 2, label: "Property Price", value: form.property_price ? formatINR(num(form.property_price)) : "—" },
    { step: 3, label: "Monthly Income", value: form.monthly_income ? formatINR(num(form.monthly_income)) : "—" },
    { step: 3, label: "Savings", value: num(form.amount_saved) ? formatCompact(num(form.amount_saved)) : "—" },
    { step: 3, label: "Existing EMI", value: num(form.existing_emi) ? formatINR(num(form.existing_emi)) : "—" },
    { step: 3, label: "Loan %", value: num(form.home_loan_percentage) ? `${num(form.home_loan_percentage)}%` : "—" },
    { step: 3, label: "Interest Rate", value: num(form.interest_rate) ? `${num(form.interest_rate)}%` : "—" },
    { step: 3, label: "Tenure", value: num(form.loan_tenure_years) ? `${num(form.loan_tenure_years)} years` : "—" },
  ];
  return (
    <div className="space-y-4">
      <div className="divide-y divide-line rounded-xl border border-line">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm text-sub">{r.label}</span>
            <span className="text-right text-sm font-semibold text-ink">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {[1, 2, 3].map((s) => (
          <button key={s} type="button" onClick={() => onEdit(s)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-appbg">
            <Pencil className="h-3 w-3" /> Edit {STEPS[s - 1].label}
          </button>
        ))}
      </div>
      {!allValid && (
        <p className="text-xs text-err">Some required details are missing. Use the edit buttons above to complete them.</p>
      )}
    </div>
  );
}