import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import Reveal from "@/components/propwise/home/Reveal";

const STEPS = [
  {
    n: "01",
    label: "ENTER",
    items: ["Property price", "Income", "Savings", "Loan assumptions"],
  },
  {
    n: "02",
    label: "CALCULATE",
    items: ["Loan", "EMI", "Monthly cost"],
  },
  {
    n: "03",
    label: "EXPLORE",
    items: ["Maintenance", "Rental income", "Future value"],
  },
  {
    n: "04",
    label: "UNDERSTAND",
    items: ["Financial commitment", "Long-term picture", "Key trade-offs"],
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 2200);
    return () => clearInterval(id);
  }, [inView, reduce]);

  return (
    <section id="how-it-works" className="scroll-mt-24">
      <div ref={ref} className="mx-auto max-w-7xl px-4 py-24">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            See how PropWise turns inputs into insight.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => {
            const isActive = i === active;
            return (
              <div
                key={s.n}
                className={cn(
                  "rounded-2xl border bg-white p-5 transition-all duration-300",
                  isActive
                    ? "border-jade/40 shadow-[0_8px_24px_rgba(47,143,131,0.10)]"
                    : "border-line opacity-70"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-2xl font-bold transition-colors",
                      isActive ? "text-jade" : "text-brand"
                    )}
                  >
                    {s.n}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.16em]",
                      isActive ? "text-jade" : "text-sub"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {s.items.map((it) => (
                    <div key={it} className="flex items-center gap-2 text-sm text-ink">
                      <span
                        className={cn(
                          "h-1 w-1 rounded-full",
                          isActive ? "bg-jade" : "bg-sub/50"
                        )}
                      />
                      {it}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}