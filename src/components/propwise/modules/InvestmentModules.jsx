import React, { useState, useMemo } from "react";
import { Field, NumberInput, ChoiceInput, Select, Section, ResultCard, Stat, Pill, Divider, Alert, Button, ApplyBar } from "@/components/propwise/ui";
import {
  formatINR, formatCompact, formatPct, num, futureValue, calculateEMI,
  RENT_GROWTH_OPTIONS, VACANCY_OPTIONS, PROJECTION_OPTIONS, APPRECIATION_OPTIONS,
} from "@/lib/finance";
import ScenarioCompare from "@/components/propwise/ScenarioCompare";
import { LineChart, Line, Area, AreaChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useChartTheme, tooltipStyle } from "@/lib/chartTheme";

const SCENARIOS = [
  { key: "residence", label: "Primary Residence" },
  { key: "investment", label: "Investment Property" },
  { key: "firsttime", label: "First-Time Buyer" },
  { key: "upgrade", label: "Upgrade" },
  { key: "hold", label: "Long-Term Hold" },
];

export function ProfileModule({ inputs, r }) {
  const [scenario, setScenario] = useState("residence");
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  const incomeReq = r.incomeBurden < 25 ? "Moderate income" : r.incomeBurden < 40 ? "Higher income" : r.incomeBurden < 55 ? "High income" : "Very high income";
  const capitalReq = r.surplusSavings > 0 ? "comfortable initial capital" : r.fundingGap > 0 ? "additional capital needed" : "sufficient initial capital";
  const characteristics = [
    { label: "Income requirement", value: incomeReq },
    { label: "Initial capital", value: capitalReq },
    { label: "Monthly commitment", value: r.level.label },
    { label: "Loan burden", value: formatPct(r.loanToValue) + " LTV" },
    { label: "Investment horizon", value: `${inputs.loan_tenure_years || 0} years` },
  ];
  const emphasis = {
    residence: "Focus on monthly affordability and how comfortably the EMI fits your income.",
    investment: "Focus on rental yield, net monthly outflow and long-term equity build-up.",
    firsttime: "Focus on the down payment, initial cash required and keeping total monthly cost manageable.",
    upgrade: "Focus on the funding gap and whether existing savings cover the larger commitment.",
    hold: "Focus on equity growth and projected value over a long horizon.",
  }[scenario];
  return (
    <Section title="Buyer Profile" subtitle="What type of buyer does this property financially suit?">
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {SCENARIOS.map((s) => (
          <button key={s.key} onClick={() => setScenario(s.key)} className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium ${scenario === s.key ? "bg-brand text-white" : "border border-line bg-white text-sub"}`}>{s.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {characteristics.map((c) => (<div key={c.label} className="rounded-lg border border-line bg-appbg p-3"><div className="text-xs text-sub">{c.label}</div><div className="mt-1 text-sm font-semibold text-ink">{c.value}</div></div>))}
      </div>
      <Divider />
      <p className="text-sm text-ink">{emphasis}</p>
      <p className="mt-2 text-xs text-sub">This describes financial characteristics — it does not assess any specific person's suitability.</p>
    </Section>
  );
}

export function CommitmentModule({ r }) {
  const t = useChartTheme();
  if (!r.hasInputs) return <Alert tone="info">Enter a property price and income in Property & Loan Setup first.</Alert>;
  const income = r.monthlyIncome;
  const existing = r.existingEmi;
  const property = r.totalMonthlyCost;
  const remaining = income - existing - property;
  const bars = [
    { label: "Income", value: income, color: t.series.emi },
    { label: "Existing obligations", value: existing, color: t.series.warn },
    { label: "Property commitment", value: property, color: t.series.equity },
    { label: "Remaining income", value: remaining, color: remaining >= 0 ? t.series.other : t.series.err },
  ];
  const max = Math.max(income, existing + property, 1);
  return (
    <Section title="Financial Commitment" subtitle="How income flows through obligations to your property.">
      <div className="space-y-3">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="mb-1 flex items-center justify-between text-sm"><span className="text-sub">{b.label}</span><span className="font-medium text-ink">{formatINR(b.value)}</span></div>
            <div className="h-7 w-full overflow-hidden rounded-md bg-appbg"><div className="h-full rounded-md" style={{ width: `${Math.max((b.value / max) * 100, 2)}%`, backgroundColor: b.color }} /></div>
          </div>
        ))}
      </div>
      <Divider />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total monthly commitment" value={formatINR(r.totalMonthlyCommitment)} />
        <Stat label="Income used" value={formatPct(r.monthlyIncome > 0 ? (r.totalMonthlyCommitment / r.monthlyIncome) * 100 : 0)} />
        <Stat label="Remaining" value={formatINR(remaining)} />
      </div>
      {remaining < 0 && <div className="mt-3"><Alert tone="err">Commitments exceed monthly income by {formatINR(-remaining)}.</Alert></div>}
    </Section>
  );
}

export function HorizonModule({ inputs, set, r }) {
  const [years, setYears] = useState(inputs.projection_years || 10);
  const dirty = num(years) !== num(inputs.projection_years);
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  const horizon = num(years);
  const row = r.yearly.find((d) => d.year === horizon) || r.yearly[r.yearly.length - 1];
  const totalInvestment = r.downPayment + r.emi * 12 * Math.min(horizon, r.tenure);
  const loanPaid = r.actualLoan - (row ? row.loanBalance : 0);
  const value = futureValue(r.price, r.appreciation, horizon);
  const equity = row ? row.equity : value - 0;
  const rentalCum = r.yearly.filter((d) => d.year <= horizon).reduce((s, d) => s + d.annualRentalIncome, 0);
  const reset = () => setYears(inputs.projection_years || 10);
  const apply = () => set("projection_years", years);
  return (
    <Section title="Investment Horizon" subtitle="Project outcomes over your chosen horizon.">
      <div className="mb-4 flex gap-2">
        {[3, 5, 10, 15, 20].map((y) => (
          <button key={y} onClick={() => setYears(y)} className={`h-9 rounded-full px-4 text-sm font-medium ${years === y ? "bg-brand text-white" : "border border-line bg-white text-sub"}`}>{y}Y</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ResultCard label="Total Invested" value={formatCompact(totalInvestment)} sub="down payment + EMI" />
        <ResultCard label="Loan Paid Down" value={formatCompact(loanPaid)} />
        <ResultCard label="Property Value" value={formatCompact(value)} />
        <ResultCard label="Est. Equity" value={formatCompact(equity)} tone="green" />
        <ResultCard label="Rental (cum.)" value={formatCompact(rentalCum)} />
      </div>
      <ApplyBar dirty={dirty} onApply={apply} onReset={reset} note="Applying updates your analysis projection period." />
    </Section>
  );
}

export function RentalIncomeModule({ inputs, set, r }) {
  return (
    <div className="space-y-5">
      <Section title="Rental Income" subtitle="Estimate gross to net rental income.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Expected Monthly Rent"><NumberInput value={inputs.monthly_rent} onChange={(v) => set("monthly_rent", v)} /></Field>
          <Field label="Annual Rent Growth"><ChoiceInput value={inputs.annual_rent_increase} onChange={(v) => set("annual_rent_increase", v)} options={RENT_GROWTH_OPTIONS} /></Field>
          <Field label="Expected Vacancy"><ChoiceInput value={inputs.vacancy_rate} onChange={(v) => set("vacancy_rate", v)} options={VACANCY_OPTIONS} /></Field>
          <Field label="Annual Rental Maintenance"><NumberInput value={inputs.annual_rental_maintenance} onChange={(v) => set("annual_rental_maintenance", v)} /></Field>
          <Field label="Other Rental Costs (annual)"><NumberInput value={inputs.other_rental_costs} onChange={(v) => set("other_rental_costs", v)} /></Field>
        </div>
      </Section>
      {r.hasInputs && r.monthlyRent > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <ResultCard label="Gross Annual Rent" value={formatCompact(r.grossAnnualRent)} />
          <ResultCard label="Vacancy Loss" value={formatCompact(r.grossAnnualRent - r.effectiveAnnualRent)} />
          <ResultCard label="Rental Expenses" value={formatCompact(r.rentalCosts)} />
          <ResultCard label="Net Annual Rental" value={formatCompact(r.netAnnualRental)} tone="green" />
          <ResultCard label="Net Monthly" value={formatCompact(r.netAnnualRental / 12)} tone="green" />
        </div>
      ) : <Alert tone="info">Enter a monthly rent above to see gross-to-net rental income.</Alert>}
    </div>
  );
}

export function RentalYieldModule({ inputs, set, r }) {
  const [rent, setRent] = useState(inputs.monthly_rent || "");
  const dirty = num(rent) !== num(inputs.monthly_rent);
  const annualRent = num(rent) * 12;
  const gross = r.price > 0 ? (annualRent / r.price) * 100 : 0;
  const net = r.price > 0 ? (r.netAnnualRental / r.price) * 100 : 0;
  const reset = () => setRent(inputs.monthly_rent || "");
  const apply = () => set("monthly_rent", rent);
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  return (
    <Section title="Rental Yield" subtitle="Measure annual rent against property value.">
      <div className="rounded-lg border border-line bg-appbg p-4 text-sm text-ink">
        <div className="font-medium">Gross Rental Yield = (Annual Rent ÷ Property Value) × 100</div>
        <div className="mt-1 text-xs text-sub">Net Rental Yield = (Net Annual Rent ÷ Property Value) × 100</div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Monthly Rent (try different values)"><NumberInput value={rent} onChange={setRent} /></Field>
        <div className="flex items-end"><div className="w-full rounded-lg bg-appbg px-3 py-3"><div className="text-xs text-sub">Property Value</div><div className="text-sm font-semibold text-ink">{formatCompact(r.price)}</div></div></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ResultCard label="Gross Yield" value={formatPct(gross)} sub={`${formatINR(annualRent)} / yr`} />
        <ResultCard label="Net Yield" value={formatPct(net)} sub="after vacancy & costs" tone="green" />
      </div>
      <ApplyBar dirty={dirty} onApply={apply} onReset={reset} note="Applying updates your analysis monthly rent." />
    </Section>
  );
}

export function RentalCostsModule({ inputs, set, r }) {
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  const gross = r.grossAnnualRent;
  const vacancyLoss = r.grossAnnualRent - r.effectiveAnnualRent;
  const expenses = r.rentalCosts;
  const net = r.netAnnualRental;
  return (
    <Section title="Rental Costs" subtitle="Manage the expenses that reduce your rental income.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Annual Rental Maintenance"><NumberInput value={inputs.annual_rental_maintenance} onChange={(v) => set("annual_rental_maintenance", v)} /></Field>
        <Field label="Other Rental Costs (annual)"><NumberInput value={inputs.other_rental_costs} onChange={(v) => set("other_rental_costs", v)} /></Field>
        <Field label="Vacancy Rate"><ChoiceInput value={inputs.vacancy_rate} onChange={(v) => set("vacancy_rate", v)} options={VACANCY_OPTIONS} /></Field>
      </div>
      <Divider />
      <div className="space-y-2">
        <Row label="Gross annual rent" value={formatINR(gross)} />
        <Row label="Vacancy loss" value={`− ${formatINR(vacancyLoss)}`} />
        <Row label="Rental expenses" value={`− ${formatINR(expenses)}`} />
      </div>
      <Divider />
      <div className="flex items-center justify-between rounded-lg bg-jade px-4 py-3 text-white">
        <span className="text-sm font-medium">Net Rental Income</span>
        <span className="text-lg font-semibold">{formatINR(net)}</span>
      </div>
    </Section>
  );
}

export function NetBenefitModule({ r }) {
  const t = useChartTheme();
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  const monthlyNet = r.netMonthlyRentalBenefit - r.totalMonthlyCost;
  const annualNet = monthlyNet * 12;
  const tone = monthlyNet > 0 ? "green" : monthlyNet < 0 ? "err" : "navy";
  const color = monthlyNet > 0 ? "#2F8F6B" : monthlyNet < 0 ? "#B95C5C" : "#18233A";
  return (
    <Section title="Net Rental Benefit" subtitle="How much rent offsets your ownership cost.">
      <div className="space-y-2">
        <Row label="Net rental income (monthly)" value={formatINR(r.netMonthlyRentalBenefit)} />
        <Row label="Total monthly cost" value={`− ${formatINR(r.totalMonthlyCost)}`} />
      </div>
      <Divider />
      <div className="rounded-xl p-4 text-white" style={{ backgroundColor: color }}>
        <div className="text-xs uppercase tracking-wide text-white/80">Monthly Net {monthlyNet >= 0 ? "Benefit" : "Cost"}</div>
        <div className="mt-1 text-3xl font-semibold">{formatINR(Math.abs(monthlyNet))}</div>
      </div>
      {r.monthlyRent > 0 && (
        <div className="mt-3 rounded-lg border border-line p-3">
          <div className="mb-2 text-sm font-medium text-ink">Rental income vs ownership cost</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ name: "Monthly", rental: r.netMonthlyRentalBenefit, cost: r.totalMonthlyCost }]} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: t.axis }} stroke={t.grid} />
              <YAxis tick={{ fontSize: 10, fill: t.axis }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={48} stroke={t.grid} />
              <Tooltip contentStyle={tooltipStyle(t)} formatter={(v, n) => [formatINR(v), n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="rental" name="Rental Benefit" fill={t.series.equity} radius={[4, 4, 0, 0]} maxBarSize={48} />
              <Bar dataKey="cost" name="Ownership Cost" fill={t.series.emi} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <ResultCard label="Annual Net" value={formatCompact(annualNet)} tone={tone === "green" ? "green" : tone === "err" ? "error" : undefined} />
        <ResultCard label="Net Outflow" value={formatCompact(r.netMonthlyOutflow)} sub="cost − benefit" />
      </div>
      {r.monthlyRent === 0 && <p className="mt-2 text-xs text-sub">Enter expected rent in Rental Income to see the net benefit.</p>}
    </Section>
  );
}

export function ValueProjectionModule({ inputs, set, r }) {
  const t = useChartTheme();
  const [apprec, setApprec] = useState(inputs.annual_appreciation || 5);
  const [years, setYears] = useState(inputs.projection_years || 20);
  const dirty = num(apprec) !== num(inputs.annual_appreciation) || num(years) !== num(inputs.projection_years);
  const data = Array.from({ length: num(years) + 1 }, (_, i) => ({ year: i, value: Math.round(futureValue(r.price, num(apprec), i)) }));
  const reset = () => { setApprec(inputs.annual_appreciation || 5); setYears(inputs.projection_years || 20); };
  const apply = () => { set("annual_appreciation", apprec); set("projection_years", years); };
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  return (
    <Section title="Property Value Projection" subtitle="Animated value growth over your horizon.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Annual Appreciation"><ChoiceInput value={apprec} onChange={setApprec} options={APPRECIATION_OPTIONS} /></Field>
        <Field label="Projection Period"><Select value={years} onChange={setYears} options={PROJECTION_OPTIONS} renderOption={(o) => `${o} years`} /></Field>
      </div>
      <div className="mt-4 rounded-lg border border-line p-3">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs><linearGradient id="vp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={t.series.equity} stopOpacity={0.3} /><stop offset="95%" stopColor={t.series.equity} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: t.axis }} tickFormatter={(y) => `Yr ${y}`} stroke={t.grid} />
            <YAxis tick={{ fontSize: 11, fill: t.axis }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={55} stroke={t.grid} />
            <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} contentStyle={tooltipStyle(t)} />
            <Area type="monotone" dataKey="value" name="Property Value" stroke={t.series.equity} strokeWidth={2} fill="url(#vp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <ApplyBar dirty={dirty} onApply={apply} onReset={reset} note="Applying updates your analysis appreciation and projection period." />
    </Section>
  );
}

export function EquityModule({ r }) {
  const t = useChartTheme();
  const [span, setSpan] = useState(Math.min(inputs_projection(r), r.yearly.length));
  if (!r.hasInputs || r.actualLoan <= 0) return <Alert tone="info">Enter a property price and loan in Property & Loan Setup first.</Alert>;
  const data = r.yearly.filter((d) => d.year <= span);
  return (
    <Section title="Equity Growth" subtitle="Property value minus remaining loan, over time.">
      <div className="mb-4 flex gap-2">
        {[5, 10, 15, 20].filter((y) => y <= r.yearly.length).map((y) => (
          <button key={y} onClick={() => setSpan(y)} className={`h-9 rounded-full px-4 text-sm font-medium ${span === y ? "bg-brand text-white" : "border border-line bg-white text-sub"}`}>{y}Y</button>
        ))}
      </div>
      <div className="rounded-lg border border-line p-3">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: t.axis }} tickFormatter={(y) => `Yr ${y}`} stroke={t.grid} />
            <YAxis tick={{ fontSize: 11, fill: t.axis }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={55} stroke={t.grid} />
            <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} contentStyle={tooltipStyle(t)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="propertyValue" name="Property Value" stroke={t.series.value} fill={t.series.value} fillOpacity={0.06} />
            <Area type="monotone" dataKey="loanBalance" name="Loan Balance" stroke={t.series.loan} fill={t.series.loan} fillOpacity={0.06} />
            <Area type="monotone" dataKey="equity" name="Equity" stroke={t.series.equity} fill={t.series.equity} fillOpacity={0.06} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}
function inputs_projection(r) { return 10; }

export function YearlyModule({ inputs, r }) {
  const [span, setSpan] = useState(inputs.projection_years || 10);
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  const data = r.yearly.filter((d) => d.year <= span);
  return (
    <Section title="Yearly Investment Analysis" subtitle="Year-by-year position.">
      <div className="mb-4 flex gap-2">
        {[5, 10, 15, 20].filter((y) => y <= r.yearly.length).map((y) => (
          <button key={y} onClick={() => setSpan(y)} className={`h-9 rounded-full px-4 text-sm font-medium ${span === y ? "bg-brand text-white" : "border border-line bg-white text-sub"}`}>{y}Y</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-sub">
              <th className="py-2 pr-3 font-medium">Year</th>
              <th className="py-2 pr-3 font-medium">Property Value</th>
              <th className="py-2 pr-3 font-medium">Loan Balance</th>
              <th className="py-2 pr-3 font-medium">Equity</th>
              <th className="py-2 pr-3 font-medium">Rental</th>
              <th className="py-2 pr-3 font-medium">Ownership Cost</th>
              <th className="py-2 font-medium">Net Position</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year} className="border-b border-line/50">
                <td className="py-2 pr-3 font-medium text-ink">{d.year}</td>
                <td className="py-2 pr-3 text-ink">{formatCompact(d.propertyValue)}</td>
                <td className="py-2 pr-3 text-ink">{formatCompact(d.loanBalance)}</td>
                <td className="py-2 pr-3 font-semibold text-ink">{formatCompact(d.equity)}</td>
                <td className="py-2 pr-3 text-ok">{formatCompact(d.annualRentalIncome)}</td>
                <td className="py-2 pr-3 text-ink">{formatCompact(d.annualPropertyCost)}</td>
                <td className="py-2 font-semibold text-ink">{formatCompact(d.equity - d.annualNetOutflow)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function ScenarioModule({ inputs, set }) {
  return <ScenarioCompare inputs={inputs} set={set} />;
}

export function PropertyCompareModule({ inputs }) {
  const blank = { id: "", property_price: "", amount_saved: "", home_loan_percentage: 80, interest_rate: 8, loan_tenure_years: 20, monthly_rent: "" };
  const [props, setProps] = useState(() => [
    { ...blank, id: "p1", property_price: inputs.property_price || "", amount_saved: inputs.amount_saved || "" },
    { ...blank, id: "p2" },
    { ...blank, id: "p3" },
  ]);
  const update = (i, field, v) => setProps((p) => p.map((row, idx) => (idx === i ? { ...row, [field]: v } : row)));
  const summary = props.map((p) => {
    const price = num(p.property_price);
    const saved = num(p.amount_saved);
    const loanPct = num(p.home_loan_percentage);
    const rate = num(p.interest_rate);
    const tenure = num(p.loan_tenure_years);
    const rent = num(p.monthly_rent);
    const maxLoan = price * loanPct / 100;
    const funding = Math.max(price - saved, 0);
    const loan = funding <= 0 ? 0 : Math.min(funding, maxLoan);
    const emi = calculateEMI(loan, rate, tenure * 12);
    const monthlyCost = emi;
    const yield_ = price > 0 ? (rent * 12 / price) * 100 : 0;
    const fv10 = futureValue(price, 5, 10);
    const equity10 = fv10 - Math.max(loan - (emi * 12 * 10 > loan ? 0 : 0), 0);
    return { price, loan, emi, monthlyCost, rent, yield_, fv10, equity10: fv10 - Math.max(loan, 0) };
  });
  const metrics = [
    { label: "Property Price", fmt: (s) => formatCompact(s.price) },
    { label: "Loan", fmt: (s) => formatCompact(s.loan) },
    { label: "EMI / mo", fmt: (s) => formatCompact(s.emi) },
    { label: "Monthly Cost", fmt: (s) => formatCompact(s.monthlyCost) },
    { label: "Rent", fmt: (s) => formatCompact(s.rent) },
    { label: "Gross Yield", fmt: (s) => formatPct(s.yield_) },
    { label: "Value @ 10y", fmt: (s) => formatCompact(s.fv10) },
    { label: "Equity @ 10y", fmt: (s) => formatCompact(s.equity10) },
  ];
  return (
    <Section title="Property Comparison" subtitle="Compare up to 3 properties side by side. Uses 5% appreciation for the 10-year value.">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-sub">
              <th className="py-2 pr-3 font-medium">Input</th>
              {props.map((p, i) => (<th key={p.id} className="py-2 px-3 font-medium">Property {i + 1}</th>))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Property Price", field: "property_price" },
              { label: "Savings", field: "amount_saved" },
              { label: "Loan %", field: "home_loan_percentage" },
              { label: "Interest %", field: "interest_rate" },
              { label: "Tenure (yrs)", field: "loan_tenure_years" },
              { label: "Monthly Rent", field: "monthly_rent" },
            ].map((row) => (
              <tr key={row.field} className="border-b border-line/50">
                <td className="py-2 pr-3 text-sub">{row.label}</td>
                {props.map((p, i) => (
                  <td key={p.id} className="py-1.5 px-3">
                    {row.field === "home_loan_percentage" || row.field === "interest_rate" || row.field === "loan_tenure_years" ? (
                      <input type="number" value={p[row.field]} onChange={(e) => update(i, row.field, e.target.value === "" ? "" : Number(e.target.value))} className="h-9 w-full rounded-md border border-line bg-white px-2 text-sm outline-none" />
                    ) : (
                      <NumberInput value={p[row.field]} onChange={(v) => update(i, row.field, v)} compact />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Divider label="Comparison" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-sub">
              <th className="py-2 pr-3 font-medium">Metric</th>
              {props.map((p, i) => (<th key={p.id} className="py-2 px-3 font-medium">Property {i + 1}</th>))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.label} className="border-b border-line/50">
                <td className="py-2 pr-3 text-sub">{m.label}</td>
                {summary.map((s, i) => (<td key={i} className="py-2 px-3 font-medium text-ink">{m.fmt(s)}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function Row({ label, value }) {
  return (<div className="flex items-center justify-between py-1.5"><span className="text-sm text-sub">{label}</span><span className="text-sm font-medium text-ink">{value}</span></div>);
}