import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme, tooltipStyle } from "@/lib/chartTheme";
import { formatINR, formatCompact, num } from "@/lib/finance";
import { demoProjection } from "@/lib/demoData";
import ChartCard from "@/components/propwise/charts/ChartCard";

const SPANS = [5, 10, 15, 20];

// "What happens over time?" — projection line chart (Property Value / Loan Balance / Equity).
// When the user has entered nothing, an ILLUSTRATIVE example is shown instead.
export default function InvestmentMini() {
  const { r } = useAnalysis();
  const t = useChartTheme();
  const maxYear = r.yearly.length || 0;
  const [span, setSpan] = useState(20);
  const [showAssumptions, setShowAssumptions] = useState(false);

  const horizon = Math.min(SPANS.includes(span) ? span : SPANS.find((s) => s <= maxYear) || 5, Math.max(maxYear, 5));

  const data = useMemo(() => {
    if (!r.hasInputs) return [];
    const base = [{ year: 0, propertyValue: Math.round(r.price), loanBalance: Math.round(r.actualLoan), equity: Math.round(r.price - r.actualLoan) }];
    r.yearly.filter((d) => d.year <= horizon).forEach((d) => {
      base.push({ year: d.year, propertyValue: d.propertyValue, loanBalance: d.loanBalance, equity: d.equity });
    });
    return base;
  }, [r.hasInputs, r.price, r.actualLoan, r.yearly, horizon]);

  // --- Illustrative example when no user data ---
  if (!r.hasInputs) {
    const demo = demoProjection();
    return (
      <div>
        <ChartCard illustrative label="Illustrative example — not your data">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={demo} margin={{ top: 4, right: 6, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: t.axis }} tickFormatter={(y) => `Yr ${y}`} stroke={t.grid} />
              <YAxis tick={{ fontSize: 10, fill: t.axis }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={42} stroke={t.grid} />
              <Tooltip
                contentStyle={tooltipStyle(t)}
                formatter={(value, name) => [formatINR(value), name]}
                labelFormatter={(y) => `Year ${y} · Illustrative`}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
              <Line type="monotone" dataKey="propertyValue" name="Property Value" stroke={t.series.value} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="loanBalance" name="Loan Balance" stroke={t.series.loan} strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
              <Line type="monotone" dataKey="equity" name="Estimated Equity" stroke={t.series.equity} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <SummaryStat label="Property" value={formatCompact(demo[demo.length - 1].propertyValue)} color={t.series.value} />
          <SummaryStat label="Loan" value={formatCompact(demo[demo.length - 1].loanBalance)} color={t.series.loan} />
          <SummaryStat label="Equity" value={formatCompact(demo[demo.length - 1].equity)} color={t.series.equity} emphasis />
        </div>
      </div>
    );
  }

  // --- Real data ---
  const last = data[data.length - 1] || {};

  return (
    <>
      <div className="flex h-[200px] flex-col rounded-xl border border-line bg-pagebg p-3">
        <div className="mb-2 inline-flex self-start rounded-lg border border-line bg-white p-0.5">
          {SPANS.map((y) => {
            const disabled = y > maxYear && maxYear > 0;
            const active = horizon === y;
            return (
              <button
                key={y}
                disabled={disabled}
                onClick={() => setSpan(y)}
                className={`h-7 rounded-md px-3 text-xs font-medium transition ${active ? "bg-jade text-white" : "text-sub hover:text-ink disabled:opacity-40 disabled:hover:text-sub"}`}
              >
                {y}Y
              </button>
            );
          })}
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 4, right: 6, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: t.axis }} tickFormatter={(y) => `Yr ${y}`} stroke={t.grid} />
            <YAxis tick={{ fontSize: 10, fill: t.axis }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={42} stroke={t.grid} />
            <Tooltip
              contentStyle={tooltipStyle(t)}
              formatter={(value, name) => [formatINR(value), name]}
              labelFormatter={(y) => `Year ${y}`}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            <Line type="monotone" dataKey="propertyValue" name="Property Value" stroke={t.series.value} strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="loanBalance" name="Loan Balance" stroke={t.series.loan} strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
            <Line type="monotone" dataKey="equity" name="Estimated Equity" stroke={t.series.equity} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-xs text-sub">At year {last.year}</div>
        <div className="grid grid-cols-3 gap-2">
          <SummaryStat label="Property" value={formatCompact(last.propertyValue)} color={t.series.value} />
          <SummaryStat label="Loan" value={formatCompact(last.loanBalance)} color={t.series.loan} />
          <SummaryStat label="Equity" value={formatCompact(last.equity)} color={t.series.equity} emphasis />
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[11px] text-sub">Based on your inputs</span>
          <button onClick={() => setShowAssumptions((s) => !s)} className="text-[11px] font-medium text-jade hover:underline">
            {showAssumptions ? "Hide assumptions" : "View assumptions"}
          </button>
        </div>
        {showAssumptions && (
          <div className="rounded-lg border border-line bg-pagebg p-2.5 text-[11px] leading-relaxed text-sub">
            Property value uses your appreciation rate; loan balance uses the amortization schedule; estimated equity = property value − remaining loan.
          </div>
        )}
      </div>
    </>
  );
}

function SummaryStat({ label, value, color, emphasis }) {
  return (
    <div className="rounded-lg border border-line bg-white px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-sub">
        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} /> {label}
      </div>
      <div className={`mt-1 text-sm font-semibold ${emphasis ? "text-jade" : "text-ink"}`}>{value}</div>
    </div>
  );
}