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

// Compact metric card — colored dot + label + value. Doubles as the graph legend.
export function MetricPill({ label, value, color, emphasis }) {
  return (
    <div className="flex flex-col justify-center rounded-xl border border-line bg-pagebg px-3" style={{ minHeight: 72 }}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-sub">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {label}
      </div>
      <div className={cn("mt-1 text-base font-semibold tabular-nums", emphasis ? "text-jade" : "text-ink")}>{value}</div>
    </div>
  );
}

// Animated SVG ring (donut). Single or multi-segment. Center label overlaid.
// segments: [{ value (0..1 fraction), color }]. Animates each arc once on view.
export function Ring({ size = 120, stroke = 14, segments, trackColor, centerTop, centerMain, centerBottom, centerMainClass }) {
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
              transition={{ duration: 0.85, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {centerTop && <span className="text-[10px] font-medium uppercase tracking-wide text-sub">{centerTop}</span>}
        {centerMain && <span className={cn("font-bold tabular-nums", centerMainClass || "text-ink")}>{centerMain}</span>}
        {centerBottom && <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-sub">{centerBottom}</span>}
      </div>
    </div>
  );
}

// Two-column aligned breakdown row: dot+label (left) · value (right).
export function BreakdownRow({ label, value, color }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm text-sub">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-ink">{value}</span>
    </div>
  );
}

// Key figure block — label over value, used for the primary monetary figures.
export function Figure({ label, value, emphasis, className }) {
  return (
    <div className={className}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-sub">{label}</div>
      <div className={cn("mt-0.5 font-bold tabular-nums", emphasis ? "text-jade text-2xl" : "text-ink text-lg")}>{value}</div>
    </div>
  );
}