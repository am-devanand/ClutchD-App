"use client";

import { useEffect } from "react";

import dynamic from "next/dynamic";
import { ProfileEditor } from "../../../components/mechanic/ProfileEditor";
import { AvailabilityToggle } from "../../../components/mechanic/AvailabilityToggle";
import { IncomingJobs } from "../../../components/mechanic/IncomingJobs";
import { EarningsChart } from "../../../components/mechanic/EarningsChart";
import { useAuthStore } from "../../../store/authStore";
import { useThemeStore } from "../../../store/themeStore";
import { LogOut, Wrench } from "lucide-react";

const NavigationMap = dynamic(
  () => import("../../../components/dashboard/MapView"),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#0a2a1a] rounded-2xl animate-pulse" />
  }
);

export default function MechanicDashboard() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div className={`h-screen w-full flex items-center justify-center ${isLight ? "bg-yellow-50" : "bg-[#09090b]"}`}><div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? "border-yellow-500" : "border-emerald-500"}`} /></div>;
  }

  return (
    <div className="h-screen w-full flex flex-col p-4 sm:p-6 pb-0 overflow-hidden relative z-10 gap-6">
      
      <header className={`flex justify-between items-center px-6 py-4 backdrop-blur-xl rounded-2xl flex-shrink-0 ${isLight ? "bg-white/70 border border-slate-200" : "bg-white/5 border border-white/10"}`}>
        <div className="flex items-center gap-2">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold tracking-tighter ${isLight ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>M</div>
           <h1 className={`text-xl font-bold tracking-tight hidden sm:block ${isLight ? "text-slate-900" : "text-white"}`}>ClutchD</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{user?.name || "Mechanic"}</span>
            <span className={`text-[10px] uppercase tracking-wider ${isLight ? "text-yellow-600" : "text-emerald-100/60"}`}>Provider Mode</span>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? "bg-yellow-500/15 border border-yellow-500/30 text-yellow-600" : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"}`}>
            <Wrench size={18} />
          </div>
          <button 
            onClick={logout}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ml-2 ${isLight ? "bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500" : "bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/70 hover:text-red-400"}`}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2 lg:pr-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[800px]">
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="h-auto">
              <AvailabilityToggle />
            </div>
            <div className="flex-1 min-h-[300px]">
              <ProfileEditor />
            </div>
            <div className="h-[300px]">
               <EarningsChart />
            </div>
          </div>
          
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex-1 min-h-[400px]">
              <IncomingJobs />
            </div>
            
            <div className={`h-[300px] rounded-2xl overflow-hidden relative shadow-2xl border ${isLight ? "border-slate-200" : "border-white/10"}`}>
               <NavigationMap />
               <div className={`absolute top-4 left-4 z-[400] backdrop-blur-md px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 ${isLight ? "bg-white/80 border-slate-200 text-slate-700" : "bg-black/60 border-white/10 text-white"}`}>
                 <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                 Navigation
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
