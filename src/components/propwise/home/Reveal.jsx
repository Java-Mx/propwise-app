import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Subtle scroll-triggered fade + slide-up. Disables motion when requested.
export default function Reveal({ children, delay = 0, y = 24, className }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}