import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/propwise/ui";
import Reveal from "@/components/propwise/home/Reveal";

const STAGES = [
  { key: "PROPERTY", title: "Property", concept: ["Purchase price", "+ One-time costs"] },
  { key: "FINANCING", title: "Financing", concept: ["Loan amount", "+ Interest", "= EMI"] },
  { key: "OWNERSHIP", title: "Ownership", concept: ["EMI", "+ Maintenance", "+ Other costs"] },
  { key: "RENTAL", title: "Rental", concept: ["Rent", "− Vacancy", "− Rental costs"] },
  { key: "FUTURE", title: "Future", concept: ["Property value", "− Remaining loan", "= Estimated equity"] },
];

export default function CalculationJourney() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.25 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(-1);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setActive(STAGES.length - 1);
      return;
    }
    setActive(-1);
    const timers = STAGES.map((_, i) => setTimeout(() => setActive(i), i * 600));
    return () => timers.forEach(clearTimeout);
  }, [inView, playKey, reduce]);

  return (
    <section ref={ref} className="mx-auto max-w-3xl px-4 py-24">
      <Reveal>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-jade">
          The calculation journey
        </div>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          One property. More than one number.
        </h2>
        <p className="mt-3 text-base text-sub">
          Each stage builds on the last to reveal the complete financial picture.
        </p>
      </Reveal>

      <div className="relative mt-10">
        {/* rail */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-line" />
        <motion.div
          className="absolute left-[11px] top-2 w-px bg-jade"
          animate={{ height: reduce ? "100%" : `${((active + 1) / STAGES.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {STAGES.map((s, i) => {
          const isActive = i <= active;
          return (
            <div key={s.key} className="relative grid grid-cols-[24px_1fr] gap-4 pb-6 last:pb-0">
              <div className="relative flex justify-center pt-4">
                <span
                  className={cn(
                    "h-3 w-3 rounded-full border-2 transition-colors duration-300",
                    isActive ? "border-jade bg-jade" : "border-line bg-white"
                  )}
                />
              </div>
              <motion.div
                animate={{ opacity: isActive ? 1 : 0.45 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "rounded-xl border bg-white px-5 py-4 transition-colors",
                  isActive ? "border-jade/30 shadow-[0_4px_14px_rgba(47,143,131,0.08)]" : "border-line"
                )}
              >
                <div
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.16em]",
                    isActive ? "text-jade" : "text-sub"
                  )}
                >
                  {s.key}
                </div>
                <div className="mt-1 text-lg font-bold text-ink">{s.title}</div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {s.concept.map((c, ci) => (
                    <span
                      key={ci}
                      className={cn(
                        "text-sm",
                        c.startsWith("=") || c.startsWith("−") ? "text-sub" : "text-ink"
                      )}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <Button
          variant="secondary"
          size="md"
          icon={RotateCcw}
          onClick={() => setPlayKey((k) => k + 1)}
        >
          Replay calculation
        </Button>
      </div>
    </section>
  );
}