"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Navigation, CheckCircle2, AlertTriangle, MapPin, Clock, IndianRupee, Loader2 } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { useTrackingStore } from "../../store/trackingStore";
import api from "../../lib/api";

export function IncomingJobs() {
  const [jobs, setJobs] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useThemeStore();
  const { setNavigationTarget } = useTrackingStore();
  const isLight = theme === "light";

  // --- Job Completion Modal State ---
  const [completionModal, setCompletionModal] = useState(false);
  const [completionJobId, setCompletionJobId] = useState(null);
  const [serviceAmount, setServiceAmount] = useState("");
  const [submittingPrice, setSubmittingPrice] = useState(false);
  const [priceError, setPriceError] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await api.get("/jobs/incoming");
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setJobs([]);
      } else {
        setError(err.response ? "Failed to load jobs." : "Server unreachable.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 15000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const acceptJob = async (id) => {
    try {
      await api.patch(`/service/request/${id}/status`, { status: "en_route" });
      setJobs(jobs.map(j => j.id === id ? { ...j, status: "accepted" } : j));
      showToast("Job accepted! Navigate to the customer's location.");
    } catch (err) {
      showToast(`Failed to accept: ${err.response?.data?.detail || err.message}`);
    }
  };

  const rejectJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
  };
  
  // Opens the completion modal instead of directly completing the job
  const openCompletionModal = (id) => {
    setCompletionJobId(id);
    setServiceAmount("");
    setPriceError("");
    setCompletionModal(true);
  };

  // Submits the service fee to backend, triggering price calculation
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
    <GlassCard variant="strong" className="p-4 sm:p-6 h-full flex flex-col relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 backdrop-blur-xl rounded-xl shadow-lg animate-in slide-in-from-top-2 max-w-[90%] ${isLight ? "bg-green-50 border border-green-200" : "bg-emerald-500/20 border border-emerald-500/30"}`}>
          <CheckCircle2 size={16} className={isLight ? "text-green-600 shrink-0" : "text-emerald-400 shrink-0"} />
          <span className={`text-sm font-medium ${isLight ? "text-green-800" : "text-emerald-100"}`}>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className={`text-xl font-bold tracking-tight ${isLight ? "text-stone-900" : "text-white"}`}>Job Queue</h2>
           <p className={`text-sm ${isLight ? "text-stone-500" : "text-emerald-100/60"}`}>Manage your service requests</p>
        </div>
        <Badge variant="warning" className="animate-pulse">
           {jobs.filter(j => j.status === 'pending' || j.status === 'assigned').length} Request(s)
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {isLoading ? (
           <div className={`h-full flex flex-col items-center justify-center ${isLight ? "text-stone-400" : "text-white/40"}`}>
             <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${isLight ? "border-amber-500/30 border-t-amber-500" : "border-emerald-500/30 border-t-emerald-500"}`}></div>
             <p>Loading jobs...</p>
           </div>
        ) : error ? (
           <div className={`h-full flex flex-col items-center justify-center ${isLight ? "text-stone-400" : "text-white/40"}`}>
             <AlertTriangle size={40} className="mb-4 text-amber-400/50" />
             <p>{error}</p>
             <Button variant="ghost" size="sm" className="mt-2" onClick={fetchJobs}>Retry</Button>
           </div>
        ) : jobs.length === 0 ? (
           <div className={`h-full flex flex-col items-center justify-center ${isLight ? "text-stone-400" : "text-white/40"}`}>
             <Clock size={40} className="mb-4 opacity-50" />
             <p>No jobs in queue.</p>
             <p className="text-sm">Stay online to receive requests.</p>
           </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className={`p-4 rounded-xl border transition-all ${
              job.status === 'accepted' || job.status === 'en_route' || job.status === 'in_progress'
                ? (isLight ? 'bg-green-50 border-green-200' : 'bg-emerald-500/10 border-emerald-500/30')
                : (isLight ? 'bg-white border-stone-200' : 'bg-white/5 border-white/10')
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-semibold ${isLight ? "text-stone-900" : "text-white"}`}>{job.issueTag || job.customer || "Service Request"}</h4>
                <span className={`text-xs flex items-center ${isLight ? "text-stone-400" : "text-white/50"}`}>
                  <Clock size={12} className="mr-1"/>
                  {job.createdAt ? new Date(job.createdAt).toLocaleTimeString() : "—"}
                </span>
              </div>
              
              <div className="mb-3">
                <Badge variant={job.status === 'assigned' || job.status === 'pending' ? 'danger' : 'success'} className="mb-2">
                  {job.issueTag || "Unknown"}
                </Badge>
                <p className={`text-sm mb-2 ${isLight ? "text-stone-600" : "text-emerald-100/80"}`}>{job.description || "No description"}</p>
                {job.mechanic?.distance && (
                  <div className={`flex items-center text-xs font-medium ${isLight ? "text-stone-500" : "text-emerald-100/60"}`}>
                     <MapPin size={12} className={`mr-1 ${isLight ? "text-amber-600" : "text-emerald-400"}`} />
                     {job.mechanic.distance} away
                  </div>
                )}
              </div>

              <div className={`border-t pt-3 mt-3 flex items-center justify-between ${isLight ? "border-stone-100" : "border-white/5"}`}>
                <div>
                  <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${isLight ? "text-stone-400" : "text-emerald-100/50"}`}>Est. Cost</p>
                  <p className={`font-bold ${isLight ? "text-amber-700" : "text-emerald-300"}`}>
                    {job.priceEstimate ? `₹${job.priceEstimate.min} - ₹${job.priceEstimate.max}` : "—"}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {(job.status === 'assigned' || job.status === 'pending' || job.status === 'searching') ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => rejectJob(job.id)}>Decline</Button>
                      <Button size="sm" onClick={() => acceptJob(job.id)}>Accept Job</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        if (job.customerLocation) {
                          setNavigationTarget(job.customerLocation);
                          showToast("Navigating to customer location...");
                        } else {
                          showToast("Customer location not available.");
                        }
                      }}>
                        <Navigation size={14} className="mr-1.5" /> Navigate
                      </Button>
                      <Button size="sm" onClick={() => openCompletionModal(job.id)}>
                        <IndianRupee size={14} className="mr-1" /> Bill Customer
                      </Button>
                    </>
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
          ))
        )}
      </div>

      {/* ── Job Completion Modal ── */}
      <Modal isOpen={completionModal} onClose={() => setCompletionModal(false)} title="Submit Service Bill">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${isLight ? "bg-yellow-500/15" : "bg-emerald-500/20"}`}>
            <IndianRupee size={32} className={isLight ? "text-yellow-600" : "text-emerald-400"} />
          </div>
          <p className={`text-sm ${isLight ? "text-slate-500" : "text-emerald-100/60"}`}>
            Enter the service charge for the work you completed. Additional fees (convenience, distance, GST) will be automatically calculated and added to the customer&apos;s bill.
          </p>
        </div>

        <Input
          label="Your Service Fee (₹)"
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
