import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CalcFlow from "@/components/propwise/home/CalcFlow";

export default function Hero() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const start = () => navigate("/analysis/affordability");
  const how = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden bg-pagebg">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-16 lg:min-h-[680px] lg:py-20">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          {/* left */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-jade">
              <span className="h-1.5 w-1.5 rounded-full bg-jade" />
              Property Decision Support
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[54px]">
              Before you buy a home, know what it will really cost.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-sub">
              PropWise brings your loan, monthly costs, rental potential and long-term value into one clear picture.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={start}
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-jade px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#26786E]"
              >
                Start Property Analysis
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={how}
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-jade bg-white px-5 text-sm font-semibold text-jade transition hover:bg-[#E8F5F1]"
              >
                See How It Works
              </button>
            </div>
          </motion.div>

          {/* right */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <CalcFlow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}