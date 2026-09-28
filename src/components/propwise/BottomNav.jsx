import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calculator, Wallet, TrendingUp, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileTools } from "@/components/propwise/MobileTools";

const ITEMS = [
  { key: "affordability", label: "Affordability", icon: Calculator, path: "/analysis/affordability" },
  { key: "costs", label: "Costs", icon: Wallet, path: "/analysis/property-costs" },
  { key: "investment", label: "Investment", icon: TrendingUp, path: "/analysis/investment" },
];

// Floating pill-shaped bottom navigation for analysis pages (mobile only).
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openTools } = useMobileTools();

  const active = location.pathname.startsWith("/analysis/affordability") ? "affordability"
    : location.pathname.startsWith("/analysis/property-costs") ? "costs"
    : location.pathname.startsWith("/analysis/investment") ? "investment"
    : null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
      <div className="flex h-[60px] items-center justify-between rounded-full border border-line bg-white/95 px-2 shadow-[0_10px_30px_rgba(24,35,58,0.12)] backdrop-blur">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => navigate(it.path)}
              className={cn(
                "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition active:scale-[0.98]",
                isActive ? "bg-[#E8F5F1] text-jade" : "text-sub"
              )}
            >
              <Icon className="h-5 w-5" />
              {it.label}
            </button>
          );
        })}
        <button
          onClick={openTools}
          className="flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium text-sub transition active:scale-[0.98]"
        >
          <Wrench className="h-5 w-5" />
          Tools
        </button>
      </div>
    </div>
  );
}