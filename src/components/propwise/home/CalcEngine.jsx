import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// The PropWise calculation flow — a single clean vertical path of 6 stages.
// No chips, no chart, no branching. One node active at a time during the
// one-shot animation; the final "Estimated Equity" node ends filled teal.
const STAGES = [
  { label: "Property Price", status: "Your Input" },
  { label: "Loan & Financing", status: "Calculated" },
  { label: "Monthly Cost", status: "Calculated" },
  { label: "Rental Benefit", status: "Optional" },
  { label: "Future Value", status: "Projected" },
  { label: "Estimated Equity", status: "Projected" },
];

const STAGGER = 450; // ms per stage

export default function CalcEngine() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(reduce ? STAGES.length - 1 : -1);
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (reduce) { setActive(STAGES.length - 1); setDone(true); return; }
    if (!inView) return;
    setActive(-1);
    setDone(false);
    const timers = STAGES.map((_, i) => setTimeout(() => setActive(i), 300 + i * STAGGER));
    const doneT = setTimeout(() => { setDone(true); }, 300 + STAGES.length * STAGGER + 150);
    return () => { timers.forEach(clearTimeout); clearTimeout(doneT); };
  }, [inView, reduce]);

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-line bg-white p-7 shadow-[0_18px_50px_rgba(24,35,58,0.08)]"
    >
      <div className="text-[12px] font-semibold uppercase tracking-[0.10em] text-sub">
        How PropWise Calculates
      </div>
      <div className="mt-1 text-sm text-sub">From property price to long-term position</div>

      <div className="mt-6">
        {STAGES.map((s, i) => {
          const isCurrent = i === active && !done;
          const isFinal = i === STAGES.length - 1;
          const finalFilled = isFinal && done;
          return (
            <React.Fragment key={s.label}>
              <div
                className={cn(
                  "grid h-14 grid-cols-[20px_1fr_auto] items-center gap-3 rounded-[14px] border px-4 transition-all duration-300",
                  finalFilled
                    ? "border-jade bg-jade text-white"
                    : isCurrent
                    ? "border-jade bg-jadebg"
                    : "border-line bg-white"
                )}
              >
                <span className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors duration-300",
                  finalFilled ? "bg-white" : isCurrent ? "bg-jade" : "bg-line"
                )} />
                <span className={cn(
                  "text-sm font-semibold transition-colors duration-300",
                  finalFilled ? "text-white" : "text-ink"
                )}>{s.label}</span>
                <span className={cn(
                  "text-[11px] font-medium uppercase tracking-wide transition-colors duration-300",
                  finalFilled ? "text-onfilled" : isCurrent ? "text-jade" : "text-sub"
                )}>{s.status}</span>
              </div>
              {i < STAGES.length - 1 && (
                <Connector at={i} active={active} done={done} reduce={reduce} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function Connector({ at, active, done, reduce }) {
  const filled = reduce || done || active > at;
  return (
    <div className="relative ml-[26px] h-3 w-px overflow-hidden bg-line">
      <div
        className={cn(
          "absolute inset-0 origin-top bg-jade transition-transform duration-300",
          filled ? "scale-y-100" : "scale-y-0"
        )}
      />
    </div>
  );
}