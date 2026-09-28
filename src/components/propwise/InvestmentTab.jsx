import React, { useState } from "react";
import { Field, NumberInput, ChoiceInput, Section, ResultCard, Divider, Alert } from "@/components/propwise/ui";
import {
  formatINR, formatCompact, formatPct,
  RENT_GROWTH_OPTIONS, VACANCY_OPTIONS, PROJECTION_OPTIONS, num,
} from "@/lib/finance";
import ScenarioCompare from "@/components/propwise/ScenarioCompare";
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SUB_TABS = [
  { key: "profile", label: "Buyer Profile" },
  { key: "rental", label: "Rental Analysis" },
  { key: "compare", label: "Compare" },
];

export default function InvestmentTab({ inputs, set, r }) {
  const [sub, setSub] = useState("profile");
  const has = r.hasInputs;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 rounded-lg bg-appbg p-1">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${sub === t.key ? "bg-white text-ink shadow-sm" : "text-sub hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!has && <Alert tone="info">Enter a property price in the Affordability tab to populate this analysis.</Alert>}

      {sub === "profile" && <BuyerProfile r={r} inputs={inputs} />}
      {sub === "rental" && <RentalAnalysis inputs={inputs} set={set} r={r} />}
      {sub === "compare" && <ScenarioCompare inputs={inputs} set={set} />}
    </div>
  );
}

function BuyerProfile({ r, inputs }) {
  const characteristics = [
    { label: "Income requirement", value: incomeReq(r) },
    { label: "Initial capital", value: capitalReq(r) },
    { label: "Monthly commitment", value: r.level.label },
    { label: "Loan burden", value: formatPct(r.loanToValue) + " LTV" },
    { label: "Investment horizon", value: `${inputs.loan_tenure_years || 0} years` },
  ];
  return (
    <Section title="Buyer Profile" subtitle="What type of buyer does this property financially suit?">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {characteristics.map((c) => (
          <div key={c.label} className="rounded-lg border border-line bg-appbg p-3">
            <div className="text-xs text-sub">{c.label}</div>
            <div className="mt-1 text-sm font-semibold text-ink">{c.value}</div>
          </div>
        ))}
      </div>
      <Divider />
      <p className="text-sm text-ink">
        More suitable for a buyer with {incomeReq(r).toLowerCase()}, {capitalReq(r).toLowerCase()} and a longer investment horizon.
      </p>
      <p className="mt-2 text-xs text-sub">This describes financial characteristics — it does not assess any specific person's suitability.</p>
    </Section>
  );
}

function RentalAnalysis({ inputs, set, r }) {
  const vacancyAdj = (num(inputs.monthly_rent) * num(inputs.vacancy_rate)) / 100;
  const rentalExpMonthly = (num(inputs.annual_rental_maintenance) + num(inputs.other_rental_costs)) / 12;

  return (
    <div className="space-y-5">
      <Section title="Rental Inputs" subtitle="Optional — what if you rent it out?">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Expected Monthly Rent"><NumberInput value={inputs.monthly_rent} onChange={(v) => set("monthly_rent", v)} /></Field>
          <Field label="Annual Rent Growth"><ChoiceInput value={inputs.annual_rent_increase} onChange={(v) => set("annual_rent_increase", v)} options={RENT_GROWTH_OPTIONS} /></Field>
          <Field label="Expected Vacancy"><ChoiceInput value={inputs.vacancy_rate} onChange={(v) => set("vacancy_rate", v)} options={VACANCY_OPTIONS} /></Field>
          <Field label="Annual Rental Maintenance"><NumberInput value={inputs.annual_rental_maintenance} onChange={(v) => set("annual_rental_maintenance", v)} /></Field>
          <Field label="Other Rental Costs (annual)"><NumberInput value={inputs.other_rental_costs} onChange={(v) => set("other_rental_costs", v)} /></Field>
        </div>
      </Section>

      {r.hasInputs && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <ResultCard label="Monthly Rent" value={formatCompact(r.monthlyRent)} />
            <ResultCard label="Gross Annual Rent" value={formatCompact(r.grossAnnualRent)} />
            <ResultCard label="Effective Annual Rent" value={formatCompact(r.effectiveAnnualRent)} sub="after vacancy" />
            <ResultCard label="Gross Rental Yield" value={formatPct(r.grossYield)} />
            <ResultCard label="Net Annual Rental" value={formatCompact(r.netAnnualRental)} />
            <ResultCard label="Net Rental Yield" value={formatPct(r.netYield)} />
            <ResultCard label="Net Monthly Benefit" value={formatCompact(r.netMonthlyRentalBenefit)} />
            <ResultCard label="Net Monthly Outflow" value={formatCompact(r.netMonthlyOutflow)} emphasis />
          </div>

          {/* Cost vs benefit */}
          <Section title="Monthly Cost vs Rental Benefit" subtitle="Two-sided comparison.">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-line p-4">
                <div className="mb-3 text-sm font-semibold text-ink">Monthly Property Cost</div>
                <Line3 label="EMI" value={formatINR(r.emi)} />
                <Line3 label="Maintenance & recurring" value={formatINR(r.recurringMonthly)} />
                <Divider />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-sub">Total Monthly Cost</span>
                  <span className="text-lg font-semibold text-ink">{formatINR(r.totalMonthlyCost)}</span>
                </div>
              </div>
              <div className="rounded-lg border border-line p-4">
                <div className="mb-3 text-sm font-semibold text-ink">Rental Benefit</div>
                <Line3 label="Estimated rent" value={formatINR(r.monthlyRent)} />
                <Line3 label="Vacancy adjustment" value={`− ${formatINR(vacancyAdj)}`} />
                <Line3 label="Rental expenses" value={`− ${formatINR(rentalExpMonthly)}`} />
                <Divider />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-sub">Net Rental Benefit</span>
                  <span className="text-lg font-semibold text-ink">{formatINR(r.netMonthlyRentalBenefit)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-brand p-5 text-white">
              <div className="text-xs uppercase tracking-wide text-white/70">Estimated Net Monthly Outflow</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold">{formatINR(r.netMonthlyOutflow)}</span>
                <span className="text-sm text-white/70">per month</span>
              </div>
              <div className="mt-2 text-xs text-white/70">Total Monthly Property Cost − Net Rental Benefit</div>
            </div>
          </Section>

          {/* Yearly analysis */}
          <Section title="Yearly Property Analysis" subtitle="Projection over your selected horizon.">
            <YearlyAnalysis inputs={inputs} set={set} r={r} />
          </Section>
        </>
      )}
    </div>
  );
}

function YearlyAnalysis({ inputs, set, r }) {
  const period = Math.max(num(inputs.projection_years) || 0, 5);
  const data = r.yearly.filter((d) => d.year <= period);
  return (
    <>
      <div className="mb-4 max-w-[200px]">
        <Field label="Projection Period">
          <ChoiceInput value={inputs.projection_years} onChange={(v) => set("projection_years", v)} options={PROJECTION_OPTIONS} suffix=" yrs" renderOption={(o) => `${o} years`} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Property Value vs Remaining Loan">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E7EF" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#718096" }} tickFormatter={(y) => `Yr ${y}`} />
            <YAxis tick={{ fontSize: 11, fill: "#718096" }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={55} />
            <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} contentStyle={{ borderRadius: 8, border: "1px solid #E2E7EF", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="propertyValue" name="Property Value" stroke="#18233A" fill="#18233A" fillOpacity={0.08} />
            <Area type="monotone" dataKey="loanBalance" name="Loan Balance" stroke="#52627A" fill="#52627A" fillOpacity={0.08} />
          </AreaChart>
        </ChartCard>
        <ChartCard title="Annual Rental Income vs Property Cost">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E7EF" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#718096" }} tickFormatter={(y) => `Yr ${y}`} />
            <YAxis tick={{ fontSize: 11, fill: "#718096" }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={55} />
            <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} contentStyle={{ borderRadius: 8, border: "1px solid #E2E7EF", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="annualRentalIncome" name="Rental Income" stroke="#2F8F83" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="annualPropertyCost" name="Property Cost" stroke="#C58B32" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartCard>
      </div>
      <Divider label="Yearly breakdown" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-sub">
              <th className="py-2 pr-3 font-medium">Year</th>
              <th className="py-2 pr-3 font-medium">Property Value</th>
              <th className="py-2 pr-3 font-medium">Loan Balance</th>
              <th className="py-2 pr-3 font-medium">Annual EMI</th>
              <th className="py-2 pr-3 font-medium">Property Cost</th>
              <th className="py-2 pr-3 font-medium">Rental Income</th>
              <th className="py-2 pr-3 font-medium">Net Outflow</th>
              <th className="py-2 font-medium">Equity</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.year} className="border-b border-line/50">
                <td className="py-2 pr-3 font-medium text-ink">{d.year}</td>
                <td className="py-2 pr-3 text-ink">{formatCompact(d.propertyValue)}</td>
                <td className="py-2 pr-3 text-ink">{formatCompact(d.loanBalance)}</td>
                <td className="py-2 pr-3 text-ink">{formatCompact(d.annualEmiPaid)}</td>
                <td className="py-2 pr-3 text-ink">{formatCompact(d.annualPropertyCost)}</td>
                <td className="py-2 pr-3 text-ok">{formatCompact(d.annualRentalIncome)}</td>
                <td className="py-2 pr-3 text-ink">{formatCompact(d.annualNetOutflow)}</td>
                <td className="py-2 font-semibold text-ink">{formatCompact(d.equity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="mb-2 text-xs font-medium text-sub">{title}</div>
      <ResponsiveContainer width="100%" height={200}>{children}</ResponsiveContainer>
    </div>
  );
}

function Line3({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-sub">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

function incomeReq(r) {
  if (r.incomeBurden < 25) return "Moderate income";
  if (r.incomeBurden < 40) return "Higher income";
  if (r.incomeBurden < 55) return "High income";
  return "Very high income";
}
function capitalReq(r) {
  if (r.surplusSavings > 0) return "comfortable initial capital";
  if (r.fundingGap > 0) return "additional capital needed";
  return "sufficient initial capital";
}