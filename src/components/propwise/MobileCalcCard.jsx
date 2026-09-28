import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Mobile-only progressive calculation visualization.
const STAGES = [
  { key: "PROPERTY", title: "Property", concept: "Property price + one-time costs" },
  { key: "FINANCING", title: "Financing", concept: "Loan + interest = EMI" },
  { key: "OWNERSHIP", title: "Ownership", concept: "EMI + maintenance + other costs" },
  { key: "RENTAL", title: "Rental", concept: "Rent − vacancy − rental costs" },
  { key: "FUTURE", title: "Future", concept: "Value − remaining loan = equity" },
];

export default function MobileCalcCard() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(-1);
  const [done, setDone] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setActive(STAGES.length - 1); setDone(true); return; }
    setActive(-1);
    setDone(false);
    const timers = STAGES.map((_, i) => setTimeout(() => setActive(i), i * 600));
    const doneT = setTimeout(() => setDone(true), STAGES.length * 600 + 200);
    return () => { timers.forEach(clearTimeout); clearTimeout(doneT); };
  }, [inView, playKey, reduce]);

  return (
    <div
      ref={ref}
      className="rounded-[20px] border border-line bg-white p-[18px] shadow-[0_8px_24px_rgba(24,35,58,0.06)]"
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sub">
        How PropWise calculates
      </div>

      <div className="mt-3 space-y-1.5">
        {STAGES.map((s, i) => {
          const isActive = i <= active;
          const isCurrent = i === active && !done;
          return (
            <div key={s.key}>
              <div
                className={cn(
                  "rounded-xl border px-3.5 py-3 transition-all duration-300",
                  isActive ? "border-jade/30 bg-[#F3FAF8]" : "border-line bg-white opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.14em]",
                      isActive ? "text-jade" : "text-sub"
                    )}
                  >
                    {s.key}
                  </span>
                  {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-jade" />}
                </div>
                <div className="mt-0.5 text-[15px] font-semibold text-ink">{s.title}</div>
                <div className="text-xs text-sub">{s.concept}</div>
              </div>
              {i < STAGES.length - 1 && <div className="ml-4 h-3 w-px bg-line" />}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="mt-4 rounded-xl bg-brand px-4 py-4 text-white">
          <div className="text-sm font-semibold">Your complete property picture.</div>
          <button
            onClick={() => navigate("/analysis/affordability")}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-jade text-[15px] font-semibold text-white active:scale-[0.98]"
          >
            Start Analysis <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPlayKey((k) => k + 1)}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-white/70"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Replay
          </button>
        </div>
      )}
    </div>
  );
}