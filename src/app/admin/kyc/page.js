"use client";

import { KYCApproval } from "../../../components/admin/KYCApproval";
import { useThemeStore } from "../../../store/themeStore";

export default function KYCPage() {
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold tracking-tight mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>KYC Verifications</h2>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/60"}>Review and approve mechanic and garage onboarding applications.</p>
      </div>
      
      <KYCApproval />
    </div>
  );
}
