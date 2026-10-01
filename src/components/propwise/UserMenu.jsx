import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, displayName } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { User as UserIcon, Settings, LogOut, ChevronDown } from "lucide-react";

function initials(name, email) {
  const base = (name || email || "?").trim();
  const parts = base.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 1).toUpperCase();
}

export default function UserMenu({ className }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white pl-1.5 pr-2.5 text-sm font-medium text-ink transition hover:bg-appbg"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-jade text-[11px] font-semibold text-white">
          {initials(displayName(user), user.email)}
        </span>
        <span className="hidden max-w-[120px] truncate lg:inline">{displayName(user) || "Account"}</span>
        <ChevronDown className={cn("h-4 w-4 text-sub transition-transform", open && "rotate-180")} />
      </button>

      <div className={cn(
        "absolute right-0 top-full mt-1.5 w-64 rounded-[10px] border border-line bg-white p-2 z-50 shadow-[0_8px_24px_rgba(24,35,58,0.10)]",
        open ? "block" : "hidden"
      )}>
        <div className="px-2 py-1.5">
          <div className="truncate text-sm font-semibold text-ink">{displayName(user) || "PropWise user"}</div>
          <div className="truncate text-xs text-sub">{user.email}</div>
        </div>
        <div className="my-1 h-px bg-line" />
        <button onClick={() => { setOpen(false); navigate("/profile"); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-ink transition hover:bg-[#E8F5F1]">
          <UserIcon className="h-4 w-4 text-jade" /> Profile
        </button>
        <button onClick={() => { setOpen(false); navigate("/profile"); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-ink transition hover:bg-[#E8F5F1]">
          <Settings className="h-4 w-4 text-jade" /> Settings
        </button>
        <div className="my-1 h-px bg-line" />
        <button onClick={() => { setOpen(false); logout(true); }}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm font-medium text-ink transition hover:bg-[#E8F5F1]">
          <LogOut className="h-4 w-4 text-jade" /> Log out
        </button>
      </div>
    </div>
  );
}