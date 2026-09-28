import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Hero right-side: animated vertical calculation flow. Labels only — no fake values.
const NODES = [
  { label: "Property Price", sub: "Your input", tone: "navy", tip: "Enter the purchase price." },
  { label: "Your Contribution", sub: "Your savings", tone: "navy", tip: "Add the amount you already have." },
  { label: "Loan Required", sub: "Calculated", tone: "teal", tip: "Calculated from the property price, savings and loan percentage." },
  { label: "Monthly EMI", sub: "Calculated", tone: "teal", tip: "Calculated from interest rate and loan tenure." },
  { label: "Property Costs", sub: "Added costs", tone: "navy", tip: "Add maintenance and other recurring costs." },
  { label: "Rental Benefit", sub: "Optional", tone: "teal", tip: "Optional rental income can offset part of the monthly cost." },
  { label: "Long-Term Value", sub: "Projected", tone: "teal", tip: "Projection based on your selected appreciation assumption." },
];

export default function CalcFlow() {
  const reduce = useReducedMotion();
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_10px_30px_rgba(24,35,58,0.06)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sub">
        From property price to real monthly cost
      </div>
      <div className="mt-5">
        {NODES.map((n, i) => (
          <FlowNode key={n.label} node={n} index={i} reduce={reduce} last={i === NODES.length - 1} />
        ))}
      </div>
    </div>
  );
}

function FlowNode({ node, index, reduce, last }) {
  const teal = node.tone === "teal";
  const delay = index * 0.42;
  return (
    <div className="relative">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
        animate={reduce ? {} : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        className="group relative rounded-xl"
        tabIndex={0}
      >
        <div
          className={cn(
            "flex items-center justify-between rounded-xl border bg-white px-4 py-3 transition",
            teal ? "border-jade/30" : "border-line",
            "shadow-[0_1px_2px_rgba(24,35,58,0.04)]"
          )}
        >
          <div className="flex items-center gap-3">
            <span className={cn("h-2 w-2 rounded-full", teal ? "bg-jade" : "bg-brand")} />
            <span className="text-sm font-semibold text-ink">{node.label}</span>
          </div>
          <span className={cn("text-xs font-medium", teal ? "text-jade" : "text-sub")}>{node.sub}</span>
        </div>
        {/* tooltip */}
        <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-[230px] -translate-x-1/2 rounded-lg border border-line bg-white px-3 py-2 text-xs text-sub opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          {node.tip}
        </div>
      </motion.div>

      {!last && (
        <div className="relative ml-5 h-5 w-px overflow-hidden bg-line">
          <motion.div
            className="absolute inset-0 origin-top bg-jade"
            initial={reduce ? false : { scaleY: 0 }}
            animate={reduce ? {} : { scaleY: 1 }}
            transition={{ duration: 0.35, delay: delay + 0.4, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
}