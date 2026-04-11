"use client";

import { useEffect } from "react";
import { Sidebar } from "../../components/admin/Sidebar";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
    } else if (user && user.role !== "admin") {
      window.location.href = `/dashboard/${user.role}`;
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user || user.role !== "admin") {
    return <div className={`h-screen w-full flex items-center justify-center ${isLight ? "bg-yellow-50" : "bg-[#09090b]"}`}><div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? "border-yellow-500" : "border-emerald-500"}`} /></div>;
  }

  return (
    <div className={`h-screen w-full flex overflow-hidden relative z-10 p-4 gap-6 ${isLight ? "bg-[#fffdf5] text-slate-900" : "bg-[#09090b] text-white"}`}>
      <div className={`rounded-2xl overflow-hidden border shadow-2xl h-full ${isLight ? "border-slate-200" : "border-white/5"}`}>
         <Sidebar currentPath={pathname} />
      </div>
      
      <main className={`flex-1 rounded-2xl border shadow-2xl overflow-y-auto custom-scrollbar p-8 ${isLight ? "bg-white/60 border-slate-200" : "bg-white/5 border-white/5"}`}>
        {children}
      </main>
    </div>
  );
}
