import React from "react";
import Logo from "@/components/propwise/Logo";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pagebg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={52} />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-sub">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-line bg-white p-7 shadow-[0_8px_30px_rgba(24,35,58,0.06)] md:p-8">
          {children}
        </div>
        {footer && <p className="mt-6 text-center text-sm text-sub">{footer}</p>}
        <p className="mt-3 text-center text-xs text-sub">Property Financial Analysis & Decision Support</p>
      </div>
    </div>
  );
}