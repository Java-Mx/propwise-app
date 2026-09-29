import React, { useMemo } from "react";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme } from "@/lib/chartTheme";
import { formatINR, num, monthlyEquiv } from "@/lib/finance";
import { demoCost } from "@/lib/demoData";
import { IllustrativePill, Ring, BreakdownRow } from "./primitives";
import { useIsMobile } from "@/hooks/use-mobile";

const MAINT_CATS = ["Maintenance", "Society Charges", "Property Management", "Maintenance Reserve"];

// "What will it really cost?" — large cost-composition donut (EMI/Maintenance/Other)
// with a dominant total in the center and a properly aligned breakdown.
export default function CostMini() {
  const { r, inputs } = useAnalysis();
  const t = useChartTheme();
  const isMobile = useIsMobile();

  const { emi, maintenance, other } = useMemo(() => {
    const costs = Array.isArray(inputs.costs) ? inputs.costs : [];
    let maint = 0, rest = 0;
    costs.forEach((c) => {
      if (!c.frequency || c.frequency === "One-Time") return;
      const m = monthlyEquiv(c.amount, c.frequency);
      if (MAINT_CATS.includes(c.category)) maint += m;
      else rest += m;
    });
    return { emi: num(r.emi), maintenance: maint, other: rest };
  }, [inputs.costs, r.emi]);

  const total = emi + maintenance + other;
  const illustrative = total <= 0;
  const d = illustrative ? demoCost() : { emi, maintenance, other, total };

  const emiPct = d.total > 0 ? d.emi / d.total : 0;
  const maintPct = d.total > 0 ? d.maintenance / d.total : 0;
  const otherPct = d.total > 0 ? d.other / d.total : 0;

  const ringSegments = [
    { value: emiPct, color: t.series.emi },
    { value: maintPct, color: t.series.maintenance },
    { value: otherPct, color: t.series.other },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-sub">Monthly ownership cost</span>
        {illustrative && <IllustrativePill />}
      </div>

      <div className="mt-4 flex flex-col items-center">
        <Ring
          size={isMobile ? 196 : 218}
          stroke={18}
          trackColor={t.grid}
          segments={ringSegments}
          centerMain={formatINR(d.total)}
          centerMainClass="text-ink text-xl"
          centerBottom="per month"
        />
        <div className="mt-4 w-full space-y-2.5">
          <BreakdownRow label="EMI" value={formatINR(d.emi)} color={t.series.emi} />
          <BreakdownRow label="Maintenance" value={formatINR(d.maintenance)} color={t.series.maintenance} />
          <BreakdownRow label="Other" value={formatINR(d.other)} color={t.series.other} />
        </div>
      </div>

      <p className="mt-4 text-xs text-sub">
        <span className="font-semibold tabular-nums text-ink">{Math.round(emiPct * 100)}%</span> of monthly ownership cost is EMI
      </p>

      {illustrative && <p className="mt-2 text-[11px] text-sub">Illustrative example — not your data.</p>}
    </div>
  );
}