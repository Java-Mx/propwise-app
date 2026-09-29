import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import CalcEngine from "@/components/propwise/home/CalcEngine";

export default function Hero() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const start = () => navigate("/analysis/new");
  const how = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section>
      <div className="mx-auto max-w-[1240px] px-4 py-16 lg:py-20">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">
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

            <h1 className="mt-4 text-4xl font-bold leading-[1.06] tracking-tight text-ink lg:text-[52px] lg:leading-[1.08]">
              Before you buy a home,
              <br className="hidden sm:block" /> know what it will{" "}
              <span className="relative inline-block">
                really cost.
                <motion.span
                  className="absolute -bottom-1 left-0 h-[3px] w-full rounded-[2px] bg-jade"
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

          {/* right — clean calculation flow (responsive) */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={reduce ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <CalcEngine />
          </motion.div>
        </div>
      </div>
    </section>
  );
}