import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme, tooltipStyle } from "@/lib/chartTheme";
import { formatINR, formatCompact, num } from "@/lib/finance";
import MiniEmpty from "@/components/propwise/home/charts/MiniEmpty";
import { Wallet } from "lucide-react";

// "How much of my income goes toward this property?"
// A single stacked horizontal bar: Property commitment (navy) + Remaining income (teal),
// computed from the live analysis. Empty state when no income is entered.
export default function AffordabilityMini() {
  const { r } = useAnalysis();
  const t = useChartTheme();

  const income = num(r.monthlyIncome);
  const commitment = num(r.totalMonthlyCommitment);
  const remaining = Math.max(income - commitment, 0);

  if (income <= 0) {
    return <MiniEmpty title="Enter income and loan details to calculate." sub="Affordability appears once you add an income." icon={Wallet} />;
  }

  const pct = income > 0 ? (commitment / income) * 100 : 0;
  const data = [{ name: "Income", commitment, remaining, income }];

  return (
    <div>
      <div className="rounded-xl border border-line bg-pagebg p-3">
        <ResponsiveContainer width="100%" height={104}>
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              cursor={false}
              contentStyle={tooltipStyle(t)}
              formatter={(value, name) => [formatINR(value), name]}
              labelFormatter={() => "Monthly income split"}
            />
            <Bar dataKey="commitment" stackId="a" name="Property commitment" fill={t.series.emi} radius={[6, 0, 0, 6]} maxBarSize={34} />
            <Bar dataKey="remaining" stackId="a" name="Remaining income" fill={t.series.equity} radius={[0, 6, 6, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-sub">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: t.series.emi }} /> Income {formatCompact(income)}
        </span>
        <span className="flex items-center gap-1.5 text-sub">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: t.series.equity }} /> Remaining {formatCompact(remaining)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-sm">
        <span className="text-sub">Commitment</span>
        <span className="font-semibold text-ink">{Math.round(pct)}%</span>
      </div>

      <ChartFooter text="Calculated from your income, EMI and monthly costs." />
      <p className="sr-only" role="note">
        At current inputs, monthly income is {formatINR(income)}, total property commitment is {formatINR(commitment)}, leaving {formatINR(remaining)} remaining. Commitment is {Math.round(pct)} percent of income.
      </p>
    </div>
  );
}

export function ChartFooter({ text }) {
  return <p className="mt-2 text-[10px] text-sub/70">{text}</p>;
}