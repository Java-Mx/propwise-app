import React from "react";

// Global ambient financial background — ONE fixed layer at the app shell.
// z-0 (never negative). App content is wrapped in z-10 (see App.jsx) so this
// always sits above the page base colour but below every real element.
// pointer-events:none, no layout impact, transform/opacity-only animation.
const SYMBOLS = [
  { c: "₹", teal: true, b: false, top: "10%", left: "7%", size: 42, dur: 27, delay: 0 },
  { c: "$", teal: false, b: true, top: "22%", left: "86%", size: 36, dur: 33, delay: 4 },
  { c: "€", teal: true, b: false, top: "62%", left: "9%", size: 40, dur: 29, delay: 6 },
  { c: "£", teal: false, b: true, top: "78%", left: "80%", size: 34, dur: 35, delay: 2 },
  { c: "₹", teal: false, b: false, top: "44%", left: "48%", size: 50, dur: 38, delay: 5 },
  { c: "$", teal: true, b: true, top: "84%", left: "30%", size: 30, dur: 31, delay: 7 },
  { c: "€", teal: false, b: false, top: "8%", left: "54%", size: 38, dur: 36, delay: 3 },
];

export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base ambient gradients */}
      <div className="pw-glow pw-glow-navy absolute -right-40 -top-48 h-[560px] w-[560px] rounded-full" />
      <div className="pw-glow pw-glow-teal absolute -left-44 bottom-0 h-[560px] w-[560px] rounded-full" />
      <div className="pw-glow pw-glow-mid absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 rounded-full" />

      {/* faint architectural grid */}
      <div className="pw-grid absolute inset-0" />

      {/* very faint decorative financial-data lines (no labels, no fake numbers) */}
      <svg className="pw-line absolute" style={{ top: "54%", left: "4%", width: "32%", height: "42%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points="0,92 22,72 44,78 68,42 100,18" fill="none" stroke="#2F8F83" strokeWidth="1" />
      </svg>
      <svg className="pw-line absolute" style={{ top: "6%", left: "52%", width: "42%", height: "32%" }} viewBox="0 0 100 60" preserveAspectRatio="none">
        <line x1="0" y1="16" x2="100" y2="16" stroke="#52627A" strokeWidth="0.8" />
        <line x1="0" y1="38" x2="100" y2="38" stroke="#52627A" strokeWidth="0.8" />
        <polyline points="0,52 20,30 45,40 75,12 100,24" fill="none" stroke="#2F8F83" strokeWidth="1" />
      </svg>

      {/* floating currency symbols (fixed set, no JS generation) */}
      {SYMBOLS.map((s, i) => (
        <span
          key={i}
          className={`pw-sym ${s.teal ? "pw-teal" : ""} ${s.b ? "pw-b" : ""} ${i > 2 ? "hidden sm:block" : "block"}`}
          style={{ top: s.top, left: s.left, fontSize: s.size, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        >
          {s.c}
        </span>
      ))}
    </div>
  );
}