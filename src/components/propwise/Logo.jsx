import React from "react";
import { cn } from "@/lib/utils";

// Minimal geometric "P" mark: navy stem + bowl, with a small teal accent.
// Works at 32 / 40 / 64px and stays recognizable without text.
export function LogoMark({ size = 36, className }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* stem */}
      <rect x="9" y="9" width="5" height="23" rx="2" fill="#18233A" />
      {/* bowl (rounded D) */}
      <path d="M14 9 h9 a10 10 0 0 1 0 20 h-9 z" fill="#18233A" />
      {/* teal accent — a small structured square inside the bowl */}
      <rect x="27.4" y="11.2" width="3.6" height="3.6" rx="1" fill="#2F8F83" />
    </svg>
  );
}

export default function Logo({ size = 36, showTagline = false, className }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="leading-tight">
        <span className="block text-base font-bold tracking-tight text-ink">PropWise</span>
        {showTagline && (
          <span className="hidden text-[11px] font-medium text-sub sm:block">
            Understand the real cost of your next home.
          </span>
        )}
      </span>
    </span>
  );
}