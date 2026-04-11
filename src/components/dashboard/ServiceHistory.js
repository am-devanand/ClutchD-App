"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Calendar, Download, MapPin, Loader2, Wrench } from "lucide-react";
import api, { extractApiError } from "../../lib/api";
import { useThemeStore } from "../../store/themeStore";
import { format } from "date-fns";
import { PaymentModal } from "./PaymentModal";

export function ServiceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentJob, setPaymentJob] = useState(null);
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const fetchHistory = async () => {
    try {
      const res = await api.get("/jobs/history");
      setHistory(res.data.jobs || []);
    } catch (e) {
      console.warn("Failed to fetch history", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePaymentSuccess = async (details) => {
    try {
      // Record payment completion
      if (paymentJob) {
         await api.post(`/service/request/${paymentJob.id}/complete`, details);
      }
    } catch (e) {
      console.warn("Completion sync failed", e);
    }
    setPaymentJob(null);
    fetchHistory();
  };

  const downloadInvoice = async (jobId) => {
    try {
      const res = await api.get(`/jobs/history/${jobId}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${jobId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      alert(extractApiError(e, "Failed to download invoice. Note: PDF generation may not be available on server."));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 size={40} className={`animate-spin mb-4 ${isLight ? "text-yellow-500" : "text-emerald-500"}`} />
        <p className={isLight ? "text-slate-500" : "text-white/40"}>Loading your history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/20 border-white/5"}`}>
        <Wrench size={48} className={`mb-4 opacity-50 ${isLight ? "text-slate-300" : "text-white/20"}`} />
        <h3 className={`text-xl font-semibold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>No History Yet</h3>
        <p className={isLight ? "text-slate-500" : "text-emerald-100/60"}>
          Your completed and cancelled service requests will appear here.
        </p>
      </div>
    );
  }

  // Import PaymentModal dynamically or standard if it's already in the top imports
  return (
    <div className="space-y-4">
      {history.map(job => (
        <GlassCard key={job.id} variant="strong" className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
               <h4 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{job.issueTag}</h4>
               <Badge variant={job.status === "completed" ? "success" : "danger"}>
                 {job.status.toUpperCase()}
               </Badge>
            </div>
            <p className={`text-sm mb-3 line-clamp-2 ${isLight ? "text-slate-600" : "text-emerald-100/80"}`}>{job.description}</p>
            
            <div className={`flex flex-wrap items-center gap-4 text-xs ${isLight ? "text-slate-500" : "text-emerald-100/60"}`}>
               <div className="flex items-center gap-1.5">
                 <Calendar size={14} className={isLight ? "text-yellow-600" : "text-emerald-400"} />
                 {job.createdAt ? format(new Date(job.createdAt), "MMM d, yyyy h:mm a") : "Unknown Date"}
               </div>
               {job.mechanic && (
                 <div className="flex items-center gap-1.5">
                   <Wrench size={14} className={isLight ? "text-yellow-600" : "text-emerald-400"} />
                   Serviced by: {job.mechanic.name}
                 </div>
               )}
            </div>
          </div>
          
          {job.status === "completed" && (
            <div className={`flex sm:flex-col items-center sm:items-end justify-between pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-6 ${isLight ? "border-slate-200" : "border-white/10"}`}>
              <div className="text-left sm:text-right mb-0 sm:mb-3">
                <p className={`text-[10px] uppercase tracking-wider mb-1 ${isLight ? "text-slate-400" : "text-emerald-100/50"}`}>
                  {job.isPaid ? "Amount Paid" : "Amount Due"}
                </p>
                <p className={`text-xl font-bold ${isLight ? "text-yellow-600" : "text-emerald-400"}`}>
                  ₹{job.priceEstimate?.min || 0}
                </p>
              </div>
              
              {!job.isPaid ? (
                <button 
                  onClick={() => setPaymentJob(job)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow transition-transform active:scale-95 ${isLight ? "bg-yellow-600 hover:bg-yellow-500" : "bg-emerald-600 hover:bg-emerald-500"}`}
                >
                  Pay Now
                </button>
              ) : (
                <button 
                  onClick={() => downloadInvoice(job.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isLight 
                      ? "bg-slate-100 text-slate-700 hover:bg-yellow-50 hover:text-yellow-700 active:bg-yellow-100" 
                      : "bg-white/10 text-white hover:bg-white/20 active:bg-white/30"
                  }`}
                >
                  <Download size={14} />
                  Invoice
                </button>
              )}
            </div>
          )}
        </GlassCard>
      ))}

      {paymentJob && (
        <PaymentModal
          isOpen={!!paymentJob}
          onClose={() => setPaymentJob(null)}
          amount={paymentJob.priceEstimate?.min || 0}
          jobId={paymentJob.id}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
