import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { AlertCircle, FileText, CheckCircle2 } from "lucide-react";

const MOCK_DISPUTES = [
  {
    id: "DSP-1092",
    jobId: "JOB-4812",
    customer: "Amit S.",
    provider: "Vikram Motors",
    reason: "Overcharged for service",
    amount: "₹1,500",
    status: "Open",
    date: "2 hours ago",
    desc: "The mechanic quoted ₹500 in chat but forced me to pay ₹2000 after opening the hood.",
  },
  {
    id: "DSP-1085",
    jobId: "JOB-4755",
    customer: "Neha J.",
    provider: "Raju Mechanic",
    reason: "Mechanic didn't show up",
    amount: "₹300",
    status: "Investigating",
    date: "1 day ago",
    desc: "Waited for 2 hours, mechanic stopped answering phone.",
  }
];

export function DisputePanel() {
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState(null);

  const resolveDispute = (id) => {
    setDisputes(disputes.filter(d => d.id !== id));
    setSelectedDispute(null);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      <GlassCard className="flex-1 flex flex-col overflow-hidden max-h-full">
         <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-semibold text-white">Active Disputes</h3>
            <Badge variant="danger">{disputes.length} Open</Badge>
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
           {disputes.length === 0 ? (
             <div className="text-center py-12 text-white/40">No active disputes 🎉</div>
           ) : (
             disputes.map(d => (
               <div 
                 key={d.id} 
                 onClick={() => setSelectedDispute(d)}
                 className={`p-4 rounded-xl border transition-all cursor-pointer ${
                   selectedDispute?.id === d.id 
                     ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                     : 'bg-white/5 border-white/10 hover:bg-white/10'
                 }`}
               >
                 <div className="flex justify-between items-start mb-2">
                   <Badge variant={d.status === 'Open' ? 'danger' : 'warning'} className="mb-2">{d.status}</Badge>
                   <span className="text-xs text-white/40">{d.date}</span>
                 </div>
                 <h4 className="font-medium text-white mb-1"><AlertCircle size={14} className="inline mr-1 text-red-400 mb-0.5" />{d.reason}</h4>
                 <p className="text-sm text-white/50">{d.customer} vs {d.provider}</p>
               </div>
             ))
           )}
         </div>
      </GlassCard>

      {/* Resolution Panel */}
      <GlassCard className="flex-[1.5] flex flex-col overflow-hidden bg-black/40">
        {selectedDispute ? (
          <div className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Dispute {selectedDispute.id}</h3>
                <p className="text-sm text-emerald-100/60">Related Job: {selectedDispute.jobId}</p>
              </div>
              <Badge variant="danger" className="text-lg">
                Amount: {selectedDispute.amount}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase mb-1">Customer</p>
                <p className="font-medium text-white">{selectedDispute.customer}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-white/40 uppercase mb-1">Provider</p>
                <p className="font-medium text-white">{selectedDispute.provider}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="font-medium text-white mb-2">Customer Complaint</p>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-sm text-red-100/80 leading-relaxed relative">
                <AlertCircle className="absolute -left-2 -top-2 text-red-500 bg-black rounded-full" size={20} />
                &quot;{selectedDispute.desc}&quot;
              </div>
            </div>
            
            <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
              <h4 className="text-sm font-medium text-white">Resolution Actions</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">Refund Customer</Button>
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">Penalize Provider</Button>
                <Button variant="outline" className="border-white/20 text-white/70 hover:bg-white/10">Message Both</Button>
                <Button className="bg-emerald-500 text-black hover:bg-emerald-400" onClick={() => resolveDispute(selectedDispute.id)}>
                   <CheckCircle2 size={16} className="mr-1.5" /> Close Dispute
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/30">
            <FileText size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Select a dispute to view details</p>
            <p className="text-sm">Choose from the list on the left</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
