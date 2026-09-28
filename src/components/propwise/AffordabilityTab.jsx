import React from "react";
import { Field, NumberInput, PercentInput, Select, Section, ResultCard, Stat, Pill, Divider } from "@/components/propwise/ui";
import { formatINR, formatCompact, formatPct, TENURE_OPTIONS, BURDEN_THRESHOLDS, generateSuggestions } from "@/lib/finance";

export default function AffordabilityTab({ inputs, set, r }) {
  const suggestions = generateSuggestions(inputs, r);

  return (
    <div className="space-y-5">
      {/* Summary dashboard */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <ResultCard label="Property" value={formatCompact(r.price)} />
        <ResultCard label="Your Contribution" value={formatCompact(r.saved)} />
        <ResultCard label="Loan Required" value={formatCompact(r.expectedLoan)} />
        <ResultCard label="Estimated EMI" value={formatCompact(r.emi)} sub="per month" />
        <ResultCard label="Total Monthly Cost" value={formatCompact(r.totalMonthlyCost)} sub="per month" tone="soft" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* INPUTS */}
        <Section title="Property & Loan Inputs" subtitle="Enter your figures — everything recalculates instantly.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Property Price" hint="e.g. ₹3,00,00,000">
              <NumberInput value={inputs.property_price} onChange={(v) => set("property_price", v)} />
            </Field>
            <Field label="Amount Already Saved / Collected" hint="e.g. ₹1,00,00,000">
              <NumberInput value={inputs.amount_saved} onChange={(v) => set("amount_saved", v)} />
            </Field>
            <Field label="Home Loan Percentage" hint="Share of price financed by loan">
              <PercentInput value={inputs.home_loan_percentage} onChange={(v) => set("home_loan_percentage", v)} />
            </Field>
            <Field label="Monthly Income" hint="e.g. ₹5,00,000">
              <NumberInput value={inputs.monthly_income} onChange={(v) => set("monthly_income", v)} />
            </Field>
            <Field label="Existing Monthly EMI / Obligations" hint="Optional">
              <NumberInput value={inputs.existing_emi} onChange={(v) => set("existing_emi", v)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Interest Rate">
                <PercentInput value={inputs.interest_rate} onChange={(v) => set("interest_rate", v)} />
              </Field>
              <Field label="Loan Tenure">
                <Select value={inputs.loan_tenure_years} onChange={(v) => set("loan_tenure_years", v)} options={TENURE_OPTIONS} />
              </Field>
            </div>
          </div>
        </Section>

        {/* AMOUNT REQUIRED */}
        <Section title="Amount Required" subtitle="How the funding breaks down">
          <div className="space-y-3">
            <Row label="Property price" value={formatINR(r.price)} />
            <Row label="Your available money" value={formatINR(r.saved)} />
            <Row label="Expected loan amount" value={formatINR(r.expectedLoan)} sub={`${formatPct(r.loanToValue)} of price`} />
            <Row label="Down payment needed" value={formatINR(r.downPaymentNeeded)} />
            <div className="my-2 h-px bg-slate-100" />
            <Row label="Required funding (price − savings)" value={formatINR(r.requiredFunding)} bold />
            {r.remainingRequired > 0 ? (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Additional funds needed: {formatINR(r.remainingRequired)}
              </div>
            ) : (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Your savings cover the down payment, with {formatINR(r.surplusAfterDownPayment)} remaining.
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* EMI + MONTHLY COST */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title="Estimated Monthly EMI" subtitle="Reducing-balance loan calculation">
          <div className="mb-4 rounded-xl bg-slate-900 p-5 text-white">
            <div className="text-xs uppercase tracking-wide text-slate-300">Estimated Monthly EMI</div>
            <div className="mt-1 text-3xl font-semibold">{formatINR(r.emi)}</div>
            <div className="mt-2 text-xs text-slate-300">
              {formatINR(r.expectedLoan)} loan · {r.interest_rate || inputs.interest_rate}% p.a. · {inputs.loan_tenure_years} years
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Principal" value={formatCompact(r.expectedLoan)} />
            <Stat label="Total Interest" value={formatCompact(r.totalInterest)} />
            <Stat label="Total Repayment" value={formatCompact(r.totalRepayment)} />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Adjust interest rate, tenure or home-loan percentage above to update instantly.
          </p>
        </Section>

        <Section title="Monthly Property Cost" subtitle="What you pay each month to hold the property">
          <div className="space-y-3">
            <Row label="EMI" value={formatINR(r.emi)} />
            <Row label="Maintenance" value={formatINR(r.monthlyMaintenance)} />
            <Row label="Other monthly costs" value={formatINR(r.otherMonthly)} />
            <div className="my-2 h-px bg-slate-100" />
            <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
              <span className="text-sm font-medium">Total Monthly Cost</span>
              <span className="text-xl font-semibold">{formatINR(r.totalMonthlyCost)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Detailed cost breakdown is in the Property Costs tab.
          </p>
        </Section>
      </div>

      {/* INCOME BURDEN */}
      <Section title="Income Burden" subtitle="Monthly property cost as a share of income">
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-3xl font-semibold text-slate-800">{formatPct(r.incomeBurden)}</div>
          <Pill color={r.level.color}>{r.level.label}</Pill>
          <div className="ml-auto text-sm text-slate-500">
            {formatINR(r.totalMonthlyCost)} of {formatINR(r.monthlyIncome || inputs.monthly_income)}
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(r.incomeBurden, 100)}%`,
              backgroundColor: { low: "#10b981", moderate: "#f59e0b", high: "#f97316", very_high: "#f43f5e" }[r.level.key],
            }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 sm:grid-cols-4">
          <span>Lower &lt; {BURDEN_THRESHOLDS.low}%</span>
          <span>Moderate &lt; {BURDEN_THRESHOLDS.moderate}%</span>
          <span>High &lt; {BURDEN_THRESHOLDS.high}%</span>
          <span>Very high ≥ {BURDEN_THRESHOLDS.high}%</span>
        </div>
        {inputs.existing_emi > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            Including existing EMIs, total commitment is {formatPct(r.totalBurdenWithExisting)} of income.
          </p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Thresholds are indicative and configurable — not universal financial rules.
        </p>
      </Section>

      {/* PAYOFF TIMELINE */}
      <Section title="How Long Will It Take?" subtitle="Estimated loan payoff">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-slate-400">Estimated Loan Payoff</div>
            <div className="text-2xl font-semibold text-slate-800">{inputs.loan_tenure_years} years</div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>Total principal: {formatCompact(r.expectedLoan)}</div>
            <div>Total interest: {formatCompact(r.totalInterest)}</div>
            <div>Total repayment: {formatCompact(r.totalRepayment)}</div>
          </div>
        </div>
        <Timeline years={inputs.loan_tenure_years} />
      </Section>

      {/* FUTURE VALUE */}
      <FutureValueSection inputs={inputs} set={set} r={r} />

      {/* SUGGESTION BOX */}
      <Section title="What does this mean?" subtitle="A transparent, rule-based summary of your inputs">
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              {s}
            </li>
          ))}
        </ul>
      </Section>

      {/* PURCHASE DECISION */}
      <PurchaseDecision inputs={inputs} r={r} />
    </div>
  );
}

function Row({ label, value, sub, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-semibold text-slate-800" : "text-slate-500"}`}>{label}</span>
      <div className="text-right">
        <div className={`text-sm ${bold ? "font-semibold text-slate-800" : "font-medium text-slate-700"}`}>{value}</div>
        {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

function Timeline({ years }) {
  const marks = [1, 5, 10, 15, 20, 25, 30].filter((m) => m <= years);
  return (
    <div className="mt-5">
      <div className="relative h-1.5 w-full rounded-full bg-slate-100">
        <div className="absolute inset-y-0 left-0 rounded-full bg-slate-800" style={{ width: "100%" }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        {marks.map((m) => (
          <span key={m} className={m === years ? "font-semibold text-slate-700" : ""}>
            Year {m}{m === years && " · Paid"}
          </span>
        ))}
      </div>
    </div>
  );
}

function FutureValueSection({ inputs, set, r }) {
  const options = [5, 10, 15, 20];
  return (
    <Section title="Future Property Value" subtitle="Based on your assumed appreciation rate">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Annual Appreciation">
          <PercentInput value={inputs.annual_appreciation} onChange={(v) => set("annual_appreciation", v)} />
        </Field>
        <Field label="View horizon">
          <Select value={inputs.projection_years} onChange={(v) => set("projection_years", v)} options={options} />
        </Field>
        <div className="flex items-end">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
            Current value: <span className="font-semibold text-slate-800">{formatCompact(r.price)}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((y) => (
          <div key={y} className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="text-xs text-slate-400">After {y} years</div>
            <div className="mt-1 text-lg font-semibold text-slate-800">{formatCompact(r.fv(y))}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Estimated property value — based on your assumed appreciation rate. Actual market prices may differ.
      </p>
    </Section>
  );
}

function PurchaseDecision({ inputs, r }) {
  return (
    <Section title="Purchase Decision" subtitle="An indicative assessment — not a recommendation">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-500">Financial commitment:</span>
        <Pill color={r.level.color}>{r.level.label}</Pill>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Monthly property cost" value={formatCompact(r.totalMonthlyCost)} />
        <Stat label="Property cost / income" value={formatPct(r.incomeBurden)} />
        <Stat label="Available savings" value={formatCompact(r.saved)} />
        <Stat label="Loan amount" value={formatCompact(r.expectedLoan)} />
        <Stat label="Loan-to-property ratio" value={formatPct(r.loanToValue)} />
        <Stat label="Total interest" value={formatCompact(r.totalInterest)} />
        <Stat label="Existing obligations" value={formatCompact(inputs.existing_emi)} sub="per month" />
        <Stat label="Value after 10 years" value={formatCompact(r.fv(10))} sub="assumed" />
      </div>
      <Divider label="Before deciding" />
      <ul className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
        {[
          "Check emergency savings beyond the down payment.",
          "Consider existing financial obligations.",
          "Verify actual loan terms with your lender.",
          "Consider taxes, registration and transaction costs.",
          "Validate the property's market value independently.",
          "Consider whether assumed appreciation and rental income are realistic.",
        ].map((t, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-400">
        PropWise does not claim certainty and is not a regulated financial advisor.
      </p>
    </Section>
  );
}