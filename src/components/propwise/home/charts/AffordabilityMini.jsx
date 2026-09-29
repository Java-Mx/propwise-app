import React from "react";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme } from "@/lib/chartTheme";
import { formatINR, formatCompact, num } from "@/lib/finance";
import { demoAffordability } from "@/lib/demoData";
import { IllustrativePill, Ring, SegmentedBar, LegendDot, BreakdownRow } from "./primitives";
import { useIsMobile } from "@/hooks/use-mobile";

// "Can I afford it?" — income allocation visual.
// Desktop: rounded segmented allocation bar + large focal commitment %.
// Mobile: commitment ring + compact breakdown.
export default function AffordabilityMini() {
  const { r } = useAnalysis();
  const t = useChartTheme();
  const isMobile = useIsMobile();

  const income = num(r.monthlyIncome);
  const illustrative = income <= 0;
  const d = illustrative
    ? demoAffordability()
    : {
        income,
        property: num(r.totalMonthlyCost),
        existing: num(r.existingEmi),
        remaining: Math.max(income - num(r.totalMonthlyCost) - num(r.existingEmi), 0),
      };

  const propPct = d.income > 0 ? d.property / d.income : 0;
  const otherPct = d.income > 0 ? d.existing / d.income : 0;
  const remPct = Math.max(1 - propPct - otherPct, 0);
  const pct = Math.min(Math.round((propPct + otherPct) * 100), 100);

  const segments = [
    { label: "Property", value: propPct, color: t.series.emi },
    ...(d.existing > 0 ? [{ label: "Other", value: otherPct, color: t.series.other }] : []),
    { label: "Remaining", value: remPct, color: t.series.equity },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-sub">Income allocation</span>
        {illustrative && <IllustrativePill />}
      </div>

      <div className="mt-1.5">
        <div className="text-2xl font-bold text-ink">{formatCompact(d.income)}</div>
        <div className="text-xs text-sub">{illustrative ? "example monthly income" : "monthly income"}</div>
      </div>

      {isMobile ? (
        <div className="mt-4 flex flex-col items-center">
          <Ring
            size={132}
            stroke={14}
            trackColor={t.grid}
            segments={[{ value: pct / 100, color: t.series.equity }]}
            centerMain={`${pct}%`}
            centerBottom="Committed"
            centerMainClass="text-jade"
          />
          <div className="mt-3 w-full space-y-1.5 text-sm">
            <BreakdownRow label="Property commitment" value={formatINR(d.property)} color={t.series.emi} />
            {d.existing > 0 && <BreakdownRow label="Other commitments" value={formatINR(d.existing)} color={t.series.other} />}
            <BreakdownRow label="Remaining" value={formatINR(d.remaining)} color={t.series.equity} />
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <SegmentedBar segments={segments} />
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {segments.map((s, i) => (
              <LegendDot key={i} color={s.color} label={s.label} value={`${Math.round(s.value * 100)}%`} />
            ))}
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-bold leading-none text-jade">{pct}%</span>
            <span className="mb-1 text-xs text-sub">Property commitment</span>
          </div>
        </div>
      )}

      {illustrative && <p className="mt-3 text-[11px] text-sub">Illustrative example — not your data.</p>}
    </div>
  );
}