import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { MapPin, Clock, Navigation, CheckCircle2 } from "lucide-react";

// Mock data for demo
const MOCK_JOBS = [
  {
    id: "j1",
    customer: "Rahul Sharma",
    issue: "Engine Failure",
    desc: "Car making knocking sound and stalled on the main road.",
    location: "Saibaba Colony, 100ft Road",
    distance: "1.2 km",
    time: "2 mins ago",
    estEarnings: "₹2,500 - ₹3,000",
    status: "pending"
  },
  {
    id: "j2",
    customer: "Priya Singh",
    issue: "Flat Tire",
    desc: "Front left tire completely flat, need urgent replacement.",
    location: "RS Puram, 4th Block",
    distance: "3.5 km",
    time: "15 mins ago",
    estEarnings: "₹400 - ₹600",
    status: "accepted"
  }
];

export function IncomingJobs() {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const acceptJob = (id) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: "accepted" } : j));
    showToast("Job accepted! Navigate to the customer's location.");
  };

  const rejectJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
  };
  
  const finishJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
    showToast("Job marked as completed. Earnings added to your wallet.");
  };

  return (
    <GlassCard variant="strong" className="p-6 h-full flex flex-col relative">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl rounded-xl shadow-lg animate-in slide-in-from-top-2 max-w-[90%]">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-100 font-medium">{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl font-bold text-white tracking-tight">Job Queue</h2>
           <p className="text-sm text-emerald-100/60">Manage your service requests</p>
        </div>
        <Badge variant="warning" className="animate-pulse">
           {jobs.filter(j => j.status === 'pending').length} New Request(s)
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {jobs.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-white/40">
             <Clock size={40} className="mb-4 opacity-50" />
             <p>No jobs in queue.</p>
             <p className="text-sm">Stay online to receive requests.</p>
           </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className={`p-4 rounded-xl border transition-all ${
              job.status === 'accepted' 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white">{job.customer}</h4>
                <span className="text-xs text-white/50 flex items-center"><Clock size={12} className="mr-1"/> {job.time}</span>
              </div>
              
              <div className="mb-3">
                <Badge variant={job.status === 'accepted' ? 'success' : 'danger'} className="mb-2">
                  {job.issue}
                </Badge>
                <p className="text-sm text-emerald-100/80 mb-2">{job.desc}</p>
                <div className="flex items-center text-xs text-emerald-100/60 font-medium">
                   <MapPin size={12} className="mr-1 text-emerald-400" />
                   {job.location} <span className="mx-2 text-white/20">•</span> {job.distance} away
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-emerald-100/50 uppercase tracking-wider mb-0.5">Est. Earnings</p>
                  <p className="font-bold text-emerald-300">{job.estEarnings}</p>
                </div>
                
                <div className="flex gap-2">
                  {job.status === 'pending' ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => rejectJob(job.id)}>Decline</Button>
                      <Button size="sm" onClick={() => acceptJob(job.id)}>Accept Job</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm">
                        <Navigation size={14} className="mr-1.5" /> Navigate
                      </Button>
                      <Button size="sm" onClick={() => finishJob(job.id)}>Complete</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
