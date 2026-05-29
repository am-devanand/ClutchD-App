"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { useThemeStore } from "../../store/themeStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchAnalytics, fetchPendingKyc } from "../../services/adminService";

const chartData = [
  { name: 'Jan', revenue: 4000, users: 240 },
  { name: 'Feb', revenue: 3000, users: 139 },
  { name: 'Mar', revenue: 2000, users: 980 },
  { name: 'Apr', revenue: 2780, users: 390 },
  { name: 'May', revenue: 1890, users: 480 },
  { name: 'Jun', revenue: 2390, users: 380 },
  { name: 'Jul', revenue: 3490, users: 430 },
];

export function AdminOverview() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const primaryColor = isLight ? "#d4a011" : "#10b981";
  const tickColor = isLight ? 'rgba(28,25,23,0.45)' : 'rgba(255,255,255,0.4)';
  const gridColor = isLight ? 'rgba(28,25,23,0.06)' : 'rgba(255,255,255,0.05)';

  const [stats, setStats] = useState(null);
  const [pendingKyc, setPendingKyc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, kycApps] = await Promise.all([
        fetchAnalytics(),
        fetchPendingKyc(),
      ]);
      setStats(analyticsRes);
      setPendingKyc(kycApps);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? "border-amber-500" : "border-emerald-500"}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 ${isLight ? "text-red-500" : "text-red-400"}`}>
        <p>{error}</p>
        <button onClick={fetchData} className="mt-3 text-sm underline">Retry</button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", val: stats?.totalUsers?.toLocaleString() || "0", trend: "—" },
    { label: "Active Providers", val: stats?.activeProviders?.toLocaleString() || "0", trend: "—" },
    { label: "Jobs Completed", val: stats?.jobsCompleted?.toLocaleString() || "0", trend: "—" },
    { label: "Platform Revenue", val: `₹${((stats?.totalRevenue || 0) / 100).toLocaleString("en-IN")}`, trend: "—" },
  ];

  const timeAgo = (submitted) => {
    if (!submitted || submitted === "—") return "—";
    const diff = Date.now() - new Date(submitted).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
         {statCards.map((stat, i) => (
           <GlassCard key={i} className="p-5">
             <p className={`text-xs uppercase tracking-wider mb-2 ${isLight ? "text-stone-500" : "text-white/50"}`}>{stat.label}</p>
             <p className={`text-2xl font-bold mb-2 ${isLight ? "text-stone-900" : "text-white"}`}>{stat.val}</p>
             <p className={`text-xs font-medium ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>{stat.trend}</p>
           </GlassCard>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <GlassCard variant="strong" className="col-span-1 lg:col-span-2 p-6 h-[400px] flex flex-col">
            <h3 className={`font-semibold mb-6 ${isLight ? "text-stone-900" : "text-white"}`}>Platform Growth (Revenue & Users)</h3>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="adminColorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={primaryColor} stopOpacity={isLight ? 0.15 : 0.3}/>
                      <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="adminColorUsr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={isLight ? 0.15 : 0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{fill: tickColor, fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{fill: tickColor, fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: tickColor, fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip
                     contentStyle={{
                       backgroundColor: isLight ? '#fff' : '#18181b',
                       borderColor: isLight ? '#e7e5e4' : 'rgba(255,255,255,0.1)',
                       borderRadius: '10px',
                       color: isLight ? '#1c1917' : '#fff',
                       boxShadow: isLight ? '0 8px 30px rgba(0,0,0,0.08)' : 'none'
                     }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke={primaryColor} fillOpacity={1} fill="url(#adminColorRev)" />
                  <Area yAxisId="right" type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#adminColorUsr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </GlassCard>

         <GlassCard className="col-span-1 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`font-semibold ${isLight ? "text-stone-900" : "text-white"}`}>Pending KYC</h3>
              <Badge variant="warning">{pendingKyc.length} Awaiting</Badge>
            </div>

            <div className="flex-1 space-y-3">
               {pendingKyc.length === 0 ? (
                 <p className={`text-sm ${isLight ? "text-stone-400" : "text-white/40"}`}>No pending KYC applications.</p>
               ) : (
                 pendingKyc.slice(0, 5).map((app, i) => (
                   <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/5"}`}>
                      <div>
                        <p className={`text-sm font-medium ${isLight ? "text-stone-800" : "text-white"}`}>{app.name}</p>
                        <p className={`text-[10px] ${isLight ? "text-stone-400" : "text-white/50"}`}>Submitted {timeAgo(app.submitted)}</p>
                      </div>
                      <button
                        onClick={() => router.push("/admin/kyc")}
                        className={`px-3 py-1 rounded text-xs border transition-colors ${isLight ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"}`}
                      >
                        Review
                      </button>
                   </div>
                 ))
               )}
            </div>
            <button
              onClick={() => router.push("/admin/kyc")}
              className={`w-full mt-4 py-2 text-sm transition-colors ${isLight ? "text-stone-400 hover:text-stone-600" : "text-white/50 hover:text-white"}`}
            >
              View All Actions →
            </button>
         </GlassCard>
      </div>
    </div>
  );
}
