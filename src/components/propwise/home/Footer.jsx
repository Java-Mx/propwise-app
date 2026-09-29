import React from "react";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import Logo from "@/components/propwise/Logo";

export default function Footer() {
  const navigate = useNavigate();
  const links = [
    { label: "Affordability", path: "/analysis/affordability" },
    { label: "Property Costs", path: "/analysis/property-costs" },
    { label: "Investment", path: "/analysis/investment" },
    { label: "Tools", path: "/tools/saved" },
  ];
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <Logo size={52} showTagline />
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => navigate(l.path)}
                className="text-sm font-medium text-sub transition hover:text-jade"
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex items-start gap-2 rounded-xl bg-pagebg px-4 py-3 text-xs text-sub ring-1 ring-line">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sub" />
          <span>
            PropWise provides estimates based on user-provided assumptions and is intended for
            informational and decision-support purposes. It does not constitute financial,
            investment, tax, legal or lending advice.
          </span>
        </div>
      </div>
    </footer>
  );
}