"use client";

import { GaragesManager } from "../../../components/admin/GaragesManager";
import { useThemeStore } from "../../../store/themeStore";

export default function GaragesPage() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Garages</h2>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/60"}>Manage all registered garages on the platform.</p>
      </div>
      <GaragesManager />
    </div>
  );
}
