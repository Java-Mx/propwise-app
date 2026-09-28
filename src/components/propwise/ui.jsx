import React, { useState } from "react";
import { indianFormat } from "@/lib/finance";

// Compact, subtle UI primitives for PropWise.

export function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function NumberInput({ value, onChange, prefix = "₹", suffix, placeholder, disabled }) {
  const [focused, setFocused] = useState(false);
  const safe = value ?? "";
  const display = focused
    ? (safe === "" ? "" : String(safe))
    : (safe === "" || safe == null ? "" : indianFormat(safe));

  return (
    <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
      {prefix && <span className="mr-1.5 text-sm text-slate-400 select-none">{prefix}</span>}
      <input
        type="text"
        inputMode="numeric"
        value={display}
        placeholder={placeholder ?? "0"}
        disabled={disabled}
        onFocus={(e) => { setFocused(true); e.target.select(); }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d.]/g, "");
          if (digits === "") return onChange("");
          const num = Number(digits);
          onChange(isNaN(num) ? "" : num);
        }}
        className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300"
      />
      {suffix && <span className="ml-1.5 text-sm text-slate-400 select-none">{suffix}</span>}
    </div>
  );
}

export function PercentInput({ value, onChange, disabled }) {
  const [focused, setFocused] = useState(false);
  const display = focused ? (value ?? "") : (value === "" || value == null ? "" : String(value));
  return (
    <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
      <input
        type="text"
        inputMode="decimal"
        value={display}
        placeholder="0"
        disabled={disabled}
        onFocus={(e) => { setFocused(true); e.target.select(); }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d.]/g, "");
          onChange(v === "" ? "" : Number(v));
        }}
        className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300"
      />
      <span className="ml-1.5 text-sm text-slate-400 select-none">%</span>
    </div>
  );
}

export function Select({ value, onChange, options, disabled }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o} years</option>
      ))}
    </select>
  );
}

export function Section({ title, subtitle, children, right }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function ResultCard({ label, value, sub, emphasis = false, tone = "default" }) {
  const tones = {
    default: "border-slate-100 bg-white",
    emphasis: "border-slate-800 bg-slate-900 text-white",
    soft: "border-slate-100 bg-slate-50",
  };
  const subTone = emphasis ? "text-slate-300" : "text-slate-400";
  const labelTone = emphasis ? "text-slate-300" : "text-slate-500";
  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.default}`}>
      <div className={`text-xs font-medium uppercase tracking-wide ${labelTone}`}>{label}</div>
      <div className={`mt-1 text-xl font-semibold ${emphasis ? "text-white" : "text-slate-800"}`}>{value}</div>
      {sub && <div className={`mt-1 text-xs ${subTone}`}>{sub}</div>}
    </div>
  );
}

export function Stat({ label, value, sub }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  );
}

export function Pill({ children, color = "slate" }) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    orange: "bg-orange-50 text-orange-700",
    rose: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
}

export function Divider({ label }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-100" />
      {label && <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>}
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  );
}