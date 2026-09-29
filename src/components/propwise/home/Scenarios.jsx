import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, KeyRound, Clock } from "lucide-react";
import { useAnalysis } from "@/lib/AnalysisContext";
import { formatCompact, formatPct } from "@/lib/finance";
import Reveal from "@/components/propwise/home/Reveal";

// "One property can tell very different financial stories."
// Three scenario lenses — Buy to Live, Rent It Out, Hold Long-Term — all from
// the same calculation engine. No fabricated values: empty status when no data.
const LENSES = [
  {
    key: "live",
    icon: Home,
    title: "Buy to Live",
    rows: (r, last) => [
      { label: "Monthly commitment", value: r.totalMonthlyCommitment > 0 ? `${formatCompact(r.totalMonthlyCommitment)}/mo` : null },
      { label: "Ownership cost / yr", value: r.estimatedAnnualPropertyCost > 0 ? formatCompact(r.estimatedAnnualPropertyCost) : null },
      { label: "Long-term equity", value: last ? formatCompact(last.equity) : null },
    ],
    emptyHint: "Enter property price, income and loan details.",
  },
  {
    key: "rent",
    icon: KeyRound,
    title: "Rent It Out",
    rows: (r) => [
      { label: "Rental income / yr", value: r.grossAnnualRent > 0 ? formatCompact(r.grossAnnualRent) : null },
      { label: "Net rental benefit / mo", value: r.netMonthlyRentalBenefit > 0 ? `${formatCompact(r.netMonthlyRentalBenefit)}/mo` : null },
      { label: "Net yield", value: r.monthlyRent > 0 ? formatPct(r.netYield) : null },
    ],
    emptyHint: "Add monthly rent to see rental performance.",
  },
  {
    key: "hold",
    icon: Clock,
    title: "Hold Long-Term",
    rows: (r, last) => [
      { label: "Property value", value: last ? formatCompact(last.propertyValue) : null },
      { label: "Loan reduction", value: last ? formatCompact(r.actualLoan - last.loanBalance) : null },
      { label: "Estimated equity", value: last ? formatCompact(last.equity) : null },
    ],
    emptyHint: "Set appreciation and projection years.",
  },
];

export default function Scenarios() {
  const { r } = useAnalysis();
  const navigate = useNavigate();
  const last = r.yearly && r.yearly.length ? r.yearly[r.yearly.length - 1] : null;

  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-jade">Why this matters</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            One property can tell very different financial stories.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-sub">
            The same numbers reveal different outcomes depending on how you use the property.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {LENSES.map((l, i) => {
            const Icon = l.icon;
            const rows = l.rows(r, last);
            const hasAny = rows.some((row) => row.value);
            return (
              <Reveal key={l.key} delay={i * 0.08} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-jadebg text-jade"><Icon className="h-4 w-4" /></span>
                    <h3 className="text-lg font-bold text-ink">{l.title}</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {rows.map((row) => (
                      <div key={row.label} className="flex items-center justify-between border-b border-line pb-2.5 last:border-0">
                        <span className="text-sm text-sub">{row.label}</span>
                        {row.value ? (
                          <span className="text-sm font-semibold text-ink">{row.value}</span>
                        ) : (
                          <span className="text-xs font-medium text-sub">—</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {!hasAny && (
                    <p className="mt-4 text-xs text-sub">{l.emptyHint}</p>
                  )}
                  <button
                    onClick={() => navigate("/analysis/investment")}
                    className="mt-5 self-start text-sm font-semibold text-jade transition hover:text-[#26786E]"
                  >
                    Explore investment →
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}