"use client";

import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000, users: 240 },
  { name: 'Feb', revenue: 3000, users: 139 },
  { name: 'Mar', revenue: 2000, users: 980 },
  { name: 'Apr', revenue: 2780, users: 390 },
  { name: 'May', revenue: 1890, users: 480 },
  { name: 'Jun', revenue: 2390, users: 380 },
  { name: 'Jul', revenue: 3490, users: 430 },
];

export function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Users", val: "12,485", trend: "+12%" },
           { label: "Active Providers", val: "842", trend: "+5%" },
           { label: "Jobs Completed", val: "48,392", trend: "+18%" },
           { label: "Platform Revenue", val: "₹1.4Cr", trend: "+24%" },
         ].map((stat, i) => (
           <GlassCard key={i} className="p-5">
             <p className="text-xs text-white/50 uppercase tracking-wider mb-2">{stat.label}</p>
             <p className="text-2xl font-bold text-white mb-2">{stat.val}</p>
             <p className="text-xs text-emerald-400">{stat.trend} from last month</p>
           </GlassCard>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <GlassCard variant="strong" className="col-span-2 p-6 h-[400px] flex flex-col">
            <h3 className="font-semibold text-white mb-6">Platform Growth (Revenue & Users)</h3>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="adminColorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="adminColorUsr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-white-rgb),0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{fill: 'rgba(var(--color-white-rgb),0.4)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{fill: 'rgba(var(--color-white-rgb),0.4)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: 'rgba(var(--color-white-rgb),0.4)', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(var(--color-white-rgb),0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#adminColorRev)" />
                  <Area yAxisId="right" type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#adminColorUsr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </GlassCard>

         <GlassCard className="col-span-1 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-white">Pending KYC</h3>
              <Badge variant="warning">3 Awaiting</Badge>
            </div>
            
            <div className="flex-1 space-y-3">
               {["Raju Mechanic", "Speedy Garage", "Vikram Motors"].map((name, i) => (
                 <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{name}</p>
                      <p className="text-[10px] text-white/50">Submitted 2 hours ago</p>
                    </div>
                    <button className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                      Review
                    </button>
                 </div>
               ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-white/50 hover:text-white transition-colors">View All Actions →</button>
         </GlassCard>
      </div>
{/* 
      <GlassCard className="p-6">
         <h3 className="font-semibold text-white mb-6">Live Jobs Overview</h3>
         <table className="w-full text-left text-sm text-white/70">
           <thead className="text-xs uppercase text-white/40 border-b border-white/5">
             <tr>
               <th className="pb-3 font-medium">Customer</th>
               <th className="pb-3 font-medium">Provider</th>
               <th className="pb-3 font-medium">Status</th>
               <th className="pb-3 font-medium">Amount</th>
             </tr>
           </thead>
           <tbody>
             {[1,2,3].map((i) => (
               <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                 <td className="py-4">Vikas L.</td>
                 <td className="py-4">Speedy Garage</td>
                 <td className="py-4"><Badge variant="info">In Progress</Badge></td>
                 <td className="py-4 font-mono">₹2,400</td>
               </tr>
             ))}
           </tbody>
         </table>
      </GlassCard> */}
    </div>
  );
}
