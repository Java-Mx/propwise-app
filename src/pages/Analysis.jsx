import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAnalysis } from "@/lib/AnalysisContext";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import AffordabilityTab from "@/components/propwise/AffordabilityTab";
import PropertyCostsTab from "@/components/propwise/PropertyCostsTab";
import InvestmentTab from "@/components/propwise/InvestmentTab";
import { Info, Pencil } from "lucide-react";

const ROUTE_META = {
  "/analysis/affordability": {
    key: "affordability",
    title: "Can I afford this property?",
    sub: "Estimate your monthly commitment, loan cost and long-term property value.",
  },
  "/analysis/property-costs": {
    key: "costs",
    title: "What will this property actually cost me?",
    sub: "Add the costs beyond the loan.",
  },
  "/analysis/investment": {
    key: "investment",
    title: "What happens if I invest in this property?",
    sub: "Explore rental income, future value and long-term scenarios.",
  },
};

export default function Analysis() {
  const location = useLocation();
  const { inputs, set, r } = useAnalysis();
  const meta = ROUTE_META[location.pathname] || ROUTE_META["/analysis/affordability"];
  const [invSub, setInvSub] = useState("profile");
  const [titleEditing, setTitleEditing] = useState(false);

  // Sync investment sub-tab + scroll to anchor on navigation
  useEffect(() => {
    if (location.pathname.startsWith("/analysis/investment")) {
      const sp = new URLSearchParams(location.search);
      const s = sp.get("sub");
      if (s) setInvSub(s);
    }
    if (location.hash) {
      const t = setTimeout(() => {
        const el = document.getElementById(location.hash.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 90);
      return () => clearTimeout(t);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-pagebg text-ink">
      <PropWiseHeader />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{meta.title}</h1>
            <p className="mt-1 text-sm text-sub">{meta.sub}</p>
          </div>
          <div className="flex items-center gap-2">
            {titleEditing ? (
              <input
                autoFocus
                value={inputs.title || ""}
                onChange={(e) => set("title", e.target.value)}
                onBlur={() => setTitleEditing(false)}
                onKeyDown={(e) => e.key === "Enter" && setTitleEditing(false)}
                placeholder="Analysis name"
                className="h-10 w-48 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink outline-none focus:border-jade focus:ring-2 focus:ring-jade/15"
              />
            ) : (
              <button
                onClick={() => setTitleEditing(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-sm font-medium text-sub hover:text-ink"
              >
                <Pencil className="h-3.5 w-3.5" />
                {inputs.title || "Name this analysis"}
              </button>
            )}
          </div>
        </div>

        {meta.key === "affordability" && <AffordabilityTab inputs={inputs} set={set} r={r} />}
        {meta.key === "costs" && <PropertyCostsTab inputs={inputs} set={set} r={r} />}
        {meta.key === "investment" && (
          <InvestmentTab inputs={inputs} set={set} r={r} sub={invSub} setSub={setInvSub} />
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-xs text-sub ring-1 ring-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sub" />
          <span>
            PropWise provides estimates based on user-provided assumptions and is intended for informational and
            decision-support purposes. It does not constitute financial, investment, tax, legal or lending advice.
          </span>
        </div>
      </footer>
    </div>
  );
}