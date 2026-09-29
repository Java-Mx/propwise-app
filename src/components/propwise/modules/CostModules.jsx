import React, { useState } from "react";
import { Field, NumberInput, Select, Section, ResultCard, Stat, Divider, Alert, Button, Pill } from "@/components/propwise/ui";
import {
  formatINR, formatCompact, num, monthlyEquiv, annualEquiv,
  FREQUENCIES, MONTHLY_CATEGORIES, ANNUAL_CATEGORIES, ONETIME_CATEGORIES,
} from "@/lib/finance";
import { Plus, Trash2, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useChartTheme, tooltipStyle } from "@/lib/chartTheme";

const PIE_COLORS = ["#18233A", "#52627A", "#2F8F83", "#C58B32", "#B95C5C", "#718096"];

function groupByCategory(costs, section) {
  const map = {};
  costs.filter((c) => c.section === section).forEach((c) => {
    const m = monthlyEquiv(c.amount, c.frequency);
    map[c.category] = (map[c.category] || 0) + m;
  });
  return map;
}

export function CostBuilder({ inputs, set }) {
  const costs = inputs.costs || [];
  const [tab, setTab] = useState("monthly");
  const tabs = [
    { key: "monthly", label: "Monthly", cats: MONTHLY_CATEGORIES },
    { key: "annual", label: "Annual", cats: ANNUAL_CATEGORIES },
    { key: "onetime", label: "One-Time", cats: ONETIME_CATEGORIES },
  ];
  const active = tabs.find((t) => t.key === tab);
  const freqOptions = tab === "onetime" ? ["One-Time"] : FREQUENCIES.filter((f) => f !== "One-Time");

  const addCost = () => {
    const frequency = tab === "onetime" ? "One-Time" : tab === "annual" ? "Yearly" : "Monthly";
    const item = { id: `c${Date.now()}${Math.random().toString(36).slice(2, 6)}`, section: tab, category: active.cats[0], amount: "", frequency };
    set("costs", [...costs, item]);
  };
  const updateCost = (id, patch) => set("costs", costs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeCost = (id) => set("costs", costs.filter((c) => (c.id !== id)));

  const items = costs.filter((c) => c.section === tab);
  const monthlyTotal = costs.filter((c) => c.frequency !== "One-Time").reduce((s, c) => s + monthlyEquiv(c.amount, c.frequency), 0);
  const annualTotal = costs.filter((c) => c.frequency !== "One-Time").reduce((s, c) => s + annualEquiv(c.amount, c.frequency), 0);
  const oneTimeTotal = costs.filter((c) => c.frequency === "One-Time").reduce((s, c) => s + num(c.amount), 0);

  return (
    <Section title="Cost Builder" subtitle="Add, edit and categorize every property-related cost.">
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium ${tab === t.key ? "bg-brand text-white" : "border border-line bg-white text-sub"}`}>{t.label}</button>
        ))}
      </div>
      <button onClick={addCost} className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-jade text-sm font-semibold text-white active:scale-[0.98] md:hidden"><Plus className="h-4 w-4" /> Add {active.label} Cost</button>
      <div className="hidden justify-end md:flex"><Button variant="primary" size="sm" icon={Plus} onClick={addCost}>Add {active.label} Cost</Button></div>
      {items.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-line bg-appbg px-4 py-8 text-center text-sm text-sub"><Wallet className="mx-auto mb-2 h-5 w-5 text-sub/60" />No {active.label.toLowerCase()} costs added yet.</div>
      ) : (
        <div className="mt-3 space-y-2.5">
          {items.map((c) => (
            <div key={c.id} className="grid grid-cols-12 items-end gap-2">
              <div className="col-span-12 sm:col-span-5"><Field label="Category"><Select value={c.category} onChange={(v) => updateCost(c.id, { category: v })} options={active.cats} renderOption={(o) => o} /></Field></div>
              <div className="col-span-7 sm:col-span-4"><Field label="Amount"><NumberInput value={c.amount} onChange={(v) => updateCost(c.id, { amount: v })} /></Field></div>
              <div className="col-span-5 sm:col-span-2"><Field label="Frequency"><Select value={c.frequency} onChange={(v) => updateCost(c.id, { frequency: v })} options={freqOptions} renderOption={(o) => o} /></Field></div>
              <div className="col-span-12 sm:col-span-1 flex justify-end"><Button variant="ghost" size="md" icon={Trash2} onClick={() => removeCost(c.id)} aria-label="Remove" /></div>
            </div>
          ))}
        </div>
      )}
      <Divider />
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-3">
        <Stat label="Monthly equivalent total" value={formatINR(monthlyTotal)} />
        <Stat label="Annual equivalent total" value={formatINR(annualTotal)} />
        <Stat label="One-time total" value={formatINR(oneTimeTotal)} />
      </div>
    </Section>
  );
}

export function MonthlyAnalyzer({ inputs, r }) {
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  const cats = groupByCategory(inputs.costs, "monthly");
  const annualCats = groupByCategory(inputs.costs, "annual");
  const merged = {};
  [...Object.entries(cats), ...Object.entries(annualCats)].forEach(([k, v]) => { merged[k] = (merged[k] || 0) + v; });
  const rows = Object.entries(merged).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const costToIncome = r.monthlyIncome > 0 ? (r.totalMonthlyCost / r.monthlyIncome) * 100 : 0;
  return (
    <Section title="Monthly Cost Analyzer" subtitle="What will this property cost you every month?">
      <div className="space-y-2">
        <Row label="EMI" value={formatINR(r.emi)} />
        {rows.map(([k, v]) => <Row key={k} label={k} value={formatINR(v)} />)}
        {r.existingEmi > 0 && <Row label="Existing EMI" value={formatINR(r.existingEmi)} />}
      </div>
      <Divider />
      <div className="flex items-center justify-between rounded-lg bg-brand px-4 py-3 text-white">
        <span className="text-sm font-medium">Total Monthly Cost</span>
        <span className="text-lg font-semibold">{formatINR(r.totalMonthlyCommitment)}</span>
      </div>
      <div className="mt-4 rounded-lg border border-line p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-sub">Cost-to-income</span>
          <span className="text-xl font-semibold text-ink">{formatPct(costToIncome)}</span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-appbg">
          <div className="h-full rounded-full" style={{ width: `${Math.min(costToIncome, 100)}%`, backgroundColor: r.level.color }} />
        </div>
      </div>
    </Section>
  );
}

export function AnnualAnalyzer({ inputs, r }) {
  const t = useChartTheme();
  const PIE = [t.series.emi, t.series.loan, t.series.maintenance, t.series.warn, t.series.err, t.series.other];
  const [span, setSpan] = useState(1);
  if (!r.hasInputs) return <Alert tone="info">Enter a property price in Property & Loan Setup first.</Alert>;
  const annualEmi = r.emi * 12;
  const recurringAnnual = r.recurringMonthly * 12;
  const cats = { ...groupByCategory(inputs.costs, "annual"), ...groupByCategory(inputs.costs, "monthly") };
  const annualOwnership = annualEmi + recurringAnnual;
  const donutData = [
    { name: "Annual EMI", value: Math.round(annualEmi) },
    ...Object.entries(cats).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, value: Math.round(v * 12) })),
  ].filter((d) => d.value > 0);
  const emiYears = Math.min(span, r.tenure || span);
  const cumulative = annualEmi * emiYears + recurringAnnual * span;
  return (
    <Section title="Annual Cost Analyzer" subtitle="The yearly financial burden of ownership.">
      <div className="space-y-2">
        <Row label="Annual EMI" value={formatINR(annualEmi)} />
        <Row label="Annual recurring costs" value={formatINR(recurringAnnual)} />
        {Object.entries(cats).filter(([, v]) => v > 0).map(([k, v]) => <Row key={k} label={k} value={formatINR(v * 12)} />)}
      </div>
      <Divider />
      <div className="flex items-center justify-between rounded-lg bg-brand px-4 py-3 text-white">
        <span className="text-sm font-medium">Total Annual Ownership</span>
        <span className="text-lg font-semibold">{formatINR(annualOwnership)}</span>
      </div>
      {donutData.length > 1 && (
        <div className="mt-4 rounded-lg border border-line p-3">
          <div className="mb-2 text-sm font-medium text-ink">Annual cost composition</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={42} paddingAngle={2}>
                {donutData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatINR(v)} contentStyle={tooltipStyle(t)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <Divider label="Cumulative" />
      <div className="mb-3 flex gap-2">
        {[1, 5, 10, 20].map((s) => (
          <button key={s} onClick={() => setSpan(s)} className={`h-9 rounded-full px-4 text-sm font-medium ${span === s ? "bg-brand text-white" : "border border-line bg-white text-sub"}`}>{s}Y</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ResultCard label={`Cost over ${span}Y`} value={formatCompact(cumulative)} sub="EMI (over tenure) + recurring" />
        <ResultCard label="Annual EMI years" value={`${emiYears} yr`} sub="EMI stops after loan tenure" />
      </div>
    </Section>
  );
}

export function OneTimeCalculator({ inputs, set, r }) {
  const t = useChartTheme();
  const PIE = [t.series.emi, t.series.loan, t.series.maintenance, t.series.warn, t.series.err, t.series.other];
  const costs = inputs.costs || [];
  const onetime = costs.filter((c) => c.section === "onetime");
  const add = (category) => set("costs", [...costs, { id: `c${Date.now()}${Math.random().toString(36).slice(2, 6)}`, section: "onetime", category, amount: "", frequency: "One-Time" }]);
  const update = (id, patch) => set("costs", costs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id) => set("costs", costs.filter((c) => c.id !== id));
  const total = onetime.reduce((s, c) => s + num(c.amount), 0);
  const price = r.price;
  return (
    <Section title="One-Time Cost Calculator" subtitle="Total your upfront purchase expenses.">
      {r.hasInputs && (
        <div className="mb-4 grid grid-cols-3 gap-3">
          <ResultCard label="Property Price" value={formatCompact(price)} />
          <ResultCard label="One-Time Costs" value={formatCompact(total)} />
          <ResultCard label="Total Initial" value={formatCompact(price + total)} tone="green" />
        </div>
      )}
      <div className="mb-3 flex flex-wrap gap-2">
        {ONETIME_CATEGORIES.map((c) => (
          <button key={c} onClick={() => add(c)} className="h-9 rounded-full border border-line bg-white px-3 text-sm font-medium text-steel hover:bg-[#E8F5F1] hover:text-jade">+ {c}</button>
        ))}
      </div>
      {onetime.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-appbg px-4 py-8 text-center text-sm text-sub">No one-time costs added. Tap a category above to add one.</div>
      ) : (
        <div className="space-y-2.5">
          {onetime.map((c) => (
            <div key={c.id} className="grid grid-cols-12 items-end gap-2">
              <div className="col-span-6 sm:col-span-5"><Field label="Category"><Select value={c.category} onChange={(v) => update(c.id, { category: v })} options={ONETIME_CATEGORIES} renderOption={(o) => o} /></Field></div>
              <div className="col-span-5 sm:col-span-6"><Field label="Amount"><NumberInput value={c.amount} onChange={(v) => update(c.id, { amount: v })} /></Field></div>
              <div className="col-span-1 flex justify-end"><Button variant="ghost" size="md" icon={Trash2} onClick={() => remove(c.id)} aria-label="Remove" /></div>
            </div>
          ))}
        </div>
      )}
      {total > 0 && (
        <div className="mt-4 rounded-lg border border-line p-3">
          <div className="mb-2 text-sm font-medium text-ink">One-time cost breakdown</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={onetime.filter((c) => num(c.amount) > 0).map((c) => ({ name: c.category, value: num(c.amount) }))}
                dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}
              >
                {onetime.filter((c) => num(c.amount) > 0).map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatINR(v)} contentStyle={tooltipStyle(t)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <Divider />
      <div className="flex items-center justify-between">
        <span className="text-sm text-sub">Property + One-Time</span>
        <span className="text-lg font-semibold text-ink">{formatINR(price + total)}</span>
      </div>
    </Section>
  );
}

export function BreakdownModule({ r }) {
  const [view, setView] = useState("lifetime");
  const t = useChartTheme();
  const PIE = [t.series.emi, t.series.loan, t.series.maintenance, t.series.warn, t.series.err, t.series.other];
  if (!r.hasInputs || r.actualLoan <= 0) return <Alert tone="info">Enter a property price and loan in Property & Loan Setup first.</Alert>;
  const principal = r.actualLoan;
  const interest = r.totalInterest;
  const maintenance = r.recurringMonthly * 12 * (r.tenure || 1);
  const oneTime = r.oneTimeTotal;
  let factor = 1;
  if (view === "monthly") factor = 1 / 12;
  else if (view === "yearly") factor = 1;
  const data = [
    { name: "Loan Principal", value: Math.round(principal * factor) },
    { name: "Interest", value: Math.round(interest * factor) },
    { name: "Maintenance", value: Math.round(maintenance * factor) },
    { name: "One-Time", value: Math.round(oneTime * (view === "monthly" ? 1 : 1)) },
  ].filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Section title="Ownership Cost Breakdown" subtitle="Where every rupee goes across the loan lifetime.">
      <div className="mb-4 flex gap-2">
        {[["monthly", "Monthly"], ["yearly", "Yearly"], ["lifetime", "Lifetime"]].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} className={`h-9 rounded-full px-4 text-sm font-medium ${view === k ? "bg-brand text-white" : "border border-line bg-white text-sub"}`}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatINR(v)} contentStyle={tooltipStyle(t)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between py-1.5">
              <span className="flex items-center gap-2 text-sm text-sub"><span className="h-3 w-3 rounded-sm" style={{ backgroundColor: PIE[i % PIE.length] }} />{d.name}</span>
              <span className="text-sm font-medium text-ink">{formatINR(d.value)}</span>
            </div>
          ))}
          <Divider />
          <div className="flex items-center justify-between"><span className="text-sm font-medium text-sub">Total</span><span className="text-base font-semibold text-ink">{formatINR(total)}</span></div>
        </div>
      </div>
    </Section>
  );
}

function Row({ label, value }) {
  return (<div className="flex items-center justify-between py-1.5"><span className="text-sm text-sub">{label}</span><span className="text-sm font-medium text-ink">{value}</span></div>);
}

function formatPct(n) { return (Math.round((n + Number.EPSILON) * 10) / 10) + "%"; }