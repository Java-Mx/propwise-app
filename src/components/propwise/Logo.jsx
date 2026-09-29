import React from "react";
import { cn } from "@/lib/utils";

// PropWise mark: navy house outline with a cross-grid window, and three
// teal growth bars in the lower-right. currentColor drives the house so it
// adapts to light/dark; bars are fixed teal. Recognizable at 24–64px.
export function LogoMark({ size = 36, className }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("text-ink", className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* house outline */}
      <path
        d="M24 5 L42 18 L42 42 L6 42 L6 18 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* window with cross grid (4 panes) */}
      <rect x="12" y="21" width="11" height="11" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
      <line x1="17.5" y1="21" x2="17.5" y2="32" stroke="currentColor" strokeWidth={1.4} />
      <line x1="12" y1="26.5" x2="23" y2="26.5" stroke="currentColor" strokeWidth={1.4} />
      {/* growth bars */}
      <rect x="27" y="36" width="3" height="6" rx="0.6" fill="#3caea3" />
      <rect x="31.5" y="31" width="3" height="11" rx="0.6" fill="#3caea3" />
      <rect x="36" y="26" width="3" height="16" rx="0.6" fill="#3caea3" />
    </svg>
  );
}

export default function Logo({ size = 36, showTagline = false, className }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="leading-tight">
        <span className="block text-base font-bold tracking-tight">
          <span className="text-ink">Prop</span>
          <span className="text-jade">Wise</span>
        </span>
        {showTagline && (
          <span className="hidden text-[11px] font-medium text-sub sm:block">
            Understand the real cost of your next home.
          </span>
        )}
      </span>
    </span>
  );
}