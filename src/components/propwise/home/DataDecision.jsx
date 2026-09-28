import React from "react";
import { ArrowRight, ArrowDown } from "lucide-react";
import Reveal from "@/components/propwise/home/Reveal";

const COLS = [
  {
    eyebrow: "Your Inputs",
    items: ["Property Price", "Savings", "Income", "Loan", "Costs"],
  },
  {
    eyebrow: "PropWise Calculates",
    items: ["EMI", "Monthly Cost", "Rental Benefit", "Future Value", "Equity"],
    tone: "teal",
  },
  {
    eyebrow: "You Understand",
    items: ["Affordability", "Ownership Cost", "Long-Term Position"],
  },
];

export default function DataDecision() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-jade">From data to decision</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Your inputs become a decision you can trust.
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          {COLS.map((c, i) => (
            <React.Fragment key={c.eyebrow}>
              <Reveal delay={i * 0.08} className="flex-1">
                <div className={c.tone === "teal" ? "rounded-2xl border border-jade/30 bg-white p-5 shadow-[0_8px_24px_rgba(47,143,131,0.08)]" : "rounded-2xl border border-line bg-white p-5"}>
                  <div className={c.tone === "teal" ? "text-[11px] font-semibold uppercase tracking-[0.14em] text-jade" : "text-[11px] font-semibold uppercase tracking-[0.14em] text-sub"}>
                    {c.eyebrow}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {c.items.map((it, k) => (
                      <li key={it} className="flex items-center gap-2 text-sm font-medium text-ink">
                        <span className={c.tone === "teal" ? "h-1.5 w-1.5 rounded-full bg-jade" : "h-1.5 w-1.5 rounded-full bg-line"} />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              {i < COLS.length - 1 && (
                <div className="flex shrink-0 items-center justify-center text-jade">
                  <ArrowRight className="hidden h-5 w-5 lg:block" />
                  <ArrowDown className="h-5 w-5 lg:hidden" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}