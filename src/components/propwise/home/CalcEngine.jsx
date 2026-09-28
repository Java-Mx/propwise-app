import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAnalysis } from "@/lib/AnalysisContext";
import { useChartTheme } from "@/lib/chartTheme";
import { formatCompact } from "@/lib/finance";

// The PropWise Calculation Engine — the hero's right-hand visual.
// Property → Loan → (Monthly Cost + Rental Benefit) → Future Value → Equity.
// No fabricated numbers: chips show labels/statuses only; the mini chart at the
// bottom renders real projections when an analysis exists, else an empty grid.
const STEPS = [
  { key: "PROPERTY", label: "Property Price", status: "Your input", tone: "input" },
  { key: "LOAN", label: "Loan Financing", status: "Calculated", tone: "calc" },
  { key: "MONTHLY", label: "Monthly Cost", status: "Calculated", tone: "calc" },
  { key: "RENTAL", label: "Rental Benefit", status: "Optional", tone: "calc" },
  { key: "FUTURE", label: "Future Value", status: "Projected", tone: "calc" },
  { key: "EQUITY", label: "Estimated Equity", status: "Projected", tone: "calc" },
];

const CHIPS = [
  { label: "Property Value", status: "Calculated", className: "right-3 top-3" },
  { label: "Monthly Cost", status: "Calculated", className: "left-2 top-[34%]" },
  { label: "Rental Benefit", status: "Optional", className: "right-2 top-[52%]" },
  { label: "Equity", status: "Projected", className: "left-3 bottom-[24%]" },
];

const TIMELINE = ["NOW", "5Y", "10Y", "15Y", "20Y"];

export default function CalcEngine() {
  const { r } = useAnalysis();
  const t = useChartTheme();
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(reduce ? STEPS.length - 1 : -1);

  useEffect(() => {
    if (reduce) { setActive(STEPS.length - 1); return; }
    if (!inView) return;
    setActive(-1);
    const timers = STEPS.map((_, i) => setTimeout(() => setActive(i), 400 + i * 460));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduce]);

  const done = active >= STEPS.length - 1;
  const statusText = !r.hasInputs
    ? "See how PropWise calculates"
    : !done ? "Building your property picture" : "Calculation complete";

  const chart = useMemo(() => {
    if (!r.hasInputs) return null;
    const rows = [{ year: 0, propertyValue: r.price, loanBalance: r.actualLoan, equity: r.price - r.actualLoan }];
    r.yearly.filter((d) => d.year <= 20).forEach((d) =>
      rows.push({ year: d.year, propertyValue: d.propertyValue, loanBalance: d.loanBalance, equity: d.equity })
    );
    const W = 280, H = 76, pad = 6;
    const max = Math.max(1, ...rows.flatMap((d) => [d.propertyValue, d.loanBalance, d.equity]));
    const x = (i) => pad + (i / Math.max(rows.length - 1, 1)) * (W - 2 * pad);
    const y = (v) => H - pad - (v / max) * (H - 2 * pad);
    const line = (key) => rows.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");
    return { W, H, line, last: rows[rows.length - 1] };
  }, [r.hasInputs, r.price, r.actualLoan, r.yearly]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-line bg-white p-5 shadow-[0_20px_60px_rgba(24,35,58,0.10)] sm:p-6"
    >
      {/* architectural grid + radial highlights (hero only) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--pw-line) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--pw-line) / 0.35) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage: "radial-gradient(circle at 60% 40%, black, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle at 60% 40%, black, transparent 78%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 78% 28%, rgba(47,143,131,0.08), transparent 36%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 22% 80%, rgba(24,35,58,0.05), transparent 34%)" }}
      />

      {/* floating data chips (labels + statuses only, no numbers) */}
      {CHIPS.map((c, i) => (
        <motion.div
          key={c.label}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={reduce ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.15, ease: "easeOut" }}
          className={cn("absolute z-10 hidden rounded-full border border-line bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm lg:block", c.className)}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide text-sub">{c.label}</span>
          <span className="ml-1.5 text-[10px] font-medium text-jade">• {c.status}</span>
        </motion.div>
      ))}

      <div className="relative z-10">
        {/* header + status */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sub">
            The PropWise Calculation Engine
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-jadebg px-2.5 py-1 text-[11px] font-medium text-jade">
            <span className={cn("h-1.5 w-1.5 rounded-full", done ? "bg-ok" : "bg-jade animate-pulse")} />
            {statusText}
            {done && r.hasInputs ? " ✓" : !done && r.hasInputs ? "…" : ""}
          </div>
        </div>

        {/* node flow */}
        <div className="relative mt-4">
          <FlowNode node={STEPS[0]} index={0} active={active} reduce={reduce} />
          <Connector active={active} at={0} reduce={reduce} />
          <FlowNode node={STEPS[1]} index={1} active={active} reduce={reduce} />
          <BranchSplit active={active} reduce={reduce} />
          <div className="grid grid-cols-2 gap-2.5">
            <FlowNode node={STEPS[2]} index={2} active={active} reduce={reduce} compact />
            <FlowNode node={STEPS[3]} index={3} active={active} reduce={reduce} compact />
          </div>
          <BranchMerge active={active} reduce={reduce} />
          <FlowNode node={STEPS[4]} index={4} active={active} reduce={reduce} />
          <Connector active={active} at={4} reduce={reduce} />
          <FlowNode node={STEPS[5]} index={5} active={active} reduce={reduce} final />
        </div>

        {/* timeline */}
        <div className="mt-5">
          <div className="relative h-5">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-line" />
            <motion.div
              className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-jade shadow-[0_0_8px_rgba(47,143,131,0.45)]"
              style={{ left: "0%" }}
              animate={reduce ? { left: "0%" } : { left: ["0%", "25%", "50%", "0%"] }}
              transition={reduce ? {} : { duration: 3.2, times: [0, 0.4, 0.7, 1], ease: "easeInOut", delay: 0.4 }}
            />
            <div className="absolute inset-0 flex items-center justify-between">
              {TIMELINE.map((tk) => (
                <span key={tk} className="text-[9px] font-medium text-sub">{tk}</span>
              ))}
            </div>
          </div>
        </div>

        {/* mini chart — real data or empty placeholder */}
        <div className="mt-4 rounded-xl border border-line bg-pagebg p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-sub">Projection</span>
            <span className="text-[10px] text-sub">{r.hasInputs ? "Value · Loan · Equity" : "20-year horizon"}</span>
          </div>
          {chart ? (
            <svg viewBox={`0 0 ${chart.W} ${chart.H}`} className="h-[76px] w-full" preserveAspectRatio="none" role="img" aria-label="Projected property value, loan balance and equity over time">
              <path d={chart.line("propertyValue")} fill="none" stroke={t.series.value} strokeWidth={1.6} />
              <path d={chart.line("loanBalance")} fill="none" stroke={t.series.loan} strokeWidth={1.6} strokeDasharray="4 3" />
              <path d={chart.line("equity")} fill="none" stroke={t.series.equity} strokeWidth={2.4} />
            </svg>
          ) : (
            <div className="relative h-[76px] w-full overflow-hidden rounded-md">
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(to right, hsl(var(--pw-line)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--pw-line)) 1px, transparent 1px)", backgroundSize: "28px 19px" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-sub">Your projection will appear here</span>
              </div>
            </div>
          )}
          {chart && (
            <p className="mt-1.5 text-[10px] text-sub">
              At year {chart.last.year}: value {formatCompact(chart.last.propertyValue)}, equity {formatCompact(chart.last.equity)}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FlowNode({ node, index, active, reduce, compact, final }) {
  const isActive = index <= active;
  const isCurrent = index === active && !reduce;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={reduce ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex items-center justify-between rounded-xl border bg-white transition-all duration-300",
        compact ? "h-11 px-3" : "h-12 px-3.5",
        isActive
          ? "border-jade bg-jadebg"
          : "border-line",
        isCurrent && "shadow-[0_0_12px_rgba(47,143,131,0.15)]",
        final && isActive && "border-jade bg-jade text-white"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", final && isActive ? "bg-white" : isActive ? "bg-jade" : "bg-line")} />
        <span className={cn("truncate text-sm font-semibold", final && isActive ? "text-white" : "text-ink")}>{node.label}</span>
      </div>
      <span className={cn("ml-2 shrink-0 text-[10px] font-medium uppercase tracking-wide", final && isActive ? "text-white/80" : isActive ? "text-jade" : "text-sub")}>{node.status}</span>
    </motion.div>
  );
}

function Connector({ active, at, reduce }) {
  const filled = active > at;
  return (
    <div className="relative mx-5 my-0.5 h-3 w-px bg-line">
      <motion.div
        className="absolute inset-0 origin-top bg-jade"
        initial={reduce ? false : { scaleY: 0 }}
        animate={reduce ? {} : { scaleY: filled ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}

function BranchSplit({ active, reduce }) {
  const on = active >= 2;
  return (
    <svg width="100%" height="16" viewBox="0 0 100 16" preserveAspectRatio="none" className="my-0.5">
      <path d="M50 0 V5 H18 V16 M50 5 H82 V16" fill="none" stroke="hsl(var(--pw-line))" strokeWidth="1" />
      <motion.path
        d="M50 0 V5 H18 V16 M50 5 H82 V16"
        fill="none" stroke="#2F8F83" strokeWidth="1.4"
        initial={reduce ? false : { pathLength: 0 }}
        animate={reduce ? {} : { pathLength: on ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}

function BranchMerge({ active, reduce }) {
  const on = active >= 4;
  return (
    <svg width="100%" height="16" viewBox="0 0 100 16" preserveAspectRatio="none" className="my-0.5">
      <path d="M18 0 V11 H50 V16 M82 0 V11 H50" fill="none" stroke="hsl(var(--pw-line))" strokeWidth="1" />
      <motion.path
        d="M18 0 V11 H50 V16 M82 0 V11 H50"
        fill="none" stroke="#2F8F83" strokeWidth="1.4"
        initial={reduce ? false : { pathLength: 0 }}
        animate={reduce ? {} : { pathLength: on ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}