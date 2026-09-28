import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/propwise/home/Reveal";
import AffordabilityMini from "@/components/propwise/home/charts/AffordabilityMini";
import CostMini from "@/components/propwise/home/charts/CostMini";
import InvestmentMini from "@/components/propwise/home/charts/InvestmentMini";

// Three feature cards, each driven by the live analysis state.
// No decorative graphs — every visualization is calculated from real inputs,
// with an empty state when there isn't enough data yet.
export default function ThreeAreas() {
  const navigate = useNavigate();
  return (
    <section className="bg-pagebg">
      <div className="mx-auto max-w-7xl px-4 py-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <AffordabilityMini />
            <h3 className="mt-5 text-xl font-bold text-ink">Can I afford it?</h3>
            <p className="mt-2 text-sm text-sub">
              See the loan, EMI and monthly income commitment.
            </p>
            <CTA onClick={() => navigate("/analysis/affordability")}>Explore Affordability</CTA>
          </Card>

          <Card>
            <CostMini />
            <h3 className="mt-5 text-xl font-bold text-ink">What will it really cost?</h3>
            <p className="mt-2 text-sm text-sub">
              See EMI, maintenance and ownership costs together.
            </p>
            <CTA onClick={() => navigate("/analysis/property-costs")}>Explore Property Costs</CTA>
          </Card>

          <Card>
            <InvestmentMini />
            <h3 className="mt-5 text-xl font-bold text-ink">What happens over time?</h3>
            <p className="mt-2 text-sm text-sub">
              Explore rental income, property value and long-term scenarios.
            </p>
            <CTA onClick={() => navigate("/analysis/investment")}>Explore Investment</CTA>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ children }) {
  return (
    <Reveal className="h-full">
      <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-jade/30 hover:shadow-[0_8px_24px_rgba(24,35,58,0.06)]">
        {children}
      </div>
    </Reveal>
  );
}

function CTA({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-jade"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </button>
  );
}