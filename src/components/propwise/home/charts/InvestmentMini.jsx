import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme, tooltipStyle } from "@/lib/chartTheme";
import { formatINR, formatCompact, num } from "@/lib/finance";
import MiniEmpty from "@/components/propwise/home/charts/MiniEmpty";
import { ChartFooter } from "@/components/propwise/home/charts/AffordabilityMini";
import { TrendingUp } from "lucide-react";

const SPANS = [5, 10, 15, 20];

// "How do property value, loan balance and equity change over time?"
// Multi-series projection using the same amortization + appreciation engine
// as the Investment page (r.yearly). Only years up to the chosen horizon show.
export default function InvestmentMini() {
  const { r } = useAnalysis();
  const t = useChartTheme();
  const maxYear = r.yearly.length || 0;
  const [span, setSpan] = useState(20);

  const horizon = Math.min(SPANS.includes(span) ? span : SPANS.find((s) => s <= maxYear) || 5, Math.max(maxYear, 5));

  const data = useMemo(() => {
    if (!r.hasInputs) return [];
    const base = [{ year: 0, propertyValue: Math.round(r.price), loanBalance: Math.round(r.actualLoan), equity: Math.round(r.price - r.actualLoan) }];
    r.yearly.filter((d) => d.year <= horizon).forEach((d) => {
      base.push({ year: d.year, propertyValue: d.propertyValue, loanBalance: d.loanBalance, equity: d.equity });
    });
    return base;
  }, [r.hasInputs, r.price, r.actualLoan, r.yearly, horizon]);

  if (!r.hasInputs) {
    return <MiniEmpty title="Enter your property details" sub="Your value, loan and equity projection will appear here." icon={TrendingUp} />;
  }

  const last = data[data.length - 1] || {};

  return (
    <div>
      <div className="no-scrollbar mb-2 flex gap-1.5">
        {SPANS.map((y) => {
          const disabled = y > maxYear && maxYear > 0;
          const active = horizon === y;
          return (
            <button
              key={y}
              disabled={disabled}
              onClick={() => setSpan(y)}
              className={`h-7 rounded-full px-2.5 text-xs font-medium transition ${active ? "bg-jade text-white" : "border border-line bg-white text-sub disabled:opacity-40"}`}
            >
              {y}Y
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-line bg-pagebg p-2">
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data} margin={{ top: 4, right: 6, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.grid} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: t.axis }} tickFormatter={(y) => `Yr ${y}`} stroke={t.grid} />
            <YAxis tick={{ fontSize: 10, fill: t.axis }} tickFormatter={(v) => formatCompact(v).replace("₹", "")} width={48} stroke={t.grid} />
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

      {last.year != null && (
        <p className="mt-2 text-xs text-sub">
          At year {last.year}: value {formatCompact(last.propertyValue)}, loan {formatCompact(last.loanBalance)}, equity {formatCompact(last.equity)}.
        </p>
      )}
      <ChartFooter text="Based on your inputs — value uses your appreciation rate, loan uses the amortization schedule, equity = value − loan." />
      <p className="sr-only" role="note">
        At year {last.year}, estimated property value is {formatINR(last.propertyValue)}, remaining loan is {formatINR(last.loanBalance)}, and estimated equity is {formatINR(last.equity)}.
      </p>
    </div>
  );
}