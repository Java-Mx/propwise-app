import React from "react";
import { useAnalysis } from "@/lib/AnalysisContext";
import { formatINR, formatCompact } from "@/lib/finance";
import Reveal from "@/components/propwise/home/Reveal";

const METRICS = [
  { key: "emi", label: "Estimated EMI", sub: "Monthly loan payment", value: (r) => (r.hasInputs ? formatINR(r.emi) : null) },
  { key: "monthly", label: "Monthly Cost", sub: "EMI + maintenance + others", value: (r) => (r.hasInputs ? formatINR(r.totalMonthlyCost) : null) },
  { key: "yield", label: "Rental Yield", sub: "Gross annual yield", value: (r) => (r.hasInputs ? `${r.grossYield.toFixed(2)}%` : null) },
  { key: "fv", label: "Future Value", sub: "Projected at 10 years", value: (r) => (r.hasInputs ? formatCompact(r.fv(10)) : null) },
];

export default function MetricsBand() {
  const { r } = useAnalysis();
  return (
    <section>
      <div className="mx-auto max-w-[1240px] px-4 py-10">
        <Reveal>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_8px_24px_rgba(24,35,58,0.05)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[12px] font-semibold uppercase tracking-[0.10em] text-sub">
                Key numbers at a glance
              </div>
              <div className="text-xs text-sub">
                {r.hasInputs ? "Based on your analysis" : "Enter a property to see your numbers"}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line lg:grid-cols-4">
              {METRICS.map((m) => {
                const v = m.value(r);
                return (
                  <div key={m.key} className="bg-white p-5">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-sub">{m.label}</div>
                    <div className={v ? "mt-2 text-2xl font-bold text-ink" : "mt-2 text-2xl font-bold text-sub/40"}>
                      {v ?? "—"}
                    </div>
                    <div className="mt-1 text-xs text-sub">{m.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}