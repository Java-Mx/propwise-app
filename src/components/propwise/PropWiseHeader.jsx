import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/propwise/ui";
import { useAnalysis } from "@/lib/AnalysisContext";
import { Calculator, Wallet, TrendingUp, Wrench, ChevronDown, X, Sun, Moon, Monitor } from "lucide-react";
import Logo from "@/components/propwise/Logo";
import { useMobileTools } from "@/components/propwise/MobileTools";
import { useTheme } from "@/lib/theme";
import { MODULES, GROUPS, moduleList, TOOL_ACTIONS } from "@/lib/modules";

const GROUP_MENUS = [
  { key: "affordability", label: "Affordability", icon: Calculator },
  { key: "costs", label: "Property Costs", icon: Wallet },
  { key: "investment", label: "Investment", icon: TrendingUp },
];

export default function PropWiseHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const analysis = useAnalysis();
  const { theme, setTheme } = useTheme();
  const { openTools } = useMobileTools();
  const [openMenu, setOpenMenu] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [renameVal, setRenameVal] = useState(analysis.inputs.title || "");
  const navRef = useRef(null);

  const currentGroup = location.pathname.startsWith("/analysis/affordability") ? "affordability"
    : location.pathname.startsWith("/analysis/property-costs") ? "costs"
    : location.pathname.startsWith("/analysis/investment") ? "investment"
    : location.pathname.startsWith("/tools") ? "tools" : null;
  const currentModule = new URLSearchParams(location.search).get("m");

  useEffect(() => {
    const onClick = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpenMenu(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const goModule = (mod) => { setOpenMenu(null); navigate(`${mod.route}?m=${mod.key}`); };

  const handleAction = (item) => {
    setOpenMenu(null);
    switch (item.key) {
      case "new": analysis.requestNew(); break;
      case "save": analysis.requestSave(); break;
      case "export": analysis.exportReport(); break;
      case "saved": navigate("/tools/saved"); break;
      case "sources": navigate("/tools/sources"); break;
      case "settings": setRenameVal(analysis.inputs.title || ""); setShowSettings(true); break;
      case "help": setShowHelp(true); break;
    }
  };

  const triggerMenu = (key) => setOpenMenu(openMenu === key ? null : key);
  const applyRename = () => { analysis.set("title", renameVal.trim()); setShowSettings(false); };

  const renderModuleDropdown = (groupKey, rightAlign) => {
    const group = GROUPS[groupKey];
    const list = moduleList(groupKey);
    return (
      <div className={cn(
        "absolute top-full mt-1.5 w-72 rounded-[10px] border border-line bg-white p-2 z-50 shadow-[0_8px_24px_rgba(24,35,58,0.10)]",
        rightAlign ? "right-0" : "left-0",
        openMenu === groupKey ? "block" : "hidden"
      )}>
        <div className="px-2 pt-1.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-sub">{group.label} — {group.tagline}</div>
        {list.map((m) => {
          const Icon = m.icon;
          const isActive = currentGroup === groupKey && currentModule === m.key;
          return (
            <button
              key={m.key}
              onClick={() => goModule(m)}
              className={cn(
                "group flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-[#E8F5F1]",
                isActive && "bg-[#EEF1F6]"
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-jade" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">{m.label}</span>
                <span className="block text-xs text-sub">{m.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderToolsDropdown = (rightAlign) => (
    <div className={cn(
      "absolute top-full mt-1.5 w-72 rounded-[10px] border border-line bg-white p-2 z-50 shadow-[0_8px_24px_rgba(24,35,58,0.10)]",
      rightAlign ? "right-0" : "left-0",
      openMenu === "tools" ? "block" : "hidden"
    )}>
      <div className="px-2 pt-1.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-sub">Tools — Manage my analyses</div>
      {TOOL_ACTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => handleAction(item)}
            className="group flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-[#E8F5F1]"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-jade" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{item.label}</span>
              <span className="block text-xs text-sub">{item.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  const desktopMenus = [
    ...GROUP_MENUS.map((g) => ({ ...g, type: "module" })),
    { key: "tools", label: "Tools", icon: Wrench, type: "tools" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-[72px]">
        <button onClick={() => navigate("/")} className="flex items-center text-left" aria-label="PropWise home">
          <Logo size={32} showTagline />
        </button>

        <nav ref={navRef} className="ml-auto hidden items-center gap-1 md:flex relative">
          {desktopMenus.map((menu, idx) => {
            const isOpen = openMenu === menu.key;
            const isActive = menu.type === "tools" ? location.pathname.startsWith("/tools") : currentGroup === menu.key;
            const rightAlign = idx >= desktopMenus.length - 2;
            return (
              <div key={menu.key} className="relative">
                <button
                  onClick={() => triggerMenu(menu.key)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition",
                    isOpen || isActive ? "bg-[#EEF1F6] text-ink" : "text-steel hover:bg-[#E8F5F1] hover:text-jade"
                  )}
                >
                  <span>{menu.label}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </button>
                {menu.type === "tools" ? renderToolsDropdown(rightAlign) : renderModuleDropdown(menu.key, rightAlign)}
              </div>
            );
          })}
        </nav>

        <button
          onClick={openTools}
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-steel active:scale-[0.98] md:hidden"
          aria-label="Tools"
        >
          <Wrench className="h-5 w-5" />
        </button>
      </div>

      <nav className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2 md:hidden">
        {GROUP_MENUS.map((menu) => {
          const isActive = currentGroup === menu.key;
          return (
            <button
              key={menu.key}
              onClick={() => navigate(GROUPS[menu.key].route)}
              className={cn(
                "flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium transition active:scale-[0.98]",
                isActive ? "bg-brand text-white" : "border border-line bg-white text-steel"
              )}
            >
              {menu.label}
            </button>
          );
        })}
      </nav>

      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-ink">Analysis name</label>
            <div className="mt-1.5 flex h-11 items-center rounded-md border border-line bg-white px-3">
              <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyRename()} placeholder="Name this analysis" className="w-full bg-transparent text-sm text-ink outline-none" />
            </div>
          </div>
          <p className="text-xs text-sub">Currency, loan rate, appreciation and projection defaults follow the values you enter in Property & Loan Setup.</p>
          <div>
            <label className="text-sm font-medium text-ink">Appearance</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {[
                { key: "light", label: "Light", icon: Sun },
                { key: "dark", label: "Dark", icon: Moon },
                { key: "system", label: "System", icon: Monitor },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = theme === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setTheme(opt.key)}
                    className={cn(
                      "flex h-10 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition",
                      active ? "border-jade bg-jadebg text-jade" : "border-line bg-white text-steel hover:bg-jadebg hover:text-jade"
                    )}
                  >
                    <Icon className="h-4 w-4" /> {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-sub">System follows your device. Switching is visual only — your analysis is not affected.</p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="md" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={applyRename}>Apply</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showHelp} onClose={() => setShowHelp(false)} title="Help & Information" wide>
        <div className="space-y-3 text-sm text-ink">
          <p className="font-medium">PropWise is an analysis toolbox — each menu item is a distinct tool that answers one question about a property.</p>
          <div className="space-y-2">
            <HelpRow icon={Calculator} title="Affordability" text="Can I handle this? Setup, an affordability check, an EMI simulator, a loan payoff explorer and a future value tool." />
            <HelpRow icon={Wallet} title="Property Costs" text="What will I spend? A cost builder plus monthly, annual, one-time and ownership breakdown analyzers." />
            <HelpRow icon={TrendingUp} title="Investment" text="What happens over time? Buyer profile, financial commitment, rental tools, projections, equity and comparisons." />
            <HelpRow icon={Wrench} title="Tools" text="Manage analyses — new, saved, save, export and settings." />
          </div>
          <p className="text-xs text-sub">Tools marked with Apply / Reset are experimental — changes only affect your main analysis when you apply them.</p>
          <div className="flex justify-end"><Button variant="primary" size="md" onClick={() => setShowHelp(false)}>Got it</Button></div>
        </div>
      </Modal>

      <Modal open={analysis.confirmNew} onClose={() => analysis.setConfirmNew(false)} title="Start a new analysis?">
        <p className="text-sm text-sub">Your current unsaved information will be cleared.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={() => analysis.setConfirmNew(false)}>Cancel</Button>
          <Button variant="primary" size="md" onClick={analysis.doNew}>Start New</Button>
        </div>
      </Modal>

      <Modal open={analysis.namePrompt} onClose={() => analysis.setNamePrompt(false)} title="Name this analysis">
        <div className="space-y-3">
          <div className="flex h-11 items-center rounded-md border border-line bg-white px-3">
            <input autoFocus value={analysis.nameVal} onChange={(e) => analysis.setNameVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analysis.confirmNameSave()} placeholder="Analysis name" className="w-full bg-transparent text-sm text-ink outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => analysis.setNamePrompt(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={analysis.confirmNameSave}>Save Analysis</Button>
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
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F1] text-jade"><Icon className="h-4 w-4" /></div>
      <div><div className="text-sm font-medium text-ink">{title}</div><div className="text-xs text-sub">{text}</div></div>
    </div>
  );
}