import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/propwise/ui";
import {
  Home as HomeIcon, Calculator, Wallet, TrendingUp, Wrench, ChevronDown,
  Plus, FolderOpen, Save, Download, Settings, Info, Trash2, X, Pencil, ChevronRight,
} from "lucide-react";

const MENUS = [
  {
    key: "affordability", label: "Affordability", icon: Calculator, tab: "affordability",
    sections: [
      { heading: "Property & Loan", items: [
        { label: "Property Details", anchor: "aff-inputs" },
        { label: "Financial Details", anchor: "aff-inputs" },
        { label: "Loan Details", anchor: "aff-inputs" },
      ]},
      { heading: "Analysis", items: [
        { label: "Affordability Analysis", anchor: "aff-funding" },
        { label: "Monthly Cost", anchor: "aff-monthly" },
        { label: "Loan Payoff", anchor: "aff-loanpayoff" },
        { label: "Future Property Value", anchor: "aff-future" },
      ]},
      { heading: "Decision", items: [
        { label: "Financial Assessment", anchor: "aff-assessment" },
        { label: "Key Considerations", anchor: "aff-considerations" },
      ]},
    ],
  },
  {
    key: "costs", label: "Property Costs", icon: Wallet, tab: "costs",
    sections: [
      { heading: "Costs", items: [
        { label: "Monthly Costs", anchor: "costs-monthly" },
        { label: "Annual Costs", anchor: "costs-annual" },
        { label: "One-Time Costs", anchor: "costs-onetime" },
      ]},
      { heading: "Summary", items: [
        { label: "Total Monthly Cost", anchor: "costs-summary" },
        { label: "Total Annual Cost", anchor: "costs-summary" },
        { label: "Initial Cash Requirement", anchor: "costs-summary" },
      ]},
      { heading: "Cost Analysis", items: [
        { label: "Cost Breakdown", anchor: "costs-summary" },
        { label: "Ownership Cost Summary", anchor: "costs-summary" },
      ]},
    ],
  },
  {
    key: "investment", label: "Investment", icon: TrendingUp, tab: "investment",
    sections: [
      { heading: "Buyer Analysis", items: [
        { label: "Buyer Profile", invSub: "profile", anchor: "inv-buyerprofile" },
        { label: "Financial Commitment", invSub: "profile", anchor: "inv-buyerprofile" },
        { label: "Investment Horizon", invSub: "profile", anchor: "inv-buyerprofile" },
      ]},
      { heading: "Rental Analysis", items: [
        { label: "Rental Income", invSub: "rental", anchor: "inv-rental" },
        { label: "Rental Yield", invSub: "rental", anchor: "inv-rental" },
        { label: "Rental Costs", invSub: "rental", anchor: "inv-rental" },
        { label: "Net Rental Benefit", invSub: "rental", anchor: "inv-rentalbenefit" },
      ]},
      { heading: "Long-Term", items: [
        { label: "Property Value Projection", invSub: "rental", anchor: "inv-yearly" },
        { label: "Equity Growth", invSub: "rental", anchor: "inv-yearly" },
        { label: "Yearly Investment Analysis", invSub: "rental", anchor: "inv-yearly" },
      ]},
      { heading: "Comparison", items: [
        { label: "Scenario Comparison", invSub: "compare", anchor: "inv-compare" },
        { label: "Property Comparison", invSub: "compare", anchor: "inv-compare" },
      ]},
    ],
  },
  {
    key: "tools", label: "Tools", icon: Wrench,
    sections: [
      { heading: "Analysis", items: [
        { label: "New Analysis", action: "new", icon: Plus },
        { label: "Saved Analyses", action: "saved", icon: FolderOpen },
      ]},
      { heading: "Actions", items: [
        { label: "Save Analysis", action: "save", icon: Save },
        { label: "Export Report", action: "export", icon: Download },
      ]},
      { heading: "Application", items: [
        { label: "Settings", action: "settings", icon: Settings },
        { label: "Help & Information", action: "help", icon: Info },
      ]},
    ],
  },
];

export default function PropWiseHeader({
  activeTab,
  onNavigate,
  onNew,
  onSave,
  saving,
  onExport,
  savedAnalyses,
  onLoadSaved,
  onDeleteSaved,
  onRefreshSaved,
  analysisTitle,
  onRename,
  formatPrice,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [renameVal, setRenameVal] = useState(analysisTitle || "");
  const navRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleItem = (menu, item) => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSub(null);
    if (item.action) {
      switch (item.action) {
        case "new": onNew(); break;
        case "save": onSave(); break;
        case "export": onExport(); break;
        case "saved": onRefreshSaved(); setShowSaved(true); break;
        case "settings": setRenameVal(analysisTitle || ""); setShowSettings(true); break;
        case "help": setShowHelp(true); break;
      }
      return;
    }
    onNavigate({ tab: menu.tab, anchor: item.anchor, invSub: item.invSub });
  };

  const applyRename = () => {
    onRename(renameVal.trim());
    setShowSettings(false);
  };

  const triggerMenu = (key) => setOpenMenu(openMenu === key ? null : key);

  const renderDropdown = (menu) => (
    <div
      className={cn(
        "absolute right-0 mt-2 w-64 rounded-xl border border-line bg-white p-2 shadow-lg z-40",
        openMenu === menu.key ? "block" : "hidden"
      )}
    >
      {menu.sections.map((s, i) => (
        <div key={s.heading}>
          {i > 0 && <div className="my-1.5 h-px bg-line" />}
          <div className="px-2 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sub">{s.heading}</div>
          {s.items.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItem(menu, item)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-ink transition hover:bg-appbg"
            >
              {item.icon ? <item.icon className="h-4 w-4 text-sub" /> : <span className="h-4 w-4" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {/* Logo */}
        <button onClick={() => onNavigate({ tab: activeTab, anchor: null })} className="flex items-center gap-2.5 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
            <HomeIcon className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold tracking-tight text-ink">PropWise</div>
            <div className="hidden text-[11px] text-sub sm:block">Understand the real cost of your next home.</div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav ref={navRef} className="ml-auto hidden items-center gap-1 md:flex relative">
          {MENUS.map((menu) => {
            const isOpen = openMenu === menu.key;
            const isActive = activeTab === menu.key && menu.key !== "tools";
            return (
              <div key={menu.key} className="relative">
                <button
                  onClick={() => triggerMenu(menu.key)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition",
                    isOpen ? "bg-brand text-white" : isActive ? "text-ink" : "text-sub hover:bg-appbg hover:text-ink"
                  )}
                >
                  <span>{menu.label}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </button>
                {renderDropdown(menu)}
              </div>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-appbg md:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <ChevronDown className="h-5 w-5 -rotate-90" />}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="border-t border-line bg-white px-4 py-2 md:hidden">
          {MENUS.map((menu) => (
            <div key={menu.key} className="border-b border-line/60 last:border-0">
              <button
                onClick={() => setMobileSub(mobileSub === menu.key ? null : menu.key)}
                className="flex w-full items-center justify-between py-3 text-sm font-medium text-ink"
              >
                <span className="flex items-center gap-2">
                  <menu.icon className="h-4 w-4 text-sub" />
                  {menu.label}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-sub transition-transform", mobileSub === menu.key && "rotate-180")} />
              </button>
              {mobileSub === menu.key && (
                <div className="pb-3">
                  {menu.sections.map((s) => (
                    <div key={s.heading} className="mb-2">
                      <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sub">{s.heading}</div>
                      {s.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleItem(menu, item)}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-ink hover:bg-appbg"
                        >
                          {item.icon ? <item.icon className="h-4 w-4 text-sub" /> : <ChevronRight className="h-3.5 w-3.5 text-sub/50" />}
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Saved analyses modal */}
      <Modal open={showSaved} onClose={() => setShowSaved(false)} title="Saved Analyses" wide>
        {savedAnalyses.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-sub">No saved analyses yet.</p>
            <Button variant="primary" size="sm" icon={Plus} className="mt-3" onClick={() => { setShowSaved(false); onNew(); }}>Start New Analysis</Button>
          </div>
        ) : (
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {savedAnalyses.map((a) => (
              <div key={a.id} className="group flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-appbg">
                <button onClick={() => { onLoadSaved(a.id); setShowSaved(false); }} className="flex-1 min-w-0 text-left">
                  <div className="truncate text-sm font-medium text-ink">{a.title || "Untitled"}</div>
                  <div className="text-xs text-sub">{formatPrice(a.property_price)}{a.updated_date ? ` · ${new Date(a.updated_date).toLocaleDateString()}` : ""}</div>
                </button>
                <button onClick={() => onDeleteSaved(a.id)} className="rounded p-1 text-sub hover:text-err" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Settings modal */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-ink">Analysis name</label>
            <div className="mt-1.5 flex items-center rounded-lg border border-line bg-white px-3 py-2">
              <Pencil className="mr-2 h-3.5 w-3.5 text-sub" />
              <input
                autoFocus
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyRename()}
                placeholder="Name this analysis"
                className="w-full bg-transparent text-sm text-ink outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="md" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={applyRename}>Apply</Button>
          </div>
          <p className="text-xs text-sub">Rename here or use the title field on the analysis page. Use Tools → Save Analysis to persist.</p>
        </div>
      </Modal>

      {/* Help modal */}
      <Modal open={showHelp} onClose={() => setShowHelp(false)} title="Help & Information" wide>
        <div className="space-y-3 text-sm text-ink">
          <p className="font-medium">PropWise helps you understand the real cost of buying and holding a property.</p>
          <div className="space-y-2">
            <HelpRow icon={Calculator} title="Affordability" text="What can I afford? Enter your property price, savings, income and loan terms." />
            <HelpRow icon={Wallet} title="Property Costs" text="What will this property cost? Add monthly, annual and one-time costs." />
            <HelpRow icon={TrendingUp} title="Investment" text="What if I rent it out? See buyer profile, rental yield and long-term projections." />
            <HelpRow icon={Wrench} title="Tools" text="Manage analyses — start new, save, export and review saved work." />
          </div>
          <div className="rounded-lg bg-appbg p-3 text-xs leading-relaxed text-sub">
            PropWise provides estimates based on user-provided information and assumptions. Property values, rental
            income, interest rates and future costs may change. This tool is for informational and decision-support
            purposes and does not constitute financial, investment, tax, legal or lending advice.
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={() => setShowHelp(false)}>Got it</Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className={cn("w-full rounded-xl bg-white p-5 shadow-xl", wide ? "max-w-md" : "max-w-sm")} onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-sub hover:bg-appbg"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HelpRow({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-line p-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-appbg text-brand">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-sub">{text}</div>
      </div>
    </div>
  );
}