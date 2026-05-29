import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Clock, MapPin, Settings, Loader2, IndianRupee, AlertTriangle } from "lucide-react";
import { AssignMechanicModal } from "./AssignMechanicModal";
import api from "../../lib/api";
import { useThemeStore } from "../../store/themeStore";
import { formatDistanceToNow } from "date-fns";

export function GarageJobQueue() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  // --- Job Completion Modal State ---
  const [completionModal, setCompletionModal] = useState(false);
  const [completionJobId, setCompletionJobId] = useState(null);
  const [serviceAmount, setServiceAmount] = useState("");
  const [submittingPrice, setSubmittingPrice] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/incoming");
      setJobs(res.data.jobs || []);
    } catch (e) {
      console.warn("Failed to fetch jobs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const openAssignModal = (job) => {
    setSelectedJob(job);
    setAssignModalOpen(true);
  };

  const handleAssign = async (jobId, mechanicId) => {
    try {
      await api.post(`/jobs/${jobId}/assign`, {
        assign_type: "mechanic",
        assign_id: mechanicId,
      });
      // Optimistic update
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "assigned", mechanic: { id: mechanicId } } : j))
      );
      setAssignModalOpen(false);
      fetchJobs(); // refresh list
    } catch (e) {
      console.error("Failed to assign job", e);
    }
  };

  const openCompletionModal = (id) => {
    setCompletionJobId(id);
    setServiceAmount("");
    setPriceError("");
    setCompletionModal(true);
  };

  const handleFinalizePrice = async () => {
    const amount = parseFloat(serviceAmount);
    if (isNaN(amount) || amount <= 0) {
      setPriceError("Please enter a valid service amount.");
      return;
    }
    if (amount > 500000) {
      setPriceError("Amount cannot exceed ₹5,00,000.");
      return;
    }
    setPriceError("");
    setSubmittingPrice(true);
    try {
      await api.post(`/service/request/${completionJobId}/finalize-price`, {
        serviceAmount: amount,
      });
      setJobs(jobs.filter(j => j.id !== completionJobId));
      setCompletionModal(false);
      showToast(`Invoice of ₹${amount} sent to customer. Awaiting payment.`);
    } catch (err) {
      setPriceError(err.response?.data?.detail || "Failed to submit price. Please try again.");
    } finally {
      setSubmittingPrice(false);
    }
  };

  return (
    <GlassCard variant="strong" className="p-6 h-full flex flex-col relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 backdrop-blur-xl rounded-xl shadow-lg animate-in slide-in-from-top-2 max-w-[90%] ${isLight ? "bg-green-50 border border-green-200" : "bg-emerald-500/20 border border-emerald-500/30"}`}>
          <IndianRupee size={16} className={isLight ? "text-green-600 shrink-0" : "text-emerald-400 shrink-0"} />
          <span className={`text-sm font-medium ${isLight ? "text-green-800" : "text-emerald-100"}`}>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>Garage Queue</h2>
           <p className={`text-sm ${isLight ? "text-slate-500" : "text-emerald-100/60"}`}>Dispatch to your staff</p>
        </div>
        <Badge variant="warning" className="animate-pulse">
           {jobs.filter(j => j.status === 'searching' || j.status === 'assigned_to_garage').length} Unassigned
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {loading && jobs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 size={40} className={`mb-4 animate-spin ${isLight ? "text-yellow-500" : "text-emerald-500"}`} />
            <p className={isLight ? "text-slate-500" : "text-white/40"}>Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
           <div className={`h-full flex flex-col items-center justify-center ${isLight ? "text-slate-400" : "text-white/40"}`}>
             <Clock size={40} className="mb-4 opacity-50" />
             <p>No active jobs.</p>
           </div>
        ) : (
          jobs.map(job => {
            const isUnassigned = job.status === 'searching' || job.status === 'assigned_to_garage';
            const isActive = job.status === 'in_progress' || job.status === 'en_route';
            return (
              <div key={job.id} className={`p-4 rounded-xl border transition-all ${
                !isUnassigned 
                  ? (isLight ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-black/20 border-white/5 opacity-80')
                  : (isLight ? 'bg-white border-yellow-200 shadow-sm' : 'bg-white/5 border-emerald-500/30')
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Customer</h4>
                  <Badge variant={!isUnassigned ? 'success' : 'danger'}>
                    {job.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-red-400 mb-1">{job.issueTag}</p>
                  <p className={`text-sm mb-2 ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>{job.description}</p>
                  <div className={`flex items-center justify-between text-xs ${isLight ? "text-slate-500" : "text-emerald-100/60"}`}>
                     <div className="flex items-center gap-1">
                       <MapPin size={12} className={isLight ? "text-yellow-600" : "text-emerald-400"} />
                       {job.customerLat?.toFixed(4)}, {job.customerLng?.toFixed(4)}
                     </div>
                     <div className="flex items-center gap-1">
                       <Clock size={12} />
                       {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "recently"}
                     </div>
                  </div>
                </div>

                <div className={`border-t pt-3 mt-3 flex items-center justify-between ${isLight ? "border-slate-100" : "border-white/5"}`}>
                  <div>
                    <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${isLight ? "text-slate-400" : "text-emerald-100/50"}`}>Est. Value</p>
                    <p className={`font-bold ${isLight ? "text-yellow-600" : "text-emerald-300"}`}>
                      ₹{job.priceEstimate?.min || 0} - ₹{job.priceEstimate?.max || 0}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {isUnassigned ? (
                      <Button size="sm" onClick={() => openAssignModal(job)}>
                         Dispatch
                      </Button>
                    ) : isActive ? (
                      <Button size="sm" onClick={() => openCompletionModal(job.id)}>
                        <IndianRupee size={14} className="mr-1" /> Bill Customer
                      </Button>
                    ) : (
                      <div className="text-right">
                         <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${isLight ? "text-slate-400" : "text-emerald-100/50"}`}>Assigned To</p>
                         <p className={`font-bold text-sm flex items-center justify-end ${isLight ? "text-slate-900" : "text-white"}`}>
                           <Settings size={12} className={`mr-1 ${isLight ? "text-yellow-600" : "text-emerald-400"}`} /> 
                           {job.mechanic?.name || "Mechanic"}
                         </p>
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this job record?")) {
                          try {
                            await api.delete(`/jobs/${job.id}`);
                            fetchJobs();
                          } catch (e) {
                            alert(`Failed to delete job: ${e.response?.data?.detail || e.message}`);
                          }
                        }
                      }}
                      className={`ml-2 flex items-center justify-center p-1.5 rounded-lg transition-colors text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200`}
                      title="Delete Job"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AssignMechanicModal 
        isOpen={assignModalOpen} 
        onClose={() => setAssignModalOpen(false)} 
        job={selectedJob}
        onAssign={handleAssign}
      />

      {/* ── Job Completion Modal ── */}
      <Modal isOpen={completionModal} onClose={() => setCompletionModal(false)} title="Submit Service Bill">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isLight ? "bg-yellow-500/15" : "bg-emerald-500/20"}`}>
            <IndianRupee size={32} className={isLight ? "text-yellow-600" : "text-emerald-400"} />
          </div>
          <p className={`text-sm ${isLight ? "text-slate-500" : "text-emerald-100/60"}`}>
            Enter the service charge for the work completed. Additional fees (convenience, distance, GST) will be automatically calculated and added to the customer&apos;s bill.
          </p>
        </div>

        <Input
          label="Service Fee (₹)"
          type="number"
          placeholder="e.g. 150"
          value={serviceAmount}
          onChange={(e) => setServiceAmount(e.target.value)}
          icon={IndianRupee}
        />

        {priceError && (
          <div className={`mt-3 flex items-center gap-2 p-3 rounded-xl text-sm ${isLight ? "bg-red-50 border border-red-200 text-red-700" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}>
            <AlertTriangle size={14} className="shrink-0" />
            {priceError}
          </div>
        )}

        {/* Fee Preview */}
        {serviceAmount && parseFloat(serviceAmount) > 0 && (
          <div className={`mt-4 p-4 rounded-xl border text-sm space-y-2 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/20 border-white/5"}`}>
            <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isLight ? "text-slate-400" : "text-emerald-100/50"}`}>Customer will be charged</p>
            <div className={`flex justify-between ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>
              <span>Service Fee</span>
              <span className="font-medium">₹{parseFloat(serviceAmount).toFixed(2)}</span>
            </div>
            <div className={`flex justify-between ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>
              <span>Convenience Fee</span>
              <span className="font-medium">₹40.00</span>
            </div>
            <div className={`flex justify-between ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>
              <span>Cancellation Fee</span>
              <span className="font-medium">₹30.00</span>
            </div>
            <div className={`flex justify-between ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>
              <span>Distance Fee</span>
              <span className="font-medium text-xs italic">calculated</span>
            </div>
            <div className={`flex justify-between ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>
              <span>GST (18%)</span>
              <span className="font-medium text-xs italic">calculated</span>
            </div>
            <div className={`border-t pt-2 mt-2 flex justify-between font-bold ${isLight ? "border-slate-200 text-slate-900" : "border-white/10 text-white"}`}>
              <span>Estimated Total</span>
              <span>₹{(((parseFloat(serviceAmount) + 40 + 30) * 1.18)).toFixed(2)}+</span>
            </div>
            <p className={`text-[10px] ${isLight ? "text-slate-400" : "text-white/30"}`}>
              * Distance fee will be added based on actual distance. Night surcharge applies after 8 PM.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setCompletionModal(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleFinalizePrice} isLoading={submittingPrice}>
            {submittingPrice ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending...</> : "Send Invoice"}
          </Button>
        </div>
      </Modal>
    </GlassCard>
  );
}
