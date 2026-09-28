import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { indianFormat } from "@/lib/finance";
import { Loader2 } from "lucide-react";

// ---------- Button ----------

const BTN_VARIANTS = {
  primary: "bg-brand text-white hover:bg-brand/90 active:bg-brand",
  secondary: "bg-white text-ink border border-line hover:bg-appbg",
  ghost: "text-sub hover:bg-appbg border border-transparent",
  danger: "bg-err text-white hover:bg-err/90",
  accent: "bg-jade text-white hover:bg-jade/90",
};
const BTN_SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-1.5",
  lg: "h-10 px-4 text-sm gap-2",
};

export function Button({ variant = "primary", size = "md", loading = false, icon: Icon, children, className, ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
        BTN_VARIANTS[variant],
        BTN_SIZES[size],
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

// ---------- Field ----------

export function Field({ label, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium text-ink">{label}</label>
      {children}
      {hint && <p className="text-xs text-sub">{hint}</p>}
    </div>
  );
}

// ---------- Number input (Indian formatting) ----------

export function NumberInput({ value, onChange, prefix = "₹", suffix, placeholder, disabled, compact }) {
  const [focused, setFocused] = useState(false);
  const v = value ?? "";
  const display = focused ? (v === "" ? "" : String(v)) : (v === "" || v == null ? "" : indianFormat(v));
  return (
    <div className={cn(
      "flex items-center rounded-lg border border-line bg-white transition focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10",
      compact ? "px-2.5 py-1.5" : "px-3 py-2"
    )}>
      {prefix && <span className="mr-1.5 text-sm text-sub select-none">{prefix}</span>}
      <input
        type="text"
        inputMode="numeric"
        value={display}
        placeholder={placeholder ?? "0"}
        disabled={disabled}
        onFocus={(e) => { setFocused(true); e.target.select(); }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          onChange(digits === "" ? "" : Number(digits));
        }}
        className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-sub/50"
      />
      {suffix && <span className="ml-1.5 text-sm text-sub select-none">{suffix}</span>}
    </div>
  );
}

export function PercentInput({ value, onChange, disabled, compact }) {
  const [focused, setFocused] = useState(false);
  const v = value ?? "";
  const display = focused ? (v === "" ? "" : String(v)) : (v === "" || v == null ? "" : String(v));
  return (
    <div className={cn(
      "flex items-center rounded-lg border border-line bg-white transition focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10",
      compact ? "px-2.5 py-1.5" : "px-3 py-2"
    )}>
      <input
        type="text"
        inputMode="decimal"
        value={display}
        placeholder="0"
        disabled={disabled}
        onFocus={(e) => { setFocused(true); e.target.select(); }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d.]/g, "");
          onChange(raw === "" ? "" : Number(raw));
        }}
        className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-sub/50"
      />
      <span className="ml-1.5 text-sm text-sub select-none">%</span>
    </div>
  );
}

// ---------- Select ----------

export function Select({ value, onChange, options, placeholder, disabled, renderOption }) {
  const isNum = options.length && typeof options[0] === "number";
  return (
    <select
      value={value === "" || value == null ? "" : value}
      disabled={disabled}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "") return onChange("");
        onChange(isNum ? Number(v) : v);
      }}
      className={cn(
        "h-9 w-full rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10",
        (value === "" || value == null) && "text-sub/60"
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>{renderOption ? renderOption(o) : (isNum ? `${o} years` : o)}</option>
      ))}
    </select>
  );
}

// ---------- Choice input (presets + custom reveal) ----------

export function ChoiceInput({ value, onChange, options, suffix = "%", allowCustom = true, placeholder = "Select", renderOption }) {
  const isPreset = options.some((o) => Number(o) === Number(value));
  const [custom, setCustom] = useState(allowCustom && !isPreset && value !== "" && value != null);

  if (custom && allowCustom) {
    return (
      <div className="flex items-center gap-2">
        {suffix === "%" ? (
          <PercentInput value={value} onChange={onChange} />
        ) : (
          <NumberInput value={value} onChange={onChange} suffix={suffix} />
        )}
        <Button variant="secondary" size="md" type="button" onClick={() => { setCustom(false); onChange(options[0]); }}>
          Presets
        </Button>
      </div>
    );
  }
  return (
    <select
      value={isPreset ? value : ""}
      onChange={(e) => {
        if (e.target.value === "__custom") { setCustom(true); return; }
        onChange(Number(e.target.value));
      }}
      className={cn(
        "h-9 w-full rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10",
        !isPreset && "text-sub/60"
      )}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{renderOption ? renderOption(o) : `${o}${suffix}`}</option>
      ))}
      {allowCustom && <option value="__custom">Custom</option>}
    </select>
  );
}

// ---------- Section ----------

export function Section({ title, subtitle, children, right, className }) {
  return (
    <section className={cn("rounded-xl border border-line bg-white p-5 shadow-sm", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-sub">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

// ---------- Result card ----------

export function ResultCard({ label, value, sub, emphasis = false }) {
  return (
    <div className={cn(
      "rounded-xl border p-4",
      emphasis ? "border-brand bg-brand text-white" : "border-line bg-white"
    )}>
      <div className={cn("text-xs font-medium uppercase tracking-wide", emphasis ? "text-white/70" : "text-sub")}>{label}</div>
      <div className={cn("mt-1 text-xl font-semibold", emphasis ? "text-white" : "text-ink")}>{value}</div>
      {sub && <div className={cn("mt-1 text-xs", emphasis ? "text-white/70" : "text-sub")}>{sub}</div>}
    </div>
  );
}

export function Stat({ label, value, sub }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-sub">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
      {sub && <span className="text-xs text-sub">{sub}</span>}
    </div>
  );
}

export function Pill({ children, color }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white"
      style={{ backgroundColor: color || "#52627A" }}
    >
      {children}
    </span>
  );
}

export function Divider({ label }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-line" />
      {label && <span className="text-xs font-medium uppercase tracking-wide text-sub">{label}</span>}
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

export function Info({ children }) {
  return (
    <p className="text-xs text-sub">{children}</p>
  );
}

export function Alert({ tone = "warn", children }) {
  const tones = {
    warn: "bg-warn/10 text-warn border-warn/20",
    err: "bg-err/10 text-err border-err/20",
    ok: "bg-ok/10 text-ok border-ok/20",
    info: "bg-steel/10 text-steel border-steel/20",
  };
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-sm", tones[tone])}>{children}</div>
  );
}

// ---------- Confirm dialog ----------

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-sub">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={danger ? "danger" : "primary"} size="md" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Empty state ----------

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-appbg text-brand">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-sub">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}