import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme, tooltipStyle } from "@/lib/chartTheme";
import { formatINR, formatCompact, num, monthlyEquiv } from "@/lib/finance";
import MiniEmpty from "@/components/propwise/home/charts/MiniEmpty";
import { ChartFooter } from "@/components/propwise/home/charts/AffordabilityMini";
import { Receipt } from "lucide-react";

const MAINT_CATS = ["Maintenance", "Society Charges", "Property Management", "Maintenance Reserve"];

// "Where does my monthly property cost come from?"
// Stacked bar of EMI / Maintenance / Other, all from the live analysis.
export default function CostMini() {
  const { r, inputs } = useAnalysis();
  const t = useChartTheme();

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

  if (total <= 0) {
    return <MiniEmpty title="Add property costs to see the breakdown." sub="EMI and costs appear once entered." icon={Receipt} />;
  }

  const data = [{ name: "Monthly", emi, maintenance, other }];
  const partial = maintenance === 0 && other === 0;

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
              labelFormatter={() => "Monthly cost composition"}
            />
            <Bar dataKey="emi" stackId="a" name="EMI" fill={t.series.emi} radius={[6, 0, 0, 6]} maxBarSize={34} />
            <Bar dataKey="maintenance" stackId="a" name="Maintenance" fill={t.series.maintenance} maxBarSize={34} />
            <Bar dataKey="other" stackId="a" name="Other" fill={t.series.other} radius={[0, 6, 6, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <Legend color={t.series.emi} label="EMI" value={formatCompact(emi)} />
        <Legend color={t.series.maintenance} label="Maint" value={formatCompact(maintenance)} />
        <Legend color={t.series.other} label="Other" value={formatCompact(other)} />
        <span className="ml-auto text-sm font-semibold text-ink">{formatCompact(total)}/mo</span>
      </div>

      {partial && <p className="mt-1.5 text-xs text-sub">Add property costs to complete this breakdown.</p>}
      <ChartFooter text="Calculated from your loan EMI and entered costs." />
      <p className="sr-only" role="note">
        Total monthly cost is {formatINR(total)}, made up of EMI {formatINR(emi)}, maintenance {formatINR(maintenance)} and other costs {formatINR(other)}.
      </p>
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <span className="flex items-center gap-1.5 text-sub">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} /> {label} {value}
    </span>
  );
}