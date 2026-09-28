import React from "react";
import { useNavigate } from "react-router-dom";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import { Button } from "@/components/propwise/ui";
import { Calculator, Wallet, TrendingUp, ArrowRight, Info, Minus } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const start = () => navigate("/analysis/affordability");
  const howItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-pagebg text-ink">
      <PropWiseHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                Understand the real cost of your next home.
              </h1>
              <p className="mt-4 max-w-xl text-base text-sub">
                Evaluate affordability, ownership costs, rental potential and long-term property value in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="primary" size="lg" icon={ArrowRight} onClick={start}>
                  Start Property Analysis
                </Button>
                <Button variant="secondary" size="lg" onClick={howItWorks}>
                  How It Works
                </Button>
              </div>
            </div>

            {/* Hero visual summary card */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <div className="text-sm font-medium text-ink">Property Summary</div>
              <div className="mt-1 text-xs text-sub">Enter your details to see real estimates.</div>
              <div className="mt-5 divide-y divide-line">
                <HeroLine label="Property Price" />
                <HeroLine label="Monthly Cost" />
                <HeroLine label="Rental Benefit" />
                <HeroLine label="Future Value" />
              </div>
              <div className="mt-5 flex items-center justify-center rounded-lg bg-appbg px-3 py-2.5 text-xs text-sub">
                <span className="text-jade">Enter your details</span>
                <span className="mx-1.5">·</span>
                No estimates yet
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Everything you need to evaluate a property.
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={Calculator}
              title="Affordability"
              text="Understand your loan, EMI and monthly commitment."
              onClick={() => navigate("/analysis/affordability")}
            />
            <FeatureCard
              icon={Wallet}
              title="Property Costs"
              text="See the costs beyond the purchase price and loan."
              onClick={() => navigate("/analysis/property-costs")}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Investment"
              text="Explore rental income, future value and long-term scenarios."
              onClick={() => navigate("/analysis/investment")}
            />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">How it works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Step n="01" title="Enter your details" />
            <Step n="02" title="Explore the costs" />
            <Step n="03" title="Compare the outcome" />
          </div>
        </section>
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

function HeroLine({ label }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-sub">{label}</span>
      <span className="flex items-center text-sm font-medium text-sub">
        <Minus className="mr-1 h-3.5 w-3.5" /> —
      </span>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex h-full flex-col items-start rounded-xl border border-line bg-white p-5 text-left shadow-sm transition hover:border-jade/30 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8F5F1] text-jade">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-sub">{text}</p>
      <span className="mt-4 inline-flex items-center text-sm font-medium text-jade">
        Open <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function Step({ n, title }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="text-2xl font-semibold text-brand">{n}</div>
      <div className="mt-2 text-sm font-medium text-ink">{title}</div>
    </div>
  );
}