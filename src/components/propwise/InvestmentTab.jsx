import React, { useState } from "react";
import { Field, NumberInput, PercentInput, Select, Section, ResultCard, Stat, Pill, Divider } from "@/components/propwise/ui";
import { formatINR, formatCompact, formatPct, PROJECTION_OPTIONS, buildScenarios } from "@/lib/finance";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from "recharts";

export default function InvestmentTab({ inputs, set, r }) {
  const scenarios = buildScenarios(inputs);
  const projectionYears = inputs.projection_years || 20;
  const yearlyData = r.yearly.filter((d) => d.year <= projectionYears);

  return (
    <div className="space-y-5">
      {/* SECTION A — SUITABLE PROFILE */}
      <Section title="Who Should Consider This Property?" subtitle="A financial profile — not advice for a specific person">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="text-sm text-slate-600">This property may be more suitable for someone who:</p>
            <ul className="mt-3 space-y-2">
              {[
                "Has sufficient initial capital for the down payment",
                "Has stable monthly income",
                "Can comfortably handle the estimated monthly property cost",
                "Has sufficient funds remaining after the down payment",
                "Can sustain the expected loan tenure",
                "Is comfortable with the investment horizon",
              ].map((t, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Example profile</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ProfileStat label="Income Level" value={incomeLevelLabel(r)} />
              <ProfileStat label="Initial Capital" value={capitalLabel(r)} />
              <ProfileStat label="Monthly Commitment" value={r.level.label.replace(" commitment", "")} />
              <ProfileStat label="Investment Horizon" value={`${inputs.loan_tenure_years} years (long term)`} />
              <ProfileStat label="Risk / Assumption Sensitivity" value={sensitivityLabel(inputs)} />
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION B — RENTAL INPUTS */}
      <Section title="Rental Analysis" subtitle="Optional — what happens if you rent it out?">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Expected Monthly Rent" hint="e.g. ₹90,000">
            <NumberInput value={inputs.monthly_rent} onChange={(v) => set("monthly_rent", v)} />
          </Field>
          <Field label="Annual Rent Increase">
            <PercentInput value={inputs.annual_rent_increase} onChange={(v) => set("annual_rent_increase", v)} />
          </Field>
          <Field label="Expected Vacancy">
            <PercentInput value={inputs.vacancy_rate} onChange={(v) => set("vacancy_rate", v)} />
          </Field>
          <Field label="Annual Rental Maintenance">
            <NumberInput value={inputs.annual_rental_maintenance} onChange={(v) => set("annual_rental_maintenance", v)} />
          </Field>
        </div>

        <Divider />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <ResultCard label="Monthly Rental Income" value={formatCompact(inputs.monthly_rent)} />
          <ResultCard label="Gross Annual Rent" value={formatCompact(r.grossAnnualRent)} />
          <ResultCard label="Effective Annual Rent" value={formatCompact(r.effectiveAnnualRent)} sub="after vacancy" />
          <ResultCard label="Gross Rental Yield" value={formatPct(r.grossYield)} />
          <ResultCard label="Net Annual Rental" value={formatCompact(r.netAnnualRental)} sub="after costs" />
          <ResultCard label="Net Rental Yield" value={formatPct(r.netYield)} />
          <ResultCard label="Net Monthly Benefit" value={formatCompact(r.netMonthlyRentalBenefit)} />
          <ResultCard label="Net Monthly Outflow" value={formatCompact(r.netMonthlyOutflow)} tone="soft" />
        </div>
      </Section>

      {/* MONTHLY COST vs RENTAL BENEFIT */}
      <Section title="Monthly Cost vs Rental Benefit" subtitle="Two-sided comparison">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-700">Monthly Cost</div>
            <Line2 label="EMI" value={formatINR(r.emi)} />
            <Line2 label="Maintenance" value={formatINR(r.monthlyMaintenance)} />
            <Line2 label="Other property costs" value={formatINR(r.otherMonthly)} />
            <Divider />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Total Monthly Cost</span>
              <span className="text-lg font-semibold text-slate-800">{formatINR(r.totalMonthlyCost)}</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-700">Monthly Rental Benefit</div>
            <Line2 label="Estimated rent" value={formatINR(inputs.monthly_rent)} />
            <Line2 label="Vacancy adjustment" value={`- ${formatINR(inputs.monthly_rent * (inputs.vacancy_rate / 100))}`} />
            <Line2 label="Other rental costs" value={`- ${formatINR(inputs.annual_rental_maintenance / 12)}`} />
            <Divider />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Net Monthly Rental Benefit</span>
              <span className="text-lg font-semibold text-slate-800">{formatINR(r.netMonthlyRentalBenefit)}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-slate-900 p-5 text-white">
          <div className="text-xs uppercase tracking-wide text-slate-300">Estimated Net Monthly Outflow</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{formatINR(r.netMonthlyOutflow)}</span>
            <span className="text-sm text-slate-300">per month</span>
          </div>
          <div className="mt-2 text-xs text-slate-300">
            Total Monthly Property Cost − Net Rental Benefit
          </div>
        </div>
      </Section>

      {/* YEARLY INVESTMENT ANALYSIS */}
      <Section
        title="Yearly Property Investment"
        subtitle="Projection over your selected horizon"
        right={
          <div className="w-40">
            <Select value={inputs.projection_years} onChange={(v) => set("projection_years", v)} options={PROJECTION_OPTIONS} />
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 p-3">
            <div className="mb-2 text-xs font-medium text-slate-500">Property Value vs Remaining Loan</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={yearlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={(y) => `Yr ${y}`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={50} />
                <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="propertyValue" name="Property Value" stroke="#0f172a" fill="#e2e8f0" />
                <Area type="monotone" dataKey="loanBalance" name="Loan Balance" stroke="#64748b" fill="#cbd5e1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-slate-100 p-3">
            <div className="mb-2 text-xs font-medium text-slate-500">Annual Rental Income vs Annual Property Cost</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={yearlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={(y) => `Yr ${y}`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={50} />
                <Tooltip formatter={(v) => formatINR(v)} labelFormatter={(y) => `Year ${y}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="annualRentalIncome" name="Rental Income" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="annualMaintenance" name="Annual Cost" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Divider label="Yearly breakdown" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3 font-medium">Year</th>
                <th className="py-2 pr-3 font-medium">Property Value</th>
                <th className="py-2 pr-3 font-medium">Loan Balance</th>
                <th className="py-2 pr-3 font-medium">EMI Paid</th>
                <th className="py-2 pr-3 font-medium">Maintenance</th>
                <th className="py-2 pr-3 font-medium">Rental Income</th>
                <th className="py-2 pr-3 font-medium">Net Outflow</th>
                <th className="py-2 font-medium">Equity</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((d) => (
                <tr key={d.year} className="border-b border-slate-50">
                  <td className="py-2 pr-3 font-medium text-slate-700">{d.year}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatCompact(d.propertyValue)}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatCompact(d.loanBalance)}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatCompact(d.annualEmiPaid)}</td>
                  <td className="py-2 pr-3 text-slate-600">{formatCompact(d.annualMaintenance)}</td>
                  <td className="py-2 pr-3 text-emerald-600">{formatCompact(d.annualRentalIncome)}</td>
                  <td className="py-2 pr-3 text-slate-700">{formatCompact(d.annualNetOutflow)}</td>
                  <td className="py-2 font-medium text-slate-800">{formatCompact(d.equity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* SCENARIO COMPARISON */}
      <Section title="Scenario Comparison" subtitle="Compare a few property-price scenarios at your current assumptions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3 font-medium">Metric</th>
                {scenarios.map((s) => (
                  <th key={s.label} className="py-2 pr-3 font-medium">
                    {s.label} <span className="block text-xs font-normal text-slate-400">{formatCompact(s.price)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Required initial money" data={scenarios} field="requiredInitial" />
              <CompareRow label="Loan amount" data={scenarios} field="loanAmount" />
              <CompareRow label="Monthly EMI" data={scenarios} field="emi" />
              <CompareRow label="Monthly property cost" data={scenarios} field="monthlyCost" />
              <CompareRow label="Rental income (net/mo)" data={scenarios} field="rentalIncome" />
              <CompareRow label="Net monthly outflow" data={scenarios} field="netMonthlyOutflow" />
              <CompareRow label="Value after 10 years" data={scenarios} field="valueAfter10" />
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Scenarios use 80%, 100% and 120% of your current property price, with all other inputs unchanged.
        </p>
      </Section>
    </div>
  );
}

function Line2({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

function ProfileStat({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-700">{value}</div>
    </div>
  );
}

function CompareRow({ label, data, field }) {
  return (
    <tr className="border-b border-slate-50">
      <td className="py-2 pr-3 text-slate-500">{label}</td>
      {data.map((s) => (
        <td key={s.label} className="py-2 pr-3 font-medium text-slate-700">{formatCompact(s[field])}</td>
      ))}
    </tr>
  );
}

function incomeLevelLabel(r) {
  const burden = r.incomeBurden;
  if (burden < 25) return "Moderate income OK";
  if (burden < 40) return "Higher income needed";
  if (burden < 55) return "High income needed";
  return "Very high income needed";
}
function capitalLabel(r) {
  if (r.surplusAfterDownPayment > 0) return "Comfortable";
  if (r.remainingRequired === 0) return "Sufficient";
  return "High requirement";
}
function sensitivityLabel(inputs) {
  const app = +inputs.annual_appreciation || 0;
  if (app >= 8) return "High (optimistic)";
  if (app <= 3) return "High (conservative)";
  return "Medium";
}