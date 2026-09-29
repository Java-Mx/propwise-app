import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme } from "@/lib/chartTheme";
import { formatINR, formatCompact, num } from "@/lib/finance";
import { demoProjection } from "@/lib/demoData";
import { IllustrativePill, MetricPill } from "./primitives";
import { useIsMobile } from "@/hooks/use-mobile";

const SPANS = [5, 10, 15, 20];

// "What happens over time?" — axis-free wealth trajectory.
// Timeframe pills → large smooth graph → three updating metric cards (also the legend).
export default function InvestmentMini() {
  const { r } = useAnalysis();
  const t = useChartTheme();
  const isMobile = useIsMobile();
  const [span, setSpan] = useState(20);
  const illustrative = !r.hasInputs;

  const full = useMemo(() => {
    if (illustrative) return demoProjection();
    const base = [
      { year: 0, propertyValue: Math.round(r.price), loanBalance: Math.round(r.actualLoan), equity: Math.round(r.price - r.actualLoan) },
    ];
    r.yearly.forEach((d) =>
      base.push({ year: d.year, propertyValue: d.propertyValue, loanBalance: d.loanBalance, equity: d.equity })
    );
    return base;
  }, [illustrative, r.price, r.actualLoan, r.yearly]);

  const maxYear = full.length - 1;
  const horizon = Math.min(span, maxYear);
  const data = full.filter((d) => d.year <= horizon);
  const last = data[data.length - 1] || {};

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-sub">{horizon}-year projection</span>
        {illustrative && <IllustrativePill />}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {SPANS.map((y) => {
          const disabled = y > maxYear && maxYear > 0;
          const active = span === y;
          return (
            <button
              key={y}
              type="button"
              disabled={disabled}
              onClick={() => setSpan(y)}
              className={cn(
                "h-9 rounded-full px-3.5 text-xs font-medium transition",
                active ? "bg-jade text-white" : "border border-line text-sub hover:text-ink disabled:opacity-40 disabled:hover:text-sub"
              )}
            >
              {y}Y
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl bg-pagebg p-2" style={{ height: isMobile ? 232 : 272 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 10, left: 10, bottom: 4 }}>
            <XAxis dataKey="year" hide />
            <Tooltip content={<ProjTooltip t={t} illustrative={illustrative} />} offset={20} />
            <Line type="monotone" dataKey="propertyValue" stroke={t.series.value} strokeWidth={2.25} dot={false} isAnimationActive animationDuration={700} />
            <Line type="monotone" dataKey="loanBalance" stroke={t.series.loan} strokeWidth={2} dot={false} strokeDasharray="5 4" isAnimationActive animationDuration={800} animationBegin={120} />
            <Line type="monotone" dataKey="equity" stroke={t.series.equity} strokeWidth={2.75} dot={false} isAnimationActive animationDuration={900} animationBegin={220} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <MetricPill label="Property" value={formatCompact(last.propertyValue)} color={t.series.value} />
        <MetricPill label="Loan" value={formatCompact(last.loanBalance)} color={t.series.loan} />
        <MetricPill label="Equity" value={formatCompact(last.equity)} color={t.series.equity} emphasis />
      </div>

      {illustrative && <p className="mt-2 text-[11px] text-sub">Illustrative example — not your data.</p>}
    </div>
  );
}

function ProjTooltip({ active, payload, label, t, illustrative }) {
  if (!active || !payload || !payload.length) return null;
  const get = (k) => payload.find((p) => p.dataKey === k)?.value;
  return (
    <div
      className="rounded-lg p-2.5 text-xs shadow-lg"
      style={{ background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, color: t.tooltipText, minWidth: 150 }}
    >
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-sub">
        Year {label}{illustrative ? " · Illustrative" : ""}
      </div>
      <TipRow color={t.series.value} label="Property Value" value={formatINR(get("propertyValue"))} />
      <TipRow color={t.series.loan} label="Loan Balance" value={formatINR(get("loanBalance"))} />
      <TipRow color={t.series.equity} label="Equity" value={formatINR(get("equity"))} />
    </div>
  );
}

function TipRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}