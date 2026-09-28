import React, { useState } from "react";
import { Field, NumberInput, PercentInput, Select, ChoiceInput, Section, ResultCard, Stat, Pill, Divider, Alert, Button } from "@/components/propwise/ui";
import {
  formatINR, formatCompact, formatPct, num,
  TENURE_OPTIONS, INTEREST_OPTIONS, LOAN_PCT_OPTIONS, APPRECIATION_OPTIONS, PROJECTION_OPTIONS, PROPERTY_TYPES,
  BURDEN_THRESHOLDS, generateSuggestions,
} from "@/lib/finance";
import { ChevronDown, Info, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AffordabilityTab({ inputs, set, r }) {
  const [showAmortization, setShowAmortization] = useState(false);
  const suggestions = generateSuggestions(inputs, r);
  const has = r.hasInputs;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      {has && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <ResultCard label="Property Price" value={formatCompact(r.price)} />
          <ResultCard label="Your Contribution" value={formatCompact(r.saved)} />
          <ResultCard label="Loan Required" value={formatCompact(r.actualLoan)} />
          <ResultCard label="Estimated EMI" value={formatCompact(r.emi)} sub="per month" />
          <ResultCard label="Total Monthly Cost" value={formatCompact(r.totalMonthlyCost)} sub="per month" emphasis />
        </div>
      )}

      {/* Inputs */}
      <Section id="aff-inputs" title="Property & Loan Details" subtitle="Enter your property and loan details.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Property Price">
            <NumberInput value={inputs.property_price} onChange={(v) => set("property_price", v)} />
          </Field>
          <Field label="Available Savings">
            <NumberInput value={inputs.amount_saved} onChange={(v) => set("amount_saved", v)} />
          </Field>
          <Field label="Property Type">
            <Select value={inputs.property_type} onChange={(v) => set("property_type", v)} options={PROPERTY_TYPES} placeholder="Select type" renderOption={(o) => o} />
          </Field>
          <Field label="Home Loan Percentage">
            <ChoiceInput value={inputs.home_loan_percentage} onChange={(v) => set("home_loan_percentage", v)} options={LOAN_PCT_OPTIONS} placeholder="Select" />
          </Field>
          <Field label="Monthly Income">
            <NumberInput value={inputs.monthly_income} onChange={(v) => set("monthly_income", v)} />
          </Field>
          <Field label="Existing Monthly EMI" hint="Optional">
            <NumberInput value={inputs.existing_emi} onChange={(v) => set("existing_emi", v)} />
          </Field>
          <Field label="Interest Rate">
            <ChoiceInput value={inputs.interest_rate} onChange={(v) => set("interest_rate", v)} options={INTEREST_OPTIONS} placeholder="Select" />
          </Field>
          <Field label="Loan Tenure">
            <Select value={inputs.loan_tenure_years} onChange={(v) => set("loan_tenure_years", v)} options={TENURE_OPTIONS} placeholder="Select" />
          </Field>
        </div>
        {!has && (
          <div className="mt-4">
            <Alert tone="info">Enter a property price to see your affordability analysis.</Alert>
          </div>
        )}
      </Section>

      {!has ? null : (
        <>
          {/* Validation alerts */}
          {r.savingsExceedsPrice && (
            <Alert tone="warn">Your available savings exceed the property price.</Alert>
          )}
          {r.fundingGap > 0 && (
            <Alert tone="warn">
              Your available savings and selected loan percentage do not cover the full property price.
              Additional amount required: <strong>{formatINR(r.fundingGap)}</strong>.
            </Alert>
          )}

          {/* Funding breakdown */}
          <Section id="aff-funding" title="Funding Breakdown" subtitle="How the purchase is funded.">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 lg:grid-cols-2">
              <FundingRow label="Property price" value={formatINR(r.price)} />
              <FundingRow label="Available savings" value={formatINR(r.saved)} />
              <FundingRow label="Maximum eligible loan" value={formatINR(r.maxLoanEligibility)} sub={`${formatPct(r.loanPct)} of price`} />
              <FundingRow label="Required funding" value={formatINR(r.requiredFunding)} sub="price − savings" />
              <FundingRow label="Actual loan required" value={formatINR(r.actualLoan)} bold />
              <FundingRow label="Down payment" value={formatINR(r.downPayment)} sub="price − loan" />
              {r.surplusSavings > 0
                ? <FundingRow label="Savings after down payment" value={formatINR(r.surplusSavings)} tone="ok" />
                : <FundingRow label="Funding gap" value={formatINR(r.fundingGap)} tone={r.fundingGap > 0 ? "err" : undefined} />}
            </div>
            <Divider />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Stat label="Maximum purchase capacity" value={formatCompact(r.maxPurchaseCapacity)} sub="savings + max loan" />
              {r.canCover
                ? <Pill color="#2F8F6B">Within capacity</Pill>
                : <Pill color="#B95C5C">Exceeds capacity</Pill>}
            </div>
          </Section>

          {/* Monthly cost + burden */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Section id="aff-monthly" title="Monthly Cost" subtitle="Your monthly commitment to the property.">
              <CostRow label="Estimated EMI" value={formatINR(r.emi)} />
              <CostRow label="Maintenance & other recurring" value={formatINR(r.recurringMonthly)} />
              <CostRow label="Existing EMI obligations" value={formatINR(r.existingEmi)} />
              <Divider />
              <div className="flex items-center justify-between rounded-lg bg-brand px-4 py-3 text-white">
                <span className="text-sm font-medium">Total Monthly Commitment</span>
                <span className="text-lg font-semibold">{formatINR(r.totalMonthlyCommitment)}</span>
              </div>
            </Section>

            <Section title="Income Burden" subtitle="Property cost as a share of income.">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-ink">{formatPct(r.incomeBurden)}</span>
                <Pill color={r.level.color}>{r.level.label}</Pill>
              </div>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-appbg">
                <div className="h-full rounded-full" style={{ width: `${Math.min(r.incomeBurden, 100)}%`, backgroundColor: r.level.color }} />
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1 text-[11px] text-sub">
                <span>{"<"}{BURDEN_THRESHOLDS.low}% Lower</span>
                <span>{"<"}{BURDEN_THRESHOLDS.moderate}% Moderate</span>
                <span>{"<"}{BURDEN_THRESHOLDS.high}% High</span>
                <span>&ge;{BURDEN_THRESHOLDS.high}% Very High</span>
              </div>
              <p className="mt-3 text-xs text-sub">Thresholds are indicative, not universal rules.</p>
            </Section>
          </div>

          {/* Loan payoff */}
          <Section id="aff-loanpayoff" title="Loan Payoff" subtitle="Total cost over the loan term." right={
            r.tenure > 0 ? (
              <Button variant="secondary" size="sm" icon={ChevronDown} onClick={() => setShowAmortization((v) => !v)}>
                {showAmortization ? "Hide" : "View"} Amortization
              </Button>
            ) : null
          }>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Loan tenure" value={`${r.tenure || 0} years`} />
              <Stat label="Total principal" value={formatCompact(r.actualLoan)} />
              <Stat label="Total interest" value={formatCompact(r.totalInterest)} />
              <Stat label="Total repayment" value={formatCompact(r.totalRepayment)} />
            </div>
            <Timeline years={r.tenure} />
            {showAmortization && r.tenure > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-sub">
                      <th className="py-2 pr-4 font-medium">Year</th>
                      <th className="py-2 pr-4 font-medium">Principal Paid</th>
                      <th className="py-2 pr-4 font-medium">Interest Paid</th>
                      <th className="py-2 font-medium">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.amortization.map((a) => (
                      <tr key={a.year} className="border-b border-line/50">
                        <td className="py-2 pr-4 font-medium text-ink">{a.year}</td>
                        <td className="py-2 pr-4 text-ink">{formatCompact(a.principalPaid)}</td>
                        <td className="py-2 pr-4 text-ink">{formatCompact(a.interestPaid)}</td>
                        <td className="py-2 text-ink">{formatCompact(a.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Future value */}
          <Section id="aff-future" title="Estimated Future Property Value" subtitle="Based on your selected appreciation assumption.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Projection Period">
                <ChoiceInput value={inputs.projection_years} onChange={(v) => set("projection_years", v)} options={PROJECTION_OPTIONS} suffix=" yrs" placeholder="Select" renderOption={(o) => `${o} years`} />
              </Field>
              <Field label="Annual Appreciation">
                <ChoiceInput value={inputs.annual_appreciation} onChange={(v) => set("annual_appreciation", v)} options={APPRECIATION_OPTIONS} placeholder="Select" />
              </Field>
              <div className="flex items-end">
                <div className="w-full rounded-lg bg-appbg px-3 py-2.5">
                  <div className="text-xs text-sub">Current Value</div>
                  <div className="text-sm font-semibold text-ink">{formatCompact(r.price)}</div>
                </div>
              </div>
            </div>
            <FutureValueChart r={r} years={Math.max(num(inputs.projection_years) || 0, r.tenure || 0, 5)} />
            <p className="mt-3 text-xs text-sub">Estimate based on your selected appreciation assumption. Not a guaranteed future price.</p>
          </Section>

          {/* Decision section */}
          <DecisionSection r={r} suggestions={suggestions} />
        </>
      )}
    </div>
  );
}

function FundingRow({ label, value, sub, bold, tone }) {
  const toneClass = tone === "ok" ? "text-ok" : tone === "err" ? "text-err" : "text-ink";
  return (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <span className={`text-sm ${bold ? "font-semibold text-ink" : "text-sub"}`}>{label}</span>
        {sub && <span className="ml-2 text-xs text-sub/70">{sub}</span>}
      </div>
      <span className={`text-sm font-medium ${bold ? "text-ink" : toneClass}`}>{value}</span>
    </div>
  );
}

function CostRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-sub">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

function Timeline({ years }) {
  if (!years) return null;
  const marks = [1, 5, 10, 15, 20, 25, 30].filter((m) => m <= years);
  return (
    <div className="mt-5">
      <div className="relative h-1.5 w-full rounded-full bg-appbg">
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: "100%" }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-sub">
        {marks.map((m) => (
          <span key={m} className={m === years ? "font-semibold text-ink" : ""}>
            Yr {m}{m === years && " · Paid"}
          </span>
        ))}
      </div>
    </div>
  );
}

function FutureValueChart({ r, years }) {
  const data = Array.from({ length: years + 1 }, (_, i) => ({ year: i, value: Math.round(r.fv(i)) }));
  return (
    <div className="mt-4 rounded-lg border border-line p-3">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E7EF" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#718096" }} tickFormatter={(y) => `Yr ${y}`} />
          <YAxis tick={{ fontSize: 11, fill: "#718096" }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={55} />
          <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} contentStyle={{ borderRadius: 8, border: "1px solid #E2E7EF", fontSize: 12 }} />
          <Line type="monotone" dataKey="value" name="Property Value" stroke="#18233A" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
function DecisionSection({ r, suggestions }) {
  const assessments = [
    { label: "Financial Commitment", value: r.level.label },
    { label: "Savings Position", value: r.surplusSavings > 0 ? "Surplus" : r.fundingGap > 0 ? "Shortfall" : "Balanced" },
    { label: "Loan Burden", value: formatPct(r.loanToValue) + " LTV" },
    { label: "Monthly Cost", value: formatCompact(r.totalMonthlyCost) + "/mo" },
    { label: "Long-Term Cost", value: formatCompact(r.totalInterest) + " interest" },
    { label: "Property Projection", value: formatCompact(r.fv(10)) + " @ 10y" },
  ];
  const headline =
    r.level.key === "low" ? "Lower monthly commitment" :
    r.level.key === "moderate" ? "Moderate financial commitment" :
    r.level.key === "high" ? "High monthly commitment" :
    "Requires further review";

  return (
    <Section id="aff-assessment" title="What does this mean?" subtitle="A transparent, indicative assessment — not a recommendation.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {assessments.map((a) => (
          <div key={a.label} className="rounded-lg border border-line bg-appbg p-3">
            <div className="text-xs text-sub">{a.label}</div>
            <div className="mt-1 text-sm font-semibold text-ink">{a.value}</div>
          </div>
        ))}
      </div>
      <Divider label="Indicative Assessment" />
      <div className="flex items-center gap-2">
        <Pill color={r.level.color}>{headline}</Pill>
      </div>
      <ul className="mt-3 space-y-2">
        {suggestions.map((s, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jade" />
            {s}
          </li>
        ))}
      </ul>
      <Divider label="Should you buy?" />
      <div id="aff-considerations" className="scroll-mt-24 flex items-start gap-2 rounded-lg bg-appbg p-3 text-sm text-sub">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-steel" />
        <span>Review before deciding — check emergency savings, existing obligations, actual loan terms, taxes, registration, transaction costs, and whether the assumed appreciation and rental income are realistic.</span>
      </div>
    </Section>
  );
}