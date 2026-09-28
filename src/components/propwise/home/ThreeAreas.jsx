import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/propwise/home/Reveal";
import AffordabilityMini from "@/components/propwise/home/charts/AffordabilityMini";
import CostMini from "@/components/propwise/home/charts/CostMini";
import InvestmentMini from "@/components/propwise/home/charts/InvestmentMini";

// Three analysis areas, each driven by the live calculation engine.
// Real mini-charts with empty states; interactive hover on desktop.
export default function ThreeAreas() {
  const navigate = useNavigate();
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-jade">Three questions, one engine</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            The complete property picture.
          </h2>
          <p className="mt-3 max-w-2xl text-base text-sub">
            Each area is a separate calculation — affordability, ownership cost and long-term investment — all from the same numbers you enter.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card onClick={() => navigate("/analysis/affordability")}>
            <AffordabilityMini />
            <h3 className="mt-5 text-xl font-bold text-ink">Can I afford it?</h3>
            <p className="mt-2 text-sm text-sub">Your loan, EMI and monthly income commitment.</p>
            <CTA>See the calculation</CTA>
          </Card>

          <Card onClick={() => navigate("/analysis/property-costs")}>
            <CostMini />
            <h3 className="mt-5 text-xl font-bold text-ink">What will it really cost?</h3>
            <p className="mt-2 text-sm text-sub">EMI, maintenance and ownership costs together.</p>
            <CTA>See the calculation</CTA>
          </Card>

          <Card onClick={() => navigate("/analysis/investment")}>
            <InvestmentMini />
            <h3 className="mt-5 text-xl font-bold text-ink">What happens over time?</h3>
            <p className="mt-2 text-sm text-sub">Rental income, property value and long-term scenarios.</p>
            <CTA>See the calculation</CTA>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ children, onClick }) {
  return (
    <Reveal className="h-full">
      <button
        onClick={onClick}
        className="group flex h-full w-full flex-col rounded-2xl border border-line bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-jade/40 hover:shadow-[0_12px_32px_rgba(24,35,58,0.08)]"
      >
        {children}
      </button>
    </Reveal>
  );
}

function CTA({ children }) {
  return (
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-jade">
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  );
}