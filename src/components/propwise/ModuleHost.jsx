import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { moduleList, GROUPS, MODULES } from "@/lib/modules";
import { useAnalysis } from "@/lib/AnalysisContext";
import { ChevronRight } from "lucide-react";

import {
  SetupModule, CheckModule, EMISimulator, PayoffExplorer, FutureValueModule,
} from "@/components/propwise/modules/AffordabilityModules";
import {
  CostBuilder, MonthlyAnalyzer, AnnualAnalyzer, OneTimeCalculator, BreakdownModule,
} from "@/components/propwise/modules/CostModules";
import {
  ProfileModule, CommitmentModule, HorizonModule, RentalIncomeModule, RentalYieldModule,
  RentalCostsModule, NetBenefitModule, ValueProjectionModule, EquityModule, YearlyModule,
  ScenarioModule, PropertyCompareModule,
} from "@/components/propwise/modules/InvestmentModules";

const REGISTRY = {
  setup: SetupModule, check: CheckModule, emi: EMISimulator, payoff: PayoffExplorer, future: FutureValueModule,
  builder: CostBuilder, monthly: MonthlyAnalyzer, annual: AnnualAnalyzer, onetime: OneTimeCalculator, breakdown: BreakdownModule,
  profile: ProfileModule, commitment: CommitmentModule, horizon: HorizonModule,
  "rental-income": RentalIncomeModule, "rental-yield": RentalYieldModule, "rental-costs": RentalCostsModule,
  "net-benefit": NetBenefitModule, "value-projection": ValueProjectionModule, equity: EquityModule,
  yearly: YearlyModule, scenario: ScenarioModule, "property-compare": PropertyCompareModule,
};

export default function ModuleHost({ group }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { inputs, set, r } = useAnalysis();
  const groupMeta = GROUPS[group];
  const list = useMemo(() => moduleList(group), [group]);

  const sp = new URLSearchParams(location.search);
  let activeKey = sp.get("m");
  if (!activeKey || MODULES[activeKey]?.group !== group) activeKey = list[0].key;
  const mod = MODULES[activeKey];
  const Mod = REGISTRY[activeKey];

  const select = (key) => navigate(`${groupMeta.route}?m=${key}`);
  const Icon = mod.icon;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-sub">
        <span>{groupMeta.label}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink">{mod.label}</span>
      </div>

      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-jadebg text-jade">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{mod.label}</h1>
          <p className="mt-0.5 text-sm text-sub">{mod.desc}</p>
        </div>
      </div>

      {/* Segmented module switcher */}
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {list.map((m) => {
          const MIcon = m.icon;
          const isActive = m.key === activeKey;
          return (
            <button
              key={m.key}
              onClick={() => select(m.key)}
              title={m.desc}
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition active:scale-[0.98]",
                isActive ? "bg-brand text-white" : "border border-line bg-white text-steel hover:bg-[#E8F5F1] hover:text-jade"
              )}
            >
              <MIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Module */}
      {Mod ? <Mod inputs={inputs} set={set} r={r} /> : <div className="text-sm text-sub">Module not found.</div>}
    </div>
  );
}