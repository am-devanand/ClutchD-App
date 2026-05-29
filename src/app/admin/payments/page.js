"use client";

import { PaymentsManager } from "../../../components/admin/PaymentsManager";
import { useThemeStore } from "../../../store/themeStore";

export default function PaymentsPage() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>Payments</h2>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/60"}>View and manage all financial transactions.</p>
      </div>
      <PaymentsManager />
    </div>
  );
}
