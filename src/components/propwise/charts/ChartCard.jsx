import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Shared chart surface for the whole app:
//  - consistent themed card (bg-pagebg, border-line) so it works in dark mode
//  - optional "Illustrative" badge for demo charts
//  - one-shot entrance animation (fade + rise) when scrolled into view
//  - responsive height: shorter on mobile, taller on desktop
// Children should use <ResponsiveContainer width="100%" height="100%">.
export default function ChartCard({ children, height, illustrative = false, label, className }) {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const h = height ?? (isMobile ? 190 : 250);
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={reduce ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative rounded-xl border border-line bg-pagebg p-3", className)}
    >
      {illustrative && (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-jadebg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jade">
          Illustrative
        </span>
      )}
      <div style={{ height: h }} className="w-full">{children}</div>
      {label && <p className="mt-2 text-center text-[11px] text-sub">{label}</p>}
    </motion.div>
  );
}