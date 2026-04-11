"use client";

import { AdminOverview } from "../../components/admin/AdminOverview";
import { useThemeStore } from "../../store/themeStore";

export default function AdminPage() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Platform Overview</h2>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/60"}>High-level metrics and urgent actions for ClutchD.</p>
      </div>
      
      <AdminOverview />
    </div>
  );
}
