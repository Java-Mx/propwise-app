import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CalcFlow from "@/components/propwise/home/CalcFlow";
import MobileCalcCard from "@/components/propwise/MobileCalcCard";

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
      <div className="mx-auto flex max-w-[1240px] items-center px-4 py-14 lg:min-h-[650px] lg:py-0">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.083fr_1fr] lg:gap-[64px]">
          {/* left */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eyebrow — pill on mobile (filled), outlined on desktop */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F5F1] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-jade sm:border sm:border-line sm:bg-white">
              <span className="h-1.5 w-1.5 rounded-full bg-jade" />
              Property Decision Support
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-[56px] lg:leading-[1.1]">
              Before you buy a home,
              <br className="hidden sm:block" /> know what it will really cost.
            </h1>

            <p className="mt-5 max-w-[580px] text-base text-[#52627A] lg:text-[18px]">
              PropWise brings your loan, ownership costs, rental potential and long-term value into one clear picture.
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <button
                onClick={start}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-jade px-5 text-[15px] font-semibold text-white transition active:scale-[0.98] hover:bg-[#26786E] sm:w-auto sm:rounded-[10px]"
              >
                Start Property Analysis
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={how}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#B9DED5] bg-white px-5 text-[15px] font-semibold text-jade transition active:scale-[0.98] hover:bg-[#E8F5F1] sm:w-auto sm:rounded-[10px]"
              >
                See How It Works
              </button>
            </div>
          </motion.div>

          {/* right — desktop calculation card */}
          <motion.div
            className="hidden md:block"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <CalcFlow />
          </motion.div>

          {/* mobile calculation card */}
          <motion.div
            className="md:hidden"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <MobileCalcCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}