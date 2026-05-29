"use client";

import { MechanicsManager } from "../../../components/admin/MechanicsManager";
import { useThemeStore } from "../../../store/themeStore";

export default function MechanicsPage() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Mechanics</h2>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/60"}>Manage all registered mechanics on the platform.</p>
      </div>
      <MechanicsManager />
    </div>
  );
}
