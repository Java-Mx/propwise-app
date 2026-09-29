import React from "react";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme } from "@/lib/chartTheme";
import { formatINR, formatCompact, num } from "@/lib/finance";
import { demoAffordability } from "@/lib/demoData";
import { IllustrativePill, Ring, Figure } from "./primitives";
import { useIsMobile } from "@/hooks/use-mobile";

// "Can I afford it?" — large radial allocation ring (committed vs remaining)
// with the example income and two aligned commitment figures.
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

  const ringSegments = [
    { value: pct / 100, color: t.series.equity },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-sub">Income allocation</span>
        {illustrative && <IllustrativePill />}
      </div>

      <div className="mt-3 flex justify-center">
        <Ring
          size={isMobile ? 184 : 210}
          stroke={16}
          trackColor={t.grid}
          segments={ringSegments}
          centerMain={`${pct}%`}
          centerMainClass="text-jade text-4xl"
          centerBottom="Property commitment"
        />
      </div>

      <div className="mt-5">
        <Figure label={illustrative ? "Example monthly income" : "Monthly income"} value={formatCompact(d.income)} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Figure label="Property commitment" value={formatINR(d.property)} />
        <Figure label="Remaining" value={formatINR(d.remaining)} className="text-right [&_div:first-child]:text-right" />
      </div>

      {illustrative && <p className="mt-3 text-[11px] text-sub">Illustrative example — not your data.</p>}
    </div>
  );
}