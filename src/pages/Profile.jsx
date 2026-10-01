import React from "react";
import { useAuth } from "@/lib/AuthContext";
import PropWiseHeader from "@/components/propwise/PropWiseHeader";
import AccountCard from "@/components/propwise/account/AccountCard";
import SecurityCard from "@/components/propwise/account/SecurityCard";
import PreferencesCard from "@/components/propwise/account/PreferencesCard";
import DangerZone from "@/components/propwise/account/DangerZone";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  return (
    <div className="min-h-screen text-ink">
      <PropWiseHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Account</h1>
        <p className="mt-1 text-sm text-sub">Manage your profile, security and preferences.</p>
        <div className="mt-6 space-y-5">
          <AccountCard user={user} onNameUpdated={refreshUser} />
          <SecurityCard />
          <PreferencesCard />
          <DangerZone />
        </div>
      </main>
    </div>
  );
}