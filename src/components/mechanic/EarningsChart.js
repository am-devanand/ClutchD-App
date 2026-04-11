"use client";

import { GlassCard } from "../ui/GlassCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', earnings: 1200 },
  { name: 'Tue', earnings: 2100 },
  { name: 'Wed', earnings: 800 },
  { name: 'Thu', earnings: 3600 },
  { name: 'Fri', earnings: 2400 },
  { name: 'Sat', earnings: 4500 },
  { name: 'Sun', earnings: 3200 },
];

export function EarningsChart() {
  return (
    <GlassCard variant="strong" className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Earnings Overview</h2>
          <p className="text-sm text-emerald-100/60">This week</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-emerald-100/60 mb-0.5">Total</p>
          <p className="text-2xl font-bold text-emerald-400">₹17,800</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-[200px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-white-rgb),0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{fill: 'rgba(var(--color-white-rgb),0.4)', fontSize: 12}} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            <YAxis 
              tick={{fill: 'rgba(var(--color-white-rgb),0.4)', fontSize: 12}} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(var(--color-white-rgb),0.1)', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#10b981' }}
              formatter={(value) => [`₹${value}`, 'Earnings']}
            />
            <Area 
              type="monotone" 
              dataKey="earnings" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorEarnings)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
