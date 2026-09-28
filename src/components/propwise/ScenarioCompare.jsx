import React, { useState } from "react";
import { Field, NumberInput, Select, ChoiceInput, Section, ResultCard, Stat, Divider, Button, Alert } from "@/components/propwise/ui";
import {
  formatINR, formatCompact, formatPct,
  RENT_GROWTH_OPTIONS, VACANCY_OPTIONS,
  computeScenarioSummary, num,
} from "@/lib/finance";
import { Plus, Trash2, Scale } from "lucide-react";

export default function ScenarioCompare({ inputs, set }) {
  const scenarios = inputs.scenarios || [];
  const appreciation = num(inputs.annual_appreciation) || 5;

  const addScenario = () => {
    if (scenarios.length >= 3) return;
    const labels = ["Scenario A", "Scenario B", "Scenario C"];
    const next = {
      label: labels[scenarios.length],
      property_price: "", amount_saved: "", home_loan_percentage: "",
      interest_rate: "", loan_tenure_years: "", monthly_rent: "",
    };
    set("scenarios", [...scenarios, next]);
  };
  const updateScenario = (idx, patch) => set("scenarios", scenarios.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const removeScenario = (idx) => set("scenarios", scenarios.filter((_, i) => i !== idx));

  const summaries = scenarios.map((s) => computeScenarioSummary(s, appreciation));

  return (
    <Section title="Scenario Comparison" subtitle="Compare up to 3 property scenarios side by side." right={
      <Button variant="secondary" size="sm" icon={Plus} onClick={addScenario} disabled={scenarios.length >= 3}>Add Scenario</Button>
    }>
      {scenarios.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-appbg px-4 py-10 text-center">
          <Scale className="mx-auto mb-2 h-6 w-6 text-sub/60" />
          <p className="text-sm text-sub">No scenarios added yet. Add up to 3 to compare.</p>
          <Button variant="primary" size="md" icon={Plus} className="mt-4" onClick={addScenario}>Add Scenario</Button>
        </div>
      ) : (
        <>
          {/* Inputs per scenario */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {scenarios.map((s, idx) => (
              <div key={idx} className="rounded-lg border border-line p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{s.label}</span>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => removeScenario(idx)} aria-label="Remove scenario" />
                </div>
                <div className="space-y-3">
                  <Field label="Property Price"><NumberInput value={s.property_price} onChange={(v) => updateScenario(idx, { property_price: v })} /></Field>
                  <Field label="Savings"><NumberInput value={s.amount_saved} onChange={(v) => updateScenario(idx, { amount_saved: v })} /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Loan %"><ChoiceInput value={s.home_loan_percentage} onChange={(v) => updateScenario(idx, { home_loan_percentage: v })} options={[50, 60, 70, 75, 80, 85, 90]} /></Field>
                    <Field label="Tenure"><Select value={s.loan_tenure_years} onChange={(v) => updateScenario(idx, { loan_tenure_years: v })} options={[5, 10, 15, 20, 25, 30]} placeholder="Select" /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Interest"><ChoiceInput value={s.interest_rate} onChange={(v) => updateScenario(idx, { interest_rate: v })} options={[6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]} /></Field>
                    <Field label="Rent"><NumberInput value={s.monthly_rent} onChange={(v) => updateScenario(idx, { monthly_rent: v })} /></Field>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <Divider label="Comparison" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-sub">
                  <th className="py-2 pr-4 font-medium">Metric</th>
                  {summaries.map((s, i) => (
                    <th key={i} className="py-2 pr-4 font-medium">{scenarios[i].label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="Property price" summaries={summaries} field="price" />
                <Row label="Down payment" summaries={summaries} field="downPayment" />
                <Row label="Loan" summaries={summaries} field="loan" />
                <Row label="EMI" summaries={summaries} field="emi" />
                <Row label="Monthly cost" summaries={summaries} field="monthlyCost" />
                <Row label="Rental benefit" summaries={summaries} field="rentalBenefit" />
                <Row label="Net monthly outflow" summaries={summaries} field="netOutflow" />
                <Row label="Value after 10 years" summaries={summaries} field="valueAfter10" />
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-sub">Rental benefit assumes 5% vacancy. Future value uses your current appreciation assumption ({formatPct(appreciation)}).</p>
        </>
      )}
    </Section>
  );
}

function Row({ label, summaries, field }) {
  return (
    <tr className="border-b border-line/50">
      <td className="py-2 pr-4 text-sub">{label}</td>
      {summaries.map((s, i) => (
        <td key={i} className="py-2 pr-4 font-medium text-ink">{formatCompact(s[field])}</td>
      ))}
    </tr>
  );
}