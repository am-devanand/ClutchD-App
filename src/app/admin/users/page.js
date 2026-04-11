"use client";

import { UserTable } from "../../../components/admin/UserTable";
import { useThemeStore } from "../../../store/themeStore";

export default function UsersPage() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Users &amp; Providers</h2>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/60"}>Manage all registered accounts on the platform.</p>
      </div>
      
      <UserTable />
    </div>
  );
}
