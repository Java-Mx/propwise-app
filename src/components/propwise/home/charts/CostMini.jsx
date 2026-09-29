import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme, tooltipStyle } from "@/lib/chartTheme";
import { formatINR, formatCompact, num, monthlyEquiv } from "@/lib/finance";
import { demoCost } from "@/lib/demoData";
import ChartCard from "@/components/propwise/charts/ChartCard";
import { Receipt } from "lucide-react";

const MAINT_CATS = ["Maintenance", "Society Charges", "Property Management", "Maintenance Reserve"];

// "What will it really cost?" — stacked horizontal bar of EMI / Maintenance / Other.
// When the user has entered no costs, an ILLUSTRATIVE example is shown instead.
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
  const pctOf = (v) => (total > 0 ? (v / total) * 100 : 0);
  const tipFormatter = (value, name) => [`${formatINR(value)} · ${pctOf(value).toFixed(1)}% of monthly cost`, name];

  // --- Illustrative example when no user data ---
  if (total <= 0) {
    const d = demoCost();
    const data = [{ name: "Monthly", emi: d.emi, maintenance: d.maintenance, other: d.other }];
    const dpctOf = (v) => (d.total > 0 ? (v / d.total) * 100 : 0);
    return (
      <div>
        <ChartCard illustrative>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <XAxis type="number" hide domain={[0, d.total || 1]} />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip
                cursor={false}
                contentStyle={tooltipStyle(t)}
                formatter={(value, name) => [`${formatINR(value)} · ${dpctOf(value).toFixed(1)}%`, name]}
                labelFormatter={() => "Illustrative monthly cost"}
              />
              <Bar dataKey="emi" stackId="a" name="EMI" fill={t.series.emi} radius={[6, 0, 0, 6]} maxBarSize={34} />
              <Bar dataKey="maintenance" stackId="a" name="Maintenance" fill={t.series.maintenance} maxBarSize={34} />
              <Bar dataKey="other" stackId="a" name="Other" fill={t.series.other} radius={[0, 6, 6, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
          <Legend color={t.series.emi} label="EMI" value={formatCompact(d.emi)} />
          <Legend color={t.series.maintenance} label="Maintenance" value={formatCompact(d.maintenance)} />
          <Legend color={t.series.other} label="Other" value={formatCompact(d.other)} />
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div className="text-xs text-sub">Illustrative monthly cost</div>
          <div className="text-2xl font-bold text-ink">
            {formatINR(d.total)}<span className="ml-1 text-sm font-medium text-sub">/mo</span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-sub">Illustrative example — not your data.</p>
      </div>
    );
  }

  // --- Real data ---
  const data = [{ name: "Monthly", emi, maintenance, other }];

  return (
    <>
      <div className="flex h-[200px] flex-col justify-center gap-3 rounded-xl border border-line bg-pagebg p-3">
        <ResponsiveContainer width="100%" height={116}>
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, total || 1]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              cursor={false}
              contentStyle={tooltipStyle(t)}
              formatter={tipFormatter}
              labelFormatter={() => "Monthly cost composition"}
            />
            <Bar dataKey="emi" stackId="a" name="EMI" fill={t.series.emi} radius={[6, 0, 0, 6]} maxBarSize={32} />
            <Bar dataKey="maintenance" stackId="a" name="Maintenance" fill={t.series.maintenance} maxBarSize={32} />
            <Bar dataKey="other" stackId="a" name="Other" fill={t.series.other} radius={[0, 6, 6, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
          <Legend color={t.series.emi} label="EMI" value={formatCompact(emi)} />
          <Legend color={t.series.maintenance} label="Maintenance" value={formatCompact(maintenance)} />
          <Legend color={t.series.other} label="Other" value={formatCompact(other)} />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="text-xs text-sub">Total monthly cost</div>
        <div className="text-2xl font-bold text-ink">
          {formatINR(total)}
          <span className="ml-1 text-sm font-medium text-sub">/mo</span>
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