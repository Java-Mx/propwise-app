import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Small, elegant "Illustrative" pill — teal text on subtle teal surface.
export function IllustrativePill({ className }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full bg-jadebg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-jade",
      className
    )}>
      Illustrative
    </span>
  );
}

// Colored dot + label (+ optional value) legend chip.
export function LegendDot({ color, label, value, strong }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-sub">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className={strong ? "font-medium text-ink" : ""}>{label}</span>
      {value != null && <span className="font-medium text-ink">{value}</span>}
    </span>
  );
}

// Compact metric pill used below the investment graph.
export function MetricPill({ label, value, color, emphasis }) {
  return (
    <div className="rounded-xl border border-line bg-pagebg px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-sub">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </div>
      <div className={cn("mt-1 text-sm font-semibold", emphasis ? "text-jade" : "text-ink")}>{value}</div>
    </div>
  );
}

// Animated horizontal allocation bar with rounded, gradient-tinted segments.
export function SegmentedBar({ segments, height = 14 }) {
  const reduce = useReducedMotion();
  const visible = segments.filter((s) => s.value > 0.0001);
  return (
    <div className="flex w-full overflow-hidden rounded-full bg-pagebg shadow-[inset_0_1px_2px_rgba(24,35,58,0.06)]" style={{ height }}>
      {visible.map((s, i) => (
        <motion.div
          key={i}
          className="h-full"
          style={{ background: `linear-gradient(180deg, ${s.color}, ${s.color})` }}
          initial={reduce ? false : { width: 0 }}
          whileInView={reduce ? {} : { width: `${(s.value * 100).toFixed(2)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

// Animated SVG ring (donut). Single or multi-segment. Center label overlaid.
// segments: [{ value (0..1 fraction), color }]. Animates each arc once on view.
export function Ring({ size = 120, stroke = 13, segments, trackColor, centerTop, centerMain, centerBottom, centerMainClass }) {
  const reduce = useReducedMotion();
  const cx = size / 2, cy = size / 2, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let cumAngle = 0;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        {segments.filter((s) => s.value > 0.0001).map((s, i) => {
          const len = s.value * circ;
          const angle = cumAngle;
          cumAngle += s.value * 360;
          return (
            <motion.circle
              key={i}
              cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${len} ${circ}`}
              transform={`rotate(${angle - 90} ${cx} ${cy})`}
              initial={reduce ? false : { strokeDashoffset: len }}
              whileInView={reduce ? {} : { strokeDashoffset: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {centerTop && <span className="text-[10px] font-medium uppercase tracking-wide text-sub">{centerTop}</span>}
        {centerMain && <span className={cn("text-2xl font-bold", centerMainClass || "text-ink")}>{centerMain}</span>}
        {centerBottom && <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-sub">{centerBottom}</span>}
      </div>
    </div>
  );
}

// Labelled value row with a colored dot (used in afford / cost breakdowns).
export function BreakdownRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-sub">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}