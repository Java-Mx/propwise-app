import React from "react";

// Ambient, application-shell background layer.
// - Light: a faint architectural grid + a few very low-opacity currency symbols drifting slowly.
// - Dark: a premium navy/teal radial gradient + faint grid + barely-visible symbols.
// Always behind content (pointer-events-none, -z-10), no layout impact.
// Movement is disabled entirely when the user prefers reduced motion (CSS).
const SYMBOLS = [
  { c: "₹", top: "12%", left: "7%", size: 64, dur: 28, delay: 0 },
  { c: "$", top: "26%", left: "84%", size: 52, dur: 34, delay: 3 },
  { c: "€", top: "66%", left: "12%", size: 58, dur: 30, delay: 6 },
  { c: "£", top: "78%", left: "78%", size: 48, dur: 32, delay: 2 },
  { c: "₹", top: "46%", left: "47%", size: 72, dur: 36, delay: 5 },
];

export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="pw-grid absolute inset-0" />
      <div className="pw-glow pw-glow-navy absolute -right-40 -top-48 h-[560px] w-[560px] rounded-full" />
      <div className="pw-glow pw-glow-teal absolute -left-44 bottom-0 h-[560px] w-[560px] rounded-full" />
      {SYMBOLS.map((s, i) => (
        <span
          key={i}
          className={`pw-sym ${i > 2 ? "hidden md:block" : "block"}`}
          style={{ top: s.top, left: s.left, fontSize: s.size, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        >
          {s.c}
        </span>
      ))}
    </div>
  );
}