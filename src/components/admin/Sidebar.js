"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserCircle, Briefcase, AlertTriangle, BarChart3, Users, FileCheck, Wrench, Building2, CreditCard } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import api from "../../lib/api";

const NAV_ITEMS = [
  { name: "Overview", icon: BarChart3, path: "/admin" },
  { name: "Users & Providers", icon: Users, path: "/admin/users" },
  { name: "Mechanics", icon: Wrench, path: "/admin/mechanics" },
  { name: "Garages", icon: Building2, path: "/admin/garages" },
  { name: "Active Jobs", icon: Briefcase, path: "/admin/jobs" },
  { name: "Payments", icon: CreditCard, path: "/admin/payments" },
  { name: "KYC Verifications", icon: FileCheck, path: "/admin/kyc", badgeKey: "kyc" },
  { name: "Disputes", icon: AlertTriangle, path: "/admin/disputes", badgeKey: "disputes" },
];

export function Sidebar({ currentPath = "/admin" }) {
  const { logout } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const [badgeCounts, setBadgeCounts] = useState({ kyc: null, disputes: null });

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [kycRes, disputesRes] = await Promise.allSettled([
          api.get("/admin/kyc/pending"),
          api.get("/admin/disputes", { params: { status: "open" } }),
        ]);
        const kyc = kycRes.status === "fulfilled" ? (kycRes.value.data.applications || []).length : null;
        const disputes = disputesRes.status === "fulfilled" ? (disputesRes.value.data.disputes || []).length : null;
        setBadgeCounts({ kyc, disputes });
      } catch {
        // silently fail
      }
    };
    fetchBadges();
  }, []);

  return (
    <div className={`w-64 h-full flex flex-col pt-6 ${isLight ? "bg-white border-r border-slate-200" : "bg-[#0a0a0b] border-r border-white/5"}`}>
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold tracking-tighter ${isLight ? "bg-yellow-500 text-white" : "bg-emerald-500 text-black"}`}>M</div>
        <h1 className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>Admin</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          const badge = item.badgeKey ? badgeCounts[item.badgeKey] : null;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                isActive
                  ? isLight ? "bg-yellow-500/10 text-yellow-700" : "bg-emerald-500/10 text-emerald-400"
                  : isLight ? "text-slate-500 hover:bg-yellow-50 hover:text-slate-700" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>

              {badge !== null && badge > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center",
                  isActive
                    ? isLight ? "bg-yellow-500 text-white" : "bg-emerald-500 text-black"
                    : isLight ? "bg-slate-100 text-slate-600" : "bg-white/10 text-white"
                )}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t mx-4 mb-4 ${isLight ? "border-slate-200" : "border-white/5"}`}>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400/80 hover:bg-red-400/10 hover:text-red-400 rounded-xl transition-all text-sm font-medium"
        >
          <UserCircle size={18} />
          Logout Admin
        </button>
      </div>
    </div>
  );
}
