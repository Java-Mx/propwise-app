import React from "react";
import { Field, NumberInput, Select, Section, ResultCard, Divider, Button, Alert } from "@/components/propwise/ui";
import {
  formatINR, formatCompact, FREQUENCIES,
  MONTHLY_CATEGORIES, ANNUAL_CATEGORIES, ONETIME_CATEGORIES,
} from "@/lib/finance";
import { Plus, Trash2, Wallet, ChevronDown } from "lucide-react";

export default function PropertyCostsTab({ inputs, set, r }) {
  const costs = inputs.costs || [];

  const addCost = (section) => {
    const categoryList = section === "monthly" ? MONTHLY_CATEGORIES : section === "annual" ? ANNUAL_CATEGORIES : ONETIME_CATEGORIES;
    const frequency = section === "onetime" ? "One-Time" : section === "annual" ? "Yearly" : "Monthly";
    const item = { id: `c${Date.now()}${Math.random().toString(36).slice(2, 6)}`, section, category: categoryList[0], amount: "", frequency };
    set("costs", [...costs, item]);
  };
  const updateCost = (id, patch) => set("costs", costs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeCost = (id) => set("costs", costs.filter((c) => c.id !== id));

  const has = r.hasInputs;

  return (
    <div className="space-y-5">
      {!has && <Alert tone="info">Enter a property price in the Affordability tab to see cost totals alongside your loan.</Alert>}

      <CostSection
        id="costs-monthly"
        title="Monthly Costs"
        section="monthly"
        categories={MONTHLY_CATEGORIES}
        costs={costs}
        onAdd={() => addCost("monthly")}
        onUpdate={updateCost}
        onRemove={removeCost}
        allowFrequency
        defaultOpen
      />
      <CostSection
        id="costs-annual"
        title="Annual Costs"
        section="annual"
        categories={ANNUAL_CATEGORIES}
        costs={costs}
        onAdd={() => addCost("annual")}
        onUpdate={updateCost}
        onRemove={removeCost}
        allowFrequency
        defaultOpen={false}
      />
      <CostSection
        id="costs-onetime"
        title="One-Time Costs"
        section="onetime"
        categories={ONETIME_CATEGORIES}
        costs={costs}
        onAdd={() => addCost("onetime")}
        onUpdate={updateCost}
        onRemove={removeCost}
        defaultOpen={false}
      />

      {/* Totals */}
      {has && (
        <Section id="costs-summary" title="Cost Summary" subtitle="Totals across all added costs.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResultCard label="Total Monthly Cost" value={formatCompact(r.totalMonthlyCost)} sub="incl. EMI" tone="green" />
            <ResultCard label="Total Annual Cost" value={formatCompact(r.estimatedAnnualPropertyCost)} sub="monthly × 12" />
            <ResultCard label="One-Time Costs" value={formatCompact(r.oneTimeTotal)} />
            <ResultCard label="Initial Cash Required" value={formatCompact(r.totalInitialCash)} sub="down payment + one-time" />
          </div>
          <Divider />
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <SummaryLine label="EMI" value={formatINR(r.emi)} />
            <SummaryLine label="Recurring monthly costs" value={formatINR(r.recurringMonthly)} />
            <SummaryLine label="One-time costs" value={formatINR(r.oneTimeTotal)} />
            <SummaryLine label="Down payment" value={formatINR(r.downPayment)} />
          </div>
          <p className="mt-3 text-xs text-sub">Annual costs are normalised to a monthly equivalent and included in the total monthly cost.</p>
        </Section>
      )}
    </div>
  );
}

function CostSection({ id, title, section, categories, costs, onAdd, onUpdate, onRemove, allowFrequency, defaultOpen = true }) {
  const items = costs.filter((c) => c.section === section);
  const freqOptions = section === "onetime" ? ["One-Time"] : FREQUENCIES.filter((f) => f !== "One-Time");
  return (
    <Section
      id={id}
      title={title}
      subtitle={`Add the ${title.toLowerCase()} that apply to your purchase.`}
      collapsible
      defaultOpen={defaultOpen}
      right={<Button variant="primary" size="sm" icon={Plus} onClick={onAdd} className="hidden md:inline-flex">Add Cost</Button>}
    >
      <button
        onClick={onAdd}
        className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-jade text-sm font-semibold text-white active:scale-[0.98] md:hidden"
      >
        <Plus className="h-4 w-4" /> Add Cost
      </button>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-appbg px-4 py-8 text-center text-sm text-sub">
          <Wallet className="mx-auto mb-2 h-5 w-5 text-sub/60" />
          No {title.toLowerCase()} added yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((c) => (
            <div key={c.id} className="grid grid-cols-12 items-end gap-2">
              <div className="col-span-12 sm:col-span-5">
                <Field label="Category">
                  <Select value={c.category} onChange={(v) => onUpdate(c.id, { category: v })} options={categories} renderOption={(o) => o} />
                </Field>
              </div>
              <div className="col-span-7 sm:col-span-4">
                <Field label="Amount">
                  <NumberInput value={c.amount} onChange={(v) => onUpdate(c.id, { amount: v })} />
                </Field>
              </div>
              {allowFrequency && (
                <div className="col-span-5 sm:col-span-2">
                  <Field label="Frequency">
                    <Select value={c.frequency} onChange={(v) => onUpdate(c.id, { frequency: v })} options={freqOptions} renderOption={(o) => o} />
                  </Field>
                </div>
              )}
              <div className={allowFrequency ? "col-span-12 sm:col-span-1 flex justify-end" : "col-span-5 sm:col-span-1 flex justify-end"}>
                <Button variant="ghost" size="md" icon={Trash2} onClick={() => onRemove(c.id)} aria-label="Remove cost" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-sub">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}