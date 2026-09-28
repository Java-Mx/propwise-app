import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "propwise-theme";
const VALID = ["light", "dark", "system"];

function resolveSystem() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyClass(effective) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (effective === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

// Apply immediately on import to avoid a flash of the wrong theme.
(function init() {
  try {
    let pref = localStorage.getItem(STORAGE_KEY);
    if (!VALID.includes(pref)) pref = "system";
    applyClass(pref === "system" ? resolveSystem() : pref);
  } catch (_) { /* ignore */ }
})();

const ThemeCtx = createContext({ theme: "system", effective: "light", setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const p = localStorage.getItem(STORAGE_KEY);
      return VALID.includes(p) ? p : "system";
    } catch (_) { return "system"; }
  });
  const [effective, setEffective] = useState(() => (theme === "system" ? resolveSystem() : theme));

  useEffect(() => {
    const eff = theme === "system" ? resolveSystem() : theme;
    setEffective(eff);
    applyClass(eff);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    if (theme !== "system" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => { const eff = resolveSystem(); setEffective(eff); applyClass(eff); };
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", handler); else mq.removeListener(handler); };
  }, [theme]);

  const setTheme = useCallback((t) => { if (VALID.includes(t)) setThemeState(t); }, []);

  return React.createElement(ThemeCtx.Provider, { value: { theme, effective, setTheme } }, children);
}

export const useTheme = () => useContext(ThemeCtx);