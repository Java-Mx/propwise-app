import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import CalcEngine from "@/components/propwise/home/CalcEngine";
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
      {/* hero-only subtle radial highlights */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 75% 35%, rgba(47,143,131,0.07), transparent 32%)" }} />
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 18% 70%, rgba(24,35,58,0.04), transparent 30%)" }} />

      <div className="relative mx-auto flex max-w-[1240px] items-center px-4 py-14 lg:min-h-[660px] lg:py-0">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.08fr_1fr] lg:gap-[60px]">
          {/* left */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-jadebg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-jade">
              <span className="h-1.5 w-1.5 rounded-full bg-jade" />
              Property Decision Support
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-[1.06] tracking-tight text-ink sm:text-4xl lg:text-[54px] lg:leading-[1.06]">
              Before you buy a home,
              <br className="hidden sm:block" /> know what it will{" "}
              <span className="relative inline-block">
                really cost.
                <motion.span
                  className="absolute bottom-0.5 left-0 h-[3px] w-full rounded-full bg-jade"
                  style={{ transformOrigin: "left center" }}
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={reduce ? {} : { scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                />
              </span>
            </h1>

            <p className="mt-5 max-w-[560px] text-[17px] text-sub">
              See your loan, ownership costs, rental potential and long-term property value in one clear picture.
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <button
                onClick={start}
                className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-jade px-[22px] text-[15px] font-semibold text-white shadow-[0_6px_16px_rgba(47,143,131,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(47,143,131,0.24)] active:translate-y-0 sm:w-auto"
              >
                Start Property Analysis
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={how}
                className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-[15px] font-semibold text-ink transition hover:border-jade/40 hover:text-jade sm:w-auto"
              >
                See How It Works
              </button>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-sub">
              <Check className="h-4 w-4 text-jade" />
              No account required to start
            </div>
          </motion.div>

          {/* right — desktop calculation engine */}
          <motion.div
            className="hidden md:block"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <CalcEngine />
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