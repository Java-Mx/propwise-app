import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useAnalysis } from '@/lib/AnalysisContext';

export default function FinalCTA() {
  const { requestNew } = useAnalysis();
  const reduce = useReducedMotion();
  return (
    <section className="bg-brand">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to understand the numbers?
          </h2>
          <p className="mt-3 text-base text-onfilled">
            Start with the property you're considering.
          </p>
          <button
            onClick={requestNew}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-jade px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#26786E]"
          >
            Start Property Analysis
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}