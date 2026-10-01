import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAnalysis } from "@/lib/AnalysisContext";
import { Plus, FolderOpen, Save, Download, Settings, ShieldCheck, Sun, Moon, Monitor, X, User, LogOut, LogIn } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth, displayName } from "@/lib/AuthContext";

const Ctx = createContext(null);
export const useMobileTools = () => useContext(Ctx);

// Provides an app-wide "open Tools sheet" action for mobile chrome
// (pill nav + bottom nav). Renders the bottom sheet itself.
export function MobileToolsProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ openTools: () => setOpen(true) }}>
      {children}
      <ToolsSheet open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}

const OPTIONS = [
  { label: "New Analysis", icon: Plus, action: "new" },
  { label: "Saved Analyses", icon: FolderOpen, action: "saved" },
  { label: "Save Analysis", icon: Save, action: "save" },
  { label: "Export Report", icon: Download, action: "export" },
  { label: "Trusted Sources", icon: ShieldCheck, action: "sources" },
  { label: "Profile", icon: User, action: "profile" },
  { label: "Settings", icon: Settings, action: "settings" },
  { label: "Log out", icon: LogOut, action: "logout" },
];

function ToolsSheet({ open, onClose }) {
  const navigate = useNavigate();
  const analysis = useAnalysis();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");

  if (!open) return null;
  const close = () => { setRenaming(false); onClose(); };

  const act = (action) => {
    switch (action) {
      case "new": analysis.requestNew(); close(); break;
      case "save": analysis.requestSave(); break;
      case "export": analysis.exportReport(); close(); break;
      case "saved": navigate("/tools/saved"); close(); break;
      case "sources": navigate("/tools/sources"); close(); break;
      case "profile": navigate("/profile"); close(); break;
      case "logout": logout(true); break;
      case "settings": setName(analysis.inputs.title || ""); setRenaming(true); break;
      default: break;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={close} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 pb-7 shadow-[0_-10px_30px_rgba(24,35,58,0.12)]">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-jade text-xs font-semibold text-white">
              {(displayName(user) || user.email || "?").trim().slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{displayName(user) || "PropWise user"}</div>
              <div className="truncate text-xs text-sub">{user.email}</div>
            </div>
          </div>
        )}
        <div className="mb-3 grid grid-cols-3 gap-2 px-1">
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
                  "flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-medium transition active:scale-[0.98]",
                  active ? "border-jade bg-jadebg text-jade" : "border-line bg-white text-steel"
                )}
              >
                <Icon className="h-4 w-4" /> {opt.label}
              </button>
            );
          })}
        </div>
        {analysis.saveError && <p className="mb-3 text-sm text-err" role="alert">{analysis.saveError}</p>}
        <div className="mb-1 flex items-center justify-between px-1">
          <h3 className="text-base font-semibold text-ink">Tools</h3>
          <button onClick={close} className="rounded-lg p-2 text-sub hover:bg-appbg" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {renaming ? (
          <div className="px-1 py-2">
            <label className="text-sm font-medium text-ink">Analysis name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this analysis"
              className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-jade focus:ring-2 focus:ring-jade/15"
            />
            <div className="mt-3 flex gap-2">
              <button onClick={close} className="h-11 flex-1 rounded-xl border border-line text-sm font-medium text-sub active:scale-[0.98]">
                Cancel
              </button>
              <button
                onClick={() => { analysis.set("title", name.trim()); close(); }}
                className="h-11 flex-1 rounded-xl bg-jade text-sm font-semibold text-white active:scale-[0.98]"
              >
                Apply
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {(user ? OPTIONS : OPTIONS.filter(o => !['profile', 'logout'].includes(o.action))).map((o) => {
              const Icon = o.icon;
              return (
                <button
                  key={o.label}
                  onClick={() => act(o.action)}
                  disabled={['save', 'new'].includes(o.action) && (analysis.isSaving || !!analysis.busyId)}
                  className="flex h-[52px] w-full items-center gap-3 px-1 text-left active:scale-[0.99] transition"
                >
                  <Icon className="h-5 w-5 text-jade" />
                  <span className="text-[15px] font-medium text-ink">{o.action === 'save' && analysis.isSaving ? 'Saving…' : o.label}</span>
                </button>
              );
            })}
            {!user && (
              <>
                <button onClick={() => { navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`); close(); }} className="flex h-[52px] w-full items-center gap-3 px-1 text-left active:scale-[0.99]">
                  <LogIn className="h-5 w-5 text-jade" /><span className="text-[15px] font-medium text-ink">Log in</span>
                </button>
                <button onClick={() => { navigate(`/signup?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`); close(); }} className="flex h-[52px] w-full items-center gap-3 px-1 text-left active:scale-[0.99]">
                  <User className="h-5 w-5 text-jade" /><span className="text-[15px] font-medium text-ink">Sign up</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}