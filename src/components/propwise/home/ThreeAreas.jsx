import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Reveal from "@/components/propwise/home/Reveal";

export default function ThreeAreas() {
  const navigate = useNavigate();
  return (
    <section className="bg-pagebg">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <AffordabilityVisual />
            <h3 className="mt-5 text-xl font-bold text-ink">Can I afford it?</h3>
            <p className="mt-2 text-sm text-sub">
              See the loan, EMI and monthly income commitment.
            </p>
            <CTA onClick={() => navigate("/analysis/affordability")}>Explore Affordability</CTA>
          </Card>

          <Card>
            <CostStackVisual />
            <h3 className="mt-5 text-xl font-bold text-ink">What will it really cost?</h3>
            <p className="mt-2 text-sm text-sub">
              Add maintenance, taxes and other ownership costs.
            </p>
            <CTA onClick={() => navigate("/analysis/property-costs")}>Explore Property Costs</CTA>
          </Card>

          <Card>
            <InvestmentVisual />
            <h3 className="mt-5 text-xl font-bold text-ink">What happens over time?</h3>
            <p className="mt-2 text-sm text-sub">
              Explore rental income, property value and long-term scenarios.
            </p>
            <CTA onClick={() => navigate("/analysis/investment")}>Explore Investment</CTA>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ children }) {
  return (
    <Reveal className="h-full">
      <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-jade/30 hover:shadow-[0_8px_24px_rgba(24,35,58,0.06)]">
        {children}
      </div>
    </Reveal>
  );
}

function CTA({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-jade"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </button>
  );
}

function VisualFrame({ children }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-line bg-pagebg px-4">
      {children}
    </div>
  );
}

function AffordabilityVisual() {
  const reduce = useReducedMotion();
  return (
    <VisualFrame>
      <svg viewBox="0 0 120 60" className="h-20 w-full max-w-[220px]" preserveAspectRatio="none">
        <line x1="5" y1="55" x2="115" y2="55" stroke="#DDE4EC" strokeWidth="1" />
        <motion.path
          d="M5 55 C 35 52, 55 34, 115 12"
          stroke="#2F8F83"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={reduce ? {} : { pathLength: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <motion.circle
          cx="115" cy="12" r="3" fill="#2F8F83"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? {} : { opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.3, delay: 1.3 }}
        />
      </svg>
    </VisualFrame>
  );
}

function CostStackVisual() {
  const reduce = useReducedMotion();
  const bars = [
    { color: "#18233A", h: 64, label: "EMI", delay: 0 },
    { color: "#52627A", h: 44, label: "Maint", delay: 0.18 },
    { color: "#718096", h: 30, label: "Other", delay: 0.36 },
  ];
  return (
    <VisualFrame>
      <div className="flex items-end gap-2">
        {bars.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1">
            <div className="flex h-24 items-end">
              <motion.div
                style={{ width: 22, backgroundColor: b.color, borderRadius: 4 }}
                initial={reduce ? false : { height: 0 }}
                whileInView={reduce ? {} : { height: b.h }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: b.delay, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] text-sub">{b.label}</span>
          </div>
        ))}
        <span className="pb-6 text-sub">=</span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-24 items-end">
            <motion.div
              style={{ width: 26, backgroundColor: "#2F8F83", borderRadius: 4 }}
              initial={reduce ? false : { height: 0 }}
              whileInView={reduce ? {} : { height: 84 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] font-semibold text-jade">Monthly</span>
        </div>
      </div>
    </VisualFrame>
  );
}

function InvestmentVisual() {
  const reduce = useReducedMotion();
  const lines = [
    { d: "M5 52 L115 14", color: "#18233A", delay: 0 },
    { d: "M5 18 L115 50", color: "#718096", delay: 0.25 },
    { d: "M5 48 L115 10", color: "#2F8F83", delay: 0.5 },
  ];
  return (
    <VisualFrame>
      <div className="w-full max-w-[220px]">
        <svg viewBox="0 0 120 60" className="h-20 w-full" preserveAspectRatio="none">
          <line x1="5" y1="55" x2="115" y2="55" stroke="#DDE4EC" strokeWidth="1" />
          {lines.map((l, i) => (
            <motion.path
              key={i}
              d={l.d}
              stroke={l.color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={reduce ? {} : { pathLength: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.1, delay: l.delay, ease: "easeInOut" }}
            />
          ))}
        </svg>
        <div className="mt-1 flex justify-between text-[10px]">
          <span className="text-brand">Value ↑</span>
          <span className="text-sub">Loan ↓</span>
          <span className="text-jade font-semibold">Equity ↑</span>
        </div>
      </div>
    </VisualFrame>
  );
}