import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/propwise/home/Reveal";

const STEPS = ["Property Price", "Loan", "Monthly Costs", "Rental Potential", "Long-Term Value"];

export default function WhyPropWise() {
  const reduce = useReducedMotion();
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-jade">
            Why PropWise
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Buying a property is more than an EMI.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-sub">
            PropWise brings the costs people often overlook into one analysis.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-y-4">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                    whileInView={reduce ? {} : { opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.45, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-line bg-pagebg px-4 py-2.5 text-sm font-semibold text-ink"
                  >
                    {s}
                  </motion.div>
                </div>
                {i < STEPS.length - 1 && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, x: -6 }}
                    whileInView={reduce ? {} : { opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.4, delay: i * 0.12 + 0.06, ease: "easeOut" }}
                    className="text-jade"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}