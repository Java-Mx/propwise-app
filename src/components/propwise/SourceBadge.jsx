import React from "react";
import { cn } from "@/lib/utils";

// Provenance badge — distinguishes where a value comes from.
// Never implies external sourcing for locally-calculated values.
const TONES = {
  user: "bg-jadebg text-jade",
  calc: "bg-appbg text-steel",
  ext: "bg-[#EEF1F6] text-ink",
  assum: "bg-[#FFF6E5] text-warn",
  default: "bg-appbg text-sub",
};

const LABELS = {
  user: "User provided",
  calc: "Calculated",
  ext: "External source",
  assum: "Default assumption",
  default: "Not set",
};

export default function SourceBadge({ kind = "calc", label }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", TONES[kind] || TONES.default)}>
      {label || LABELS[kind] || "—"}
    </span>
  );
}