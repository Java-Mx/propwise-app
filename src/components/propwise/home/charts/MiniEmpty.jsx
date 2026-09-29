import React from "react";
import { cn } from "@/lib/utils";

// Clean empty state shown when there is not enough data to calculate a graph.
// Fills its parent container so cards stay aligned (parent sets the height).
export default function MiniEmpty({ title = "Enter your property details", sub = "Your analysis will appear here.", icon: Icon, className }) {
  return (
    <div className={cn("flex h-full min-h-[128px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-pagebg px-4 text-center", className)}>
      {Icon && <Icon className="mb-2 h-5 w-5 text-sub" />}
      <p className="text-sm font-medium text-sub">{title}</p>
      <p className="mt-0.5 text-xs text-sub">{sub}</p>
    </div>
  );
}