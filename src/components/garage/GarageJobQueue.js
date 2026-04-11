import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Clock, MapPin, Settings } from "lucide-react";
import { AssignMechanicModal } from "./AssignMechanicModal";

const MOCK_GARAGE_JOBS = [
  {
    id: "g_j1",
    customer: "Amit S.",
    issue: "Engine Diagnostics",
    desc: "Car won't start, suspecting battery or alternator.",
    location: "Saibaba Colony, 100ft Road",
    time: "10 mins ago",
    estEarnings: "₹1,500 - ₹2,000",
    status: "unassigned",
    assignedTo: null
  },
  {
    id: "g_j2",
    customer: "Priya S.",
    issue: "AC Not Working",
    desc: "AC blowing warm air, needs gas refill probably.",
    location: "Domlur Stage 2",
    time: "25 mins ago",
    estEarnings: "₹2,500 - ₹3,000",
    status: "assigned",
    assignedTo: "Rahul S."
  }
];

export function GarageJobQueue() {
  const [jobs, setJobs] = useState(MOCK_GARAGE_JOBS);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const openAssignModal = (job) => {
    setSelectedJob(job);
    setAssignModalOpen(true);
  };

  const handleAssign = (jobId, mechanicId) => {
    // In a real app we'd fetch the mechanic name. Hardcoding for demo.
    const mechanicName = mechanicId === 'm2' ? 'Amit K.' : 'Rahul S.';
    
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: "assigned", assignedTo: mechanicName } : j));
    setAssignModalOpen(false);
  };

  return (
    <GlassCard variant="strong" className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-bold text-white tracking-tight">Garage Queue</h2>
           <p className="text-sm text-emerald-100/60">Dispatch to your staff</p>
        </div>
        <Badge variant="warning" className="animate-pulse">
           {jobs.filter(j => j.status === 'unassigned').length} Unassigned
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {jobs.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-white/40">
             <Clock size={40} className="mb-4 opacity-50" />
             <p>No active jobs.</p>
           </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className={`p-4 rounded-xl border transition-all ${
              job.status === 'assigned' 
                ? 'bg-black/20 border-white/5 opacity-80' 
                : 'bg-white/5 border-emerald-500/30'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white">{job.customer}</h4>
                <Badge variant={job.status === 'assigned' ? 'success' : 'danger'}>
                  {job.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-red-400 mb-1">{job.issue}</p>
                <p className="text-sm text-emerald-100/80 mb-2">{job.desc}</p>
                <div className="flex items-center justify-between text-xs text-emerald-100/60">
                   <div className="flex items-center">
                     <MapPin size={12} className="mr-1 text-emerald-400" />
                     {job.location}
                   </div>
                   <div className="flex items-center">
                     <Clock size={12} className="mr-1" />
                     {job.time}
                   </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-emerald-100/50 uppercase tracking-wider mb-0.5">Est. Value</p>
                  <p className="font-bold text-emerald-300">{job.estEarnings}</p>
                </div>
                
                {job.status === 'unassigned' ? (
                  <Button size="sm" onClick={() => openAssignModal(job)}>
                     Dispatch
                  </Button>
                ) : (
                  <div className="text-right">
                     <p className="text-[10px] text-emerald-100/50 uppercase tracking-wider mb-0.5">Assigned To</p>
                     <p className="font-bold text-white text-sm flex items-center justify-end">
                       <Settings size={12} className="mr-1 text-emerald-400" /> {job.assignedTo}
                     </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <AssignMechanicModal 
        isOpen={assignModalOpen} 
        onClose={() => setAssignModalOpen(false)} 
        job={selectedJob}
        onAssign={handleAssign}
      />
    </GlassCard>
  );
}
