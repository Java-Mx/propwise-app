import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme, tooltipStyle } from "@/lib/chartTheme";
import { formatINR, formatCompact, num } from "@/lib/finance";
import { demoAffordability } from "@/lib/demoData";
import ChartCard from "@/components/propwise/charts/ChartCard";
import MiniEmpty from "@/components/propwise/home/charts/MiniEmpty";
import { Wallet } from "lucide-react";

// "Can I afford it?" — horizontal stacked composition of monthly income:
// Property Commitment (navy) + Existing Obligations (slate) + Remaining (teal).
// When the user has entered no income, an ILLUSTRATIVE example is shown instead.
export default function AffordabilityMini() {
  const { r } = useAnalysis();
  const t = useChartTheme();

  const income = num(r.monthlyIncome);
  const propertyCommitment = num(r.totalMonthlyCost);
  const existing = num(r.existingEmi);
  const totalCommitment = propertyCommitment + existing;
  const remaining = Math.max(income - totalCommitment, 0);
  const pct = income > 0 ? (totalCommitment / income) * 100 : 0;

  // --- Illustrative example when no user data ---
  if (income <= 0) {
    const d = demoAffordability();
    const data = [{ name: "Income", property: d.property, existing: d.existing, remaining: d.remaining }];
    const domainMax = Math.max(d.income, 1);
    return (
      <div>
        <ChartCard illustrative>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <XAxis type="number" hide domain={[0, domainMax]} />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                cursor={false}
                contentStyle={tooltipStyle(t)}
                formatter={(value, name) => [formatINR(value), name]}
                labelFormatter={() => "Illustrative monthly income"}
              />
              <Bar dataKey="property" stackId="a" name="Property Commitment" fill={t.series.emi} radius={[6, 0, 0, 6]} maxBarSize={34} />
              <Bar dataKey="remaining" stackId="a" name="Remaining Income" fill={t.series.equity} radius={[0, 6, 6, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-xs text-sub">Example income</div>
            <div className="text-sm font-semibold text-ink">{formatINR(d.income)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-sub">Example commitment</div>
            <div className="text-2xl font-bold text-jade">{Math.round(d.pct)}%</div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-sub">Illustrative example — not your data.</p>
      </div>
    );
  }

  // --- Real data ---
  const domainMax = Math.max(income, totalCommitment, 1);
  const data = [{ name: "Income", property: propertyCommitment, existing, remaining }];

  return (
    <>
      <div className="flex h-[200px] flex-col justify-center gap-3 rounded-xl border border-line bg-pagebg p-3">
        <ResponsiveContainer width="100%" height={116}>
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, domainMax]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              cursor={false}
              contentStyle={tooltipStyle(t)}
              formatter={(value, name) => [formatINR(value), name]}
              labelFormatter={() => "Monthly income"}
            />
            <Bar dataKey="property" stackId="a" name="Property Commitment" fill={t.series.emi} radius={[6, 0, 0, 6]} maxBarSize={32} />
            {existing > 0 && <Bar dataKey="existing" stackId="a" name="Existing Obligations" fill={t.series.other} maxBarSize={32} />}
            <Bar dataKey="remaining" stackId="a" name="Remaining Income" fill={t.series.equity} radius={[0, 6, 6, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
          <Legend color={t.series.emi} label="Property" value={formatCompact(propertyCommitment)} />
          {existing > 0 && <Legend color={t.series.other} label="Obligations" value={formatCompact(existing)} />}
          <Legend color={t.series.equity} label="Remaining" value={formatCompact(remaining)} />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-xs text-sub">Monthly income</div>
          <div className="text-sm font-semibold text-ink">{formatINR(income)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-sub">Income committed</div>
          <div className="text-2xl font-bold text-jade">{Math.round(pct)}%</div>
        </div>
      </div>
    </>
  );
}

function Legend({ color, label, value }) {
  return (
    <span className="flex items-center gap-1.5 text-sub">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} /> {label} {value}
    </span>
  );
}