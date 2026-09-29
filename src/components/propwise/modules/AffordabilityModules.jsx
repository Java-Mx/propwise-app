import React, { useState, useEffect, useMemo } from "react";
import { Field, NumberInput, PercentInput, Select, ChoiceInput, Section, ResultCard, Stat, Pill, Divider, Alert, Button, ApplyBar } from "@/components/propwise/ui";
import {
  formatINR, formatCompact, formatPct, num, indianFormat,
  TENURE_OPTIONS, INTEREST_OPTIONS, LOAN_PCT_OPTIONS, APPRECIATION_OPTIONS, PROJECTION_OPTIONS, PROPERTY_TYPES,
  BURDEN_THRESHOLDS, calculateEMI, futureValue, buildAmortization, payoffWithExtra, formatDuration,
} from "@/lib/finance";
import { ChevronDown, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartTheme, tooltipStyle } from "@/lib/chartTheme";

export function SetupModule({ inputs, set, r }) {
  const has = r.hasInputs;
  return (
    <div className="space-y-5">
      {has && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ResultCard label="Property Price" value={formatCompact(r.price)} />
          <ResultCard label="Loan Required" value={formatCompact(r.actualLoan)} />
          <ResultCard label="Estimated EMI" value={formatCompact(r.emi)} sub="per month" />
          <ResultCard label="Monthly Cost" value={formatCompact(r.totalMonthlyCost)} sub="per month" tone="green" />
        </div>
      )}
      <Section title="Property & Loan Details" subtitle="The only place core assumptions are edited — everything else updates from here.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Property Price"><NumberInput value={inputs.property_price} onChange={(v) => set("property_price", v)} /></Field>
          <Field label="Available Savings"><NumberInput value={inputs.amount_saved} onChange={(v) => set("amount_saved", v)} /></Field>
          <Field label="Property Type"><Select value={inputs.property_type} onChange={(v) => set("property_type", v)} options={PROPERTY_TYPES} placeholder="Select type" renderOption={(o) => o} /></Field>
          <Field label="Home Loan Percentage"><ChoiceInput value={inputs.home_loan_percentage} onChange={(v) => set("home_loan_percentage", v)} options={LOAN_PCT_OPTIONS} placeholder="Select" /></Field>
          <Field label="Monthly Income"><NumberInput value={inputs.monthly_income} onChange={(v) => set("monthly_income", v)} /></Field>
          <Field label="Existing Monthly EMI" hint="Optional"><NumberInput value={inputs.existing_emi} onChange={(v) => set("existing_emi", v)} /></Field>
          <Field label="Interest Rate"><ChoiceInput value={inputs.interest_rate} onChange={(v) => set("interest_rate", v)} options={INTEREST_OPTIONS} placeholder="Select" /></Field>
          <Field label="Loan Tenure"><Select value={inputs.loan_tenure_years} onChange={(v) => set("loan_tenure_years", v)} options={TENURE_OPTIONS} placeholder="Select" /></Field>
        </div>
        {!has && <div className="mt-4"><Alert tone="info">Enter a property price to begin. All other tools read from these assumptions.</Alert></div>}
      </Section>
    </div>
  );
}

export function CheckModule({ r }) {
  if (!r.hasInputs) return <Alert tone="info">Enter a property price and loan details in Property & Loan Setup first.</Alert>;
  return (
    <div className="space-y-5">
      <Section title="Can you reasonably afford this property?" subtitle="A transparent affordability snapshot.">
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
          <Row label="Property price" value={formatINR(r.price)} />
          <Row label="Available savings" value={formatINR(r.saved)} />
          <Row label="Required contribution" value={formatINR(r.requiredFunding)} sub="price − savings" />
          <Row label="Loan required" value={formatINR(r.actualLoan)} bold />
          <Row label="Estimated EMI" value={formatINR(r.emi)} />
          <Row label="Existing EMI" value={formatINR(r.existingEmi)} />
          <Row label="Total monthly commitment" value={formatINR(r.totalMonthlyCommitment)} bold />
          <Row label="Monthly income" value={formatINR(r.monthlyIncome)} />
        </div>
        <Divider />
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-ink">{formatPct(r.incomeBurden)}</span>
          <span className="text-sm text-sub">EMI-to-income ratio</span>
          <Pill color={r.level.color}>{r.level.label} commitment</Pill>
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
      </Section>
      {r.fundingGap > 0 && <Alert tone="warn">Funding gap of {formatINR(r.fundingGap)} — savings and selected loan % don't cover the price.</Alert>}
      {r.canCover
        ? <Alert tone="ok">Within your estimated purchase capacity of {formatCompact(r.maxPurchaseCapacity)}.</Alert>
        : <Alert tone="err">Exceeds your estimated purchase capacity.</Alert>}
    </div>
  );
}

export function EMISimulator({ inputs, set, r }) {
  const init = useMemo(() => ({
    loan: r.actualLoan || "",
    rate: inputs.interest_rate || 8,
    tenure: inputs.loan_tenure_years || 20,
  }), []); // eslint-disable-line
  const [loan, setLoan] = useState(init.loan);
  const [rate, setRate] = useState(init.rate);
  const [tenure, setTenure] = useState(init.tenure);
  const dirty = num(loan) !== r.actualLoan || num(rate) !== num(inputs.interest_rate) || num(tenure) !== num(inputs.loan_tenure_years);

  const months = num(tenure) * 12;
  const emi = calculateEMI(num(loan), num(rate), months);
  const totalRepay = emi * months;
  const totalInterest = Math.max(totalRepay - num(loan), 0);

  const reset = () => { setLoan(r.actualLoan || ""); setRate(inputs.interest_rate || 8); setTenure(inputs.loan_tenure_years || 20); };
  const apply = () => { set("interest_rate", rate); set("loan_tenure_years", tenure); };

  return (
    <div className="space-y-5">
      <Section title="EMI Simulator" subtitle="Experiment with loan assumptions. Nothing changes in your analysis until you apply.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Loan Amount"><NumberInput value={loan} onChange={setLoan} /></Field>
          <Field label={`Interest Rate — ${formatPct(num(rate))}`}>
            <input type="range" min={6} max={12} step={0.1} value={num(rate)} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-[#2F8F83]" />
          </Field>
          <Field label={`Tenure — ${num(tenure)} yrs`}>
            <input type="range" min={1} max={30} step={1} value={num(tenure)} onChange={(e) => setTenure(Number(e.target.value))} className="w-full accent-[#2F8F83]" />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ResultCard label="Monthly EMI" value={formatCompact(emi)} tone="green" />
          <ResultCard label="Total Interest" value={formatCompact(totalInterest)} />
          <ResultCard label="Total Repayment" value={formatCompact(totalRepay)} />
        </div>
        <ApplyBar dirty={dirty} onApply={apply} onReset={reset} note="Applying updates your analysis interest rate and tenure (loan amount is derived from price & savings)." />
      </Section>
    </div>
  );
}

export function PayoffExplorer({ r }) {
  const [extra, setExtra] = useState(0);
  if (!r.hasInputs || r.actualLoan <= 0) return <Alert tone="info">Enter a property price and loan details in Property & Loan Setup first.</Alert>;
  const res = payoffWithExtra(r.actualLoan, r.rate, r.tenure, extra);
  return (
    <div className="space-y-5">
      <Section title="Loan Payoff Explorer" subtitle="See how an extra monthly payment changes your payoff time.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Original Loan"><NumberInput value={r.actualLoan} onChange={() => {}} disabled /></Field>
          <Field label="Interest Rate"><PercentInput value={r.rate} onChange={() => {}} disabled /></Field>
          <Field label="Extra Monthly Payment">
            <NumberInput value={extra} onChange={setExtra} prefix="₹" />
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-ink">Current Plan</div>
            <Stat label="Payoff time" value={formatDuration(res.baseMonths)} />
            <Stat2 label="Total interest" value={formatCompact(res.baseTotalInterest)} />
          </div>
          <div className="rounded-xl border border-jade bg-jadebg p-4">
            <div className="mb-3 text-sm font-semibold text-jade">With Extra Payment</div>
            <Stat label="New payoff time" value={formatDuration(res.months)} />
            <Stat2 label="Total interest" value={formatCompact(res.totalInterest)} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ResultCard label="Interest Saved" value={formatCompact(res.interestSaved)} tone="green" />
          <ResultCard label="Time Saved" value={formatDuration(res.monthsReduced)} tone="green" />
        </div>
        {extra > 0 && res.monthsReduced > 0 && (
          <p className="text-xs text-sub">Paying an extra {formatINR(extra)}/month finishes the loan {formatDuration(res.monthsReduced)} sooner and saves {formatCompact(res.interestSaved)} in interest.</p>
        )}
      </Section>
    </div>
  );
}

export function FutureValueModule({ inputs, set, r }) {
  const t = useChartTheme();
  const [apprec, setApprec] = useState(inputs.annual_appreciation || 5);
  const [years, setYears] = useState(inputs.projection_years || 10);
  const dirty = num(apprec) !== num(inputs.annual_appreciation) || num(years) !== num(inputs.projection_years);
  const fv = (y) => futureValue(num(r.price), num(apprec), y);
  const data = Array.from({ length: num(years) + 1 }, (_, i) => ({ year: i, value: Math.round(fv(i)) }));
  const projected = fv(num(years));
  const growth = projected - num(r.price);
  const annualized = num(years) > 0 ? (Math.pow(projected / Math.max(num(r.price), 1), 1 / num(years)) - 1) * 100 : 0;
  const reset = () => { setApprec(inputs.annual_appreciation || 5); setYears(inputs.projection_years || 10); };
  const apply = () => { set("annual_appreciation", apprec); set("projection_years", years); };
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  return (
    <Section title="Future Property Value" subtitle="Choose your appreciation assumption and projection period.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Current Value"><NumberInput value={r.price} onChange={() => {}} disabled /></Field>
        <Field label="Annual Appreciation"><PercentInput value={apprec} onChange={setApprec} /></Field>
        <Field label="Projection Period">
          <Select value={years} onChange={setYears} options={PROJECTION_OPTIONS} renderOption={(o) => `${o} years`} />
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ResultCard label="Current Value" value={formatCompact(r.price)} />
        <ResultCard label={`Projected @ ${num(years)}y`} value={formatCompact(projected)} tone="green" />
        <ResultCard label="Total Growth" value={formatCompact(growth)} />
        <ResultCard label="Annualized" value={formatPct(annualized)} />
      </div>
      <div className="mt-4 rounded-lg border border-line p-3">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: t.axis }} tickFormatter={(y) => `Yr ${y}`} stroke={t.grid} />
            <YAxis tick={{ fontSize: 11, fill: t.axis }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={55} stroke={t.grid} />
            <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} contentStyle={tooltipStyle(t)} />
            <Line type="monotone" dataKey="value" name="Property Value" stroke={t.series.equity} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ApplyBar dirty={dirty} onApply={apply} onReset={reset} note="Applying updates your analysis appreciation and projection period." />
    </Section>
  );
}

function Row({ label, value, sub, bold }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <span className={`text-sm ${bold ? "font-semibold text-ink" : "text-sub"}`}>{label}</span>
        {sub && <span className="ml-2 text-xs text-sub">{sub}</span>}
      </div>
      <span className={`text-sm font-medium ${bold ? "text-ink" : "text-ink"}`}>{value}</span>
    </div>
  );
}
function Stat2({ label, value }) {
  return (
    <div className="flex flex-col mt-2">
      <span className="text-xs text-sub">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}