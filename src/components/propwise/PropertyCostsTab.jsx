import React from "react";
import { Field, NumberInput, Section, ResultCard, Stat, Divider } from "@/components/propwise/ui";
import { formatINR, formatCompact } from "@/lib/finance";

export default function PropertyCostsTab({ inputs, set, r }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* MONTHLY COSTS */}
        <Section title="Monthly Costs" subtitle="Recurring monthly expenses">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Maintenance fee">
              <NumberInput value={inputs.monthly_maintenance} onChange={(v) => set("monthly_maintenance", v)} />
            </Field>
            <Field label="Society charges">
              <NumberInput value={inputs.society_charges} onChange={(v) => set("society_charges", v)} />
            </Field>
            <Field label="Parking">
              <NumberInput value={inputs.parking} onChange={(v) => set("parking", v)} />
            </Field>
            <Field label="Property management">
              <NumberInput value={inputs.property_management} onChange={(v) => set("property_management", v)} />
            </Field>
            <Field label="Insurance (monthly)">
              <NumberInput value={inputs.insurance_monthly} onChange={(v) => set("insurance_monthly", v)} />
            </Field>
            <Field label="Other monthly expenses">
              <NumberInput value={inputs.other_monthly} onChange={(v) => set("other_monthly", v)} />
            </Field>
          </div>
        </Section>

        {/* ANNUAL COSTS */}
        <Section title="Annual Costs" subtitle="Costs paid once a year">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Property tax">
              <NumberInput value={inputs.property_tax} onChange={(v) => set("property_tax", v)} />
            </Field>
            <Field label="Insurance (annual)">
              <NumberInput value={inputs.insurance_annual} onChange={(v) => set("insurance_annual", v)} />
            </Field>
            <Field label="Repairs">
              <NumberInput value={inputs.repairs} onChange={(v) => set("repairs", v)} />
            </Field>
            <Field label="Maintenance reserve">
              <NumberInput value={inputs.maintenance_reserve} onChange={(v) => set("maintenance_reserve", v)} />
            </Field>
            <Field label="Other annual costs">
              <NumberInput value={inputs.other_annual} onChange={(v) => set("other_annual", v)} />
            </Field>
          </div>
        </Section>
      </div>

      {/* ONE-TIME */}
      <Section title="One-Time Costs" subtitle="Upfront costs at purchase">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Registration">
            <NumberInput value={inputs.registration} onChange={(v) => set("registration", v)} />
          </Field>
          <Field label="Stamp duty">
            <NumberInput value={inputs.stamp_duty} onChange={(v) => set("stamp_duty", v)} />
          </Field>
          <Field label="Brokerage">
            <NumberInput value={inputs.brokerage} onChange={(v) => set("brokerage", v)} />
          </Field>
          <Field label="Interior / Furnishing">
            <NumberInput value={inputs.furnishing} onChange={(v) => set("furnishing", v)} />
          </Field>
          <Field label="Moving costs">
            <NumberInput value={inputs.moving} onChange={(v) => set("moving", v)} />
          </Field>
          <Field label="Other purchase costs">
            <NumberInput value={inputs.other_one_time} onChange={(v) => set("other_one_time", v)} />
          </Field>
        </div>
      </Section>

      {/* COST SUMMARY */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Section title="Monthly Cost">
          <Line label="EMI" value={formatINR(r.emi)} />
          <Line label="Maintenance" value={formatINR(r.monthlyMaintenance)} />
          <Line label="Other recurring costs" value={formatINR(r.otherMonthly)} />
          <Divider />
          <Total label="Total Monthly Cost" value={formatINR(r.totalMonthlyCost)} />
        </Section>

        <Section title="Annual Cost">
          <Line label="Monthly costs × 12" value={formatINR(r.totalMonthlyCost * 12)} />
          <Line label="Annual property costs" value={formatINR(r.annualCostTotal)} />
          <Divider />
          <Total label="Estimated Annual Property Cost" value={formatINR(r.estimatedAnnualPropertyCost)} />
        </Section>

        <Section title="Initial Investment">
          <Line label="Down payment" value={formatINR(r.downPaymentNeeded)} />
          <Line label="Registration" value={formatINR(inputs.registration)} />
          <Line label="Stamp duty & taxes" value={formatINR((+inputs.stamp_duty || 0) + (+inputs.property_tax || 0))} />
          <Line label="Brokerage" value={formatINR(inputs.brokerage)} />
          <Line label="Furnishing" value={formatINR(inputs.furnishing)} />
          <Line label="Other one-time" value={formatINR((+inputs.moving || 0) + (+inputs.other_one_time || 0))} />
          <Divider />
          <Total label="Total Initial Cash Requirement" value={formatINR(r.totalInitialCash)} />
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ResultCard label="Total Monthly Cost" value={formatCompact(r.totalMonthlyCost)} sub="per month" tone="soft" />
        <ResultCard label="Annual Property Cost" value={formatCompact(r.estimatedAnnualPropertyCost)} sub="per year" tone="soft" />
        <ResultCard label="Initial Cash Required" value={formatCompact(r.totalInitialCash)} sub="upfront" tone="soft" />
      </div>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

function Total({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-white">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-base font-semibold">{value}</span>
    </div>
  );
}