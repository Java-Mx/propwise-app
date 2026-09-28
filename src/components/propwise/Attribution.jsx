import React from "react";
import { useNavigate } from "react-router-dom";
import { Section, Divider } from "@/components/propwise/ui";
import SourceBadge from "@/components/propwise/SourceBadge";
import { ShieldCheck } from "lucide-react";
import { formatINR, formatPct, num } from "@/lib/finance";

// A transparent provenance summary: every important value is tagged with
// where it comes from — user input, a calculation, an external source, or a
// default assumption. This is shown inside Property & Loan Setup so users can
// see exactly what PropWise used to produce their numbers.
export default function Attribution({ r, inputs }) {
  const navigate = useNavigate();

  const rows = [
    { label: "Property price", value: r.price > 0 ? formatINR(r.price) : "—", kind: r.price > 0 ? "user" : "default" },
    { label: "Available savings", value: r.saved > 0 ? formatINR(r.saved) : "—", kind: r.saved > 0 ? "user" : "default" },
    { label: "Interest rate", value: r.rate > 0 ? formatPct(r.rate) : "—", kind: r.rate > 0 ? "user" : "default" },
    { label: "Loan tenure", value: r.tenure > 0 ? `${r.tenure} yrs` : "—", kind: r.tenure > 0 ? "user" : "default" },
    { label: "Loan required", value: r.actualLoan > 0 ? formatINR(r.actualLoan) : "—", kind: "calc" },
    { label: "Estimated EMI", value: r.emi > 0 ? formatINR(r.emi) : "—", kind: "calc" },
    { label: "Appreciation", value: r.appreciation > 0 ? formatPct(r.appreciation) : "—", kind: r.appreciation > 0 ? "assum" : "default" },
    { label: "Property value @ 10y", value: r.price > 0 ? formatINR(r.fv(10)) : "—", kind: "calc" },
  ];

  return (
    <Section
      title="Where these numbers come from"
      subtitle="Provenance for every key value in your analysis."
      right={
        <button
          onClick={() => navigate("/tools/sources")}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-steel hover:bg-jadebg hover:text-jade"
        >
          <ShieldCheck className="h-3.5 w-3.5" /> Trusted Sources
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 py-1.5">
            <span className="text-sm text-sub">{row.label}</span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink">{row.value}</span>
              <SourceBadge kind={row.kind} />
            </span>
          </div>
        ))}
      </div>
      <Divider />
      <p className="text-xs text-sub">
        PropWise does not fetch live market data automatically. Values tagged
        “User provided” come from what you entered; “Calculated” values are
        derived from your inputs; “Default assumption” is used until you enter
        your own. Add external references in Trusted Sources to track where
        your assumptions originate.
      </p>
    </Section>
  );
}