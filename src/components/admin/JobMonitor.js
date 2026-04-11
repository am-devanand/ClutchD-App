import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { MapPin, Navigation, Clock, AlertTriangle } from "lucide-react";

const MOCK_ACTIVE_JOBS = [
  { id: "JOB-4921", customer: "Arjun K.", provider: "Raju Mechanic", status: "In Progress", location: "RS Puram 4th Blk", amount: "₹1,200", issue: "Flat Tire", time: "12 mins ago" },
  { id: "JOB-4922", customer: "Sunita M.", provider: "Speedy Garage", status: "En Route", location: "Saibaba Colony 100ft", amount: "₹2,500+", issue: "Engine Stalled", time: "5 mins ago" },
  { id: "JOB-4923", customer: "Vivek S.", provider: "Unassigned", status: "Searching", location: "Peelamedu Sec 2", amount: "₹800", issue: "Battery Jump", time: "1 min ago" },
  { id: "JOB-4924", customer: "Deepa R.", provider: "Suresh Auto", status: "Nearing Completion", location: "Gandhipuram", amount: "₹4,500", issue: "Brake Pads", time: "45 mins ago" }
];

export function JobMonitor() {
  const [filter, setFilter] = useState("All");

  return (
    <GlassCard className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/5 flex gap-2 overflow-x-auto custom-scrollbar">
        {["All", "Searching", "En Route", "In Progress", "Nearing Completion"].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {MOCK_ACTIVE_JOBS.filter(j => filter === "All" || j.status === filter).map(job => (
          <div key={job.id} className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            <div className="grid grid-cols-2 lg:flex gap-4 lg:gap-8 flex-1">
               <div>
                 <p className="text-[10px] text-white/40 uppercase mb-1">Job ID / Time</p>
                 <p className="text-sm text-white font-mono">{job.id}</p>
                 <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><Clock size={10} /> {job.time}</p>
               </div>
               
               <div>
                 <p className="text-[10px] text-white/40 uppercase mb-1">Parties</p>
                 <p className="text-sm font-medium text-white">{job.customer}</p>
                 <p className="text-xs text-white/60">via {job.provider}</p>
               </div>
               
               <div>
                 <p className="text-[10px] text-white/40 uppercase mb-1">Issue / Amount</p>
                 <p className="text-sm font-medium text-white">{job.issue}</p>
                 <p className="text-xs text-emerald-300">{job.amount}</p>
               </div>
               
               <div className="col-span-2 lg:col-span-1">
                 <p className="text-[10px] text-white/40 uppercase mb-1">Location</p>
                 <p className="text-sm text-white/80 flex items-center gap-1"><MapPin size={12} className="text-emerald-500" /> {job.location}</p>
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
               <Badge variant={
                 job.status === 'Searching' ? 'warning' :
                 job.status === 'In Progress' ? 'success' : 'info'
               }>
                 {job.status}
               </Badge>
               
               <div className="flex gap-2">
                 {job.status === 'Searching' && (
                   <button className="text-xs flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">
                     <AlertTriangle size={12} /> Force Assign
                   </button>
                 )}
                 <button className="text-xs flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white px-2 py-1 rounded border border-white/10 transition-colors">
                   <Navigation size={12} /> Track Map
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
