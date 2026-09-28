import React from "react";
import Reveal from "@/components/propwise/home/Reveal";

const ITEMS = [
  { n: "01", title: "Monthly EMI", desc: "Your monthly loan repayment." },
  { n: "02", title: "Total Monthly Cost", desc: "EMI plus recurring ownership costs." },
  { n: "03", title: "Loan Interest", desc: "Total interest paid over the tenure." },
  { n: "04", title: "Payoff Time", desc: "Years to repay the loan in full." },
  { n: "05", title: "Rental Yield", desc: "Rent as a share of property value." },
  { n: "06", title: "Net Rental Benefit", desc: "Rental income after vacancy and costs." },
  { n: "07", title: "Future Property Value", desc: "Projected value at your appreciation rate." },
  { n: "08", title: "Estimated Equity", desc: "Value minus the remaining loan." },
];

export default function WhatItCalculates() {
  return (
    <section className="bg-pagebg">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            One analysis. The numbers that matter.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it, i) => (
            <Reveal key={it.n} delay={(i % 4) * 0.06}>
              <div className="border-l-2 border-line pl-4">
                <div className="text-xs font-semibold text-sub">{it.n}</div>
                <div className="mt-1 text-base font-semibold text-ink">{it.title}</div>
                <div className="mt-1 text-sm text-sub">{it.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}