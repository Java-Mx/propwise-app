import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAnalysis } from "@/lib/AnalysisContext";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import ModuleHost from "@/components/propwise/ModuleHost";
import { Info, Pencil, FileQuestion, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/propwise/BottomNav";

const ROUTE_GROUP = {
  "/analysis/affordability": "affordability",
  "/analysis/property-costs": "costs",
  "/analysis/investment": "investment",
};

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { inputs, set, loadById, loadError } = useAnalysis();
  const group = ROUTE_GROUP[location.pathname] || "affordability";
  const [titleEditing, setTitleEditing] = useState(false);

  // Direct URL / refresh / shared link → load the saved analysis by id.
  useEffect(() => {
    if (id) loadById(id);
  }, [id, loadById]);

  if (id && loadError === id) {
    return (
      <div className="min-h-screen text-ink">
        <PropWiseHeader />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5F1] text-jade">
              <FileQuestion className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-ink">Analysis not found</h2>
            <p className="mt-1 max-w-sm text-sm text-sub">
              This analysis may have been deleted, or the link is no longer valid.
            </p>
            <button
              onClick={() => navigate("/analysis/affordability")}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-jade px-4 text-sm font-semibold text-white hover:bg-[#26786E]"
            >
              <Plus className="h-4 w-4" /> Create a new analysis
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-ink">
      <PropWiseHeader />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
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

        <ModuleHost group={group} />
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-28 md:pb-10">
        <div className="flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-xs text-sub ring-1 ring-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sub" />
          <span>
            PropWise provides estimates based on user-provided assumptions and is intended for informational and
            decision-support purposes. It does not constitute financial, investment, tax, legal or lending advice.
          </span>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}