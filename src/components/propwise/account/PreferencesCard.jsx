import React from "react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

export default function PreferencesCard() {
  const { theme, setTheme } = useTheme();
  const opts = [
    { key: "light", label: "Light", icon: Sun, desc: "Bright, clean surfaces." },
    { key: "dark", label: "Dark", icon: Moon, desc: "Charcoal, low-glare." },
    { key: "system", label: "System", icon: Monitor, desc: "Follow your device." },
  ];
  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-jadebg text-jade"><Palette className="h-5 w-5" /></div>
        <div>
          <h2 className="text-base font-semibold text-ink">Preferences</h2>
          <p className="text-sm text-sub">Appearance applies to this device only.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {opts.map((o) => {
          const Icon = o.icon;
          const active = theme === o.key;
          return (
            <button key={o.key} type="button" onClick={() => setTheme(o.key)}
              className={cn("flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition",
                active ? "border-jade bg-jadebg" : "border-line bg-white hover:bg-appbg")}>
              <Icon className={cn("h-5 w-5", active ? "text-jade" : "text-steel")} />
              <span className={cn("text-sm font-medium", active ? "text-jade" : "text-ink")}>{o.label}</span>
              <span className="text-xs text-sub">{o.desc}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}