"use client";

import { DisputePanel } from "../../../components/admin/DisputePanel";
import { useThemeStore } from "../../../store/themeStore";

export default function DisputesPage() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex-shrink-0">
        <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Disputes Resolution</h2>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/60"}>Handle customer and provider complaints, refunds, and bans.</p>
      </div>
      
      <div className="flex-1 min-h-[500px]">
        <DisputePanel />
      </div>
    </div>
  );
}
