"use client";

import { JobMonitor } from "../../../components/admin/JobMonitor";
import { useThemeStore } from "../../../store/themeStore";

export default function JobsPage() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex-shrink-0">
        <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Active Jobs Monitor</h2>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/60"}>Live view of all service requests across the platform.</p>
      </div>
      
      <div className="flex-1 min-h-[500px]">
        <JobMonitor />
      </div>
    </div>
  );
}
