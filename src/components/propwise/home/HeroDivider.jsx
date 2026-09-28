import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// A subtle "inputs → insight" transition between hero and the next section.
// A faint line with a single teal node that travels across once on reveal.
export default function HeroDivider() {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto max-w-[1240px] px-4">
      <div className="relative h-px bg-line">
        <motion.span
          className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-jade shadow-[0_0_10px_rgba(47,143,131,0.5)]"
          initial={reduce ? false : { left: "0%", opacity: 0 }}
          whileInView={reduce ? {} : { left: "100%", opacity: [0, 1, 1, 0] }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}