"use client";

import { GlassCard } from "../ui/GlassCard";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { name: 'Mon', revenue: 15000 },
  { name: 'Tue', revenue: 22000 },
  { name: 'Wed', revenue: 18000 },
  { name: 'Thu', revenue: 35000 },
  { name: 'Fri', revenue: 42000 },
  { name: 'Sat', revenue: 58000 },
  { name: 'Sun', revenue: 45000 },
];

const jobsData = [
  { name: 'Mon', jobs: 8 },
  { name: 'Tue', jobs: 12 },
  { name: 'Wed', jobs: 10 },
  { name: 'Thu', jobs: 18 },
  { name: 'Fri', jobs: 24 },
  { name: 'Sat', jobs: 32 },
  { name: 'Sun', jobs: 25 },
];

export function GarageAnalytics() {
  return (
    <GlassCard variant="strong" className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Garage Performance</h2>
          <p className="text-sm text-emerald-100/60">Current Week</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <p className="text-xs text-emerald-100/60 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-400">₹2.35L</p>
          <p className="text-xs text-green-400 mt-2">↑ 12% vs last week</p>
        </div>
        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
          <p className="text-xs text-emerald-100/60 uppercase tracking-wider mb-1">Completed Jobs</p>
          <p className="text-3xl font-bold text-white">129</p>
          <p className="text-xs text-green-400 mt-2">↑ 5% vs last week</p>
        </div>
      </div>
      
      <h3 className="text-sm font-medium text-white mb-4">Revenue Trends</h3>
      <div className="flex-1 min-h-[150px] w-full mb-6 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="garageColorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-white-rgb),0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{fill: 'rgba(var(--color-white-rgb),0.4)', fontSize: 10}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill: 'rgba(var(--color-white-rgb),0.4)', fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(var(--color-white-rgb),0.1)', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#garageColorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <h3 className="text-sm font-medium text-white mb-4">Daily Job Volume</h3>
      <div className="flex-1 min-h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={jobsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-white-rgb),0.05)" vertical={false} />
            <XAxis dataKey="name" tick={{fill: 'rgba(var(--color-white-rgb),0.4)', fontSize: 10}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill: 'rgba(var(--color-white-rgb),0.4)', fontSize: 10}} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{fill: 'rgba(var(--color-white-rgb),0.05)'}}
              contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(var(--color-white-rgb),0.1)', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Bar dataKey="jobs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
