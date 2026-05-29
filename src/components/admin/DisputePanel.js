import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { AlertCircle, FileText, CheckCircle2, DollarSign, AlertTriangle, MessageSquare } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { fetchDisputes, resolveDisputeWithStatus, refundDispute, penalizeProvider, messageDisputeParties } from "../../services/adminService";

export function DisputePanel() {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [messageModal, setMessageModal] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [toast, setToast] = useState(null);
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDisputes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDisputes();
      setDisputes(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const handleResolve = async (id) => {
    setActionLoading(id);
    try {
      await resolveDisputeWithStatus(id, "resolved");
      setDisputes(prev => prev.filter(d => d.id !== id));
      setSelectedDispute(null);
      showToast("Dispute closed successfully.");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to close dispute", "error");
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleRefund = async (dispute) => {
    const amount = parseInt(amountInput) * 100;
    if (!amount || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    setActionLoading("refund");
    try {
      await refundDispute(dispute.id, amount, `Refund processed by admin for dispute ${dispute.id}`);
      setDisputes(prev => prev.filter(d => d.id !== dispute.id));
      setSelectedDispute(null);
      showToast(`Refund of ₹${parseInt(amountInput).toLocaleString("en-IN")} processed.`);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to process refund", "error");
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
      setAmountInput("");
    }
  };

  const handlePenalize = async (dispute) => {
    const amount = parseInt(amountInput) * 100;
    if (!amount || amount <= 0) {
      showToast("Please enter a valid penalty amount", "error");
      return;
    }
    setActionLoading("penalize");
    try {
      await penalizeProvider(dispute.id, amount, `Penalty applied by admin for dispute ${dispute.id}`);
      setDisputes(prev => prev.filter(d => d.id !== dispute.id));
      setSelectedDispute(null);
      showToast(`Penalty of ₹${parseInt(amountInput).toLocaleString("en-IN")} applied.`);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to apply penalty", "error");
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
      setAmountInput("");
    }
  };

  const handleMessage = async () => {
    if (!messageText.trim()) {
      showToast("Please enter a message", "error");
      return;
    }
    setActionLoading("message");
    try {
      await messageDisputeParties(messageModal.id, messageText.trim());
      showToast("Message sent to both parties.");
      setMessageModal(null);
      setMessageText("");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to send message", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? "border-amber-500" : "border-emerald-500"}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${isLight ? "text-red-500" : "text-red-400"}`}>
        <p>{error}</p>
        <button onClick={loadDisputes} className="mt-3 text-sm underline">Retry</button>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium ${
          toast.type === "error"
            ? isLight ? "bg-red-50 border-red-200 text-red-700" : "bg-red-500/20 border-red-500/30 text-red-300"
            : isLight ? "bg-green-50 border-green-200 text-green-700" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row h-full gap-6">
        <GlassCard className="flex-1 flex flex-col overflow-hidden max-h-full">
          <div className={`p-4 border-b flex justify-between items-center ${isLight ? "border-stone-200 bg-stone-50/50" : "border-white/5 bg-white/[0.02]"}`}>
            <h3 className={`font-semibold ${isLight ? "text-stone-900" : "text-white"}`}>Active Disputes</h3>
            <Badge variant="danger">{disputes.length} Open</Badge>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            {disputes.length === 0 ? (
              <div className={`text-center py-12 ${isLight ? "text-stone-400" : "text-white/40"}`}>No active disputes 🎉</div>
            ) : (
              disputes.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDispute(d)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedDispute?.id === d.id
                      ? (isLight ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-red-500/10 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]')
                      : (isLight ? 'bg-white border-stone-200 hover:bg-stone-50' : 'bg-white/5 border-white/10 hover:bg-white/10')
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={d.status === 'Open' ? 'danger' : 'warning'} className="mb-2">{d.status}</Badge>
                    <span className={`text-xs ${isLight ? "text-stone-400" : "text-white/40"}`}>{d.date || "—"}</span>
                  </div>
                  <h4 className={`font-medium mb-1 ${isLight ? "text-stone-900" : "text-white"}`}><AlertCircle size={14} className="inline mr-1 text-red-500 mb-0.5" />{d.reason}</h4>
                  <p className={`text-sm ${isLight ? "text-stone-500" : "text-white/50"}`}>{d.customer} vs {d.provider}</p>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className={`flex-[1.5] flex flex-col overflow-hidden ${isLight ? "bg-stone-50/50" : "bg-black/40"}`}>
          {selectedDispute ? (
            <div className="p-4 sm:p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className={`text-xl font-bold mb-1 ${isLight ? "text-stone-900" : "text-white"}`}>Dispute {selectedDispute.id}</h3>
                  <p className={`text-sm ${isLight ? "text-stone-500" : "text-emerald-100/60"}`}>Related Job: {selectedDispute.jobId}</p>
                </div>
                <Badge variant="danger" className="text-lg">
                  Amount: {selectedDispute.amount}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl border ${isLight ? "bg-white border-stone-200" : "bg-white/5 border-white/10"}`}>
                  <p className={`text-[10px] uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Customer</p>
                  <p className={`font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{selectedDispute.customer}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isLight ? "bg-white border-stone-200" : "bg-white/5 border-white/10"}`}>
                  <p className={`text-[10px] uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Provider</p>
                  <p className={`font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{selectedDispute.provider}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className={`font-medium mb-2 ${isLight ? "text-stone-900" : "text-white"}`}>Customer Complaint</p>
                <div className={`p-4 rounded-xl border text-sm leading-relaxed relative ${isLight ? "bg-red-50 border-red-200 text-red-800" : "bg-red-500/5 border-red-500/20 text-red-100/80"}`}>
                  <AlertCircle className={`absolute -left-2 -top-2 rounded-full ${isLight ? "text-red-500 bg-white" : "text-red-500 bg-black"}`} size={20} />
                  &quot;{selectedDispute.desc}&quot;
                </div>
              </div>

              <div className={`mt-auto space-y-4 pt-6 border-t ${isLight ? "border-stone-200" : "border-white/5"}`}>
                <h4 className={`text-sm font-medium ${isLight ? "text-stone-900" : "text-white"}`}>Resolution Actions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className={isLight ? "border-green-200 text-green-700 hover:bg-green-50" : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"}
                    onClick={() => setConfirmModal({ dispute: selectedDispute, action: "refund" })}
                  >
                    <DollarSign size={14} className="mr-1" /> Refund
                  </Button>
                  <Button
                    variant="outline"
                    className={isLight ? "border-red-200 text-red-600 hover:bg-red-50" : "border-red-500/30 text-red-400 hover:bg-red-500/10"}
                    onClick={() => setConfirmModal({ dispute: selectedDispute, action: "penalize" })}
                  >
                    <AlertTriangle size={14} className="mr-1" /> Penalize
                  </Button>
                  <Button
                    variant="outline"
                    className={isLight ? "border-stone-200 text-stone-600 hover:bg-stone-50" : "border-white/20 text-white/70 hover:bg-white/10"}
                    onClick={() => { setMessageModal(selectedDispute); setMessageText(""); }}
                  >
                    <MessageSquare size={14} className="mr-1" /> Message
                  </Button>
                  <Button
                    onClick={() => setConfirmModal({ dispute: selectedDispute, action: "close" })}
                    isLoading={actionLoading === selectedDispute.id}
                  >
                    <CheckCircle2 size={16} className="mr-1.5" /> Close
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-full ${isLight ? "text-stone-400" : "text-white/30"}`}>
              <FileText size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a dispute to view details</p>
              <p className="text-sm">Choose from the list on the left</p>
            </div>
          )}
        </GlassCard>
      </div>

      <Modal
        isOpen={!!confirmModal}
        onClose={() => { setConfirmModal(null); setAmountInput(""); }}
        title={
          confirmModal?.action === "close" ? "Close Dispute" :
          confirmModal?.action === "refund" ? "Refund Customer" :
          "Penalize Provider"
        }
      >
        {confirmModal?.action === "close" ? (
          <>
            <p className={`mb-6 ${isLight ? "text-stone-600" : "text-white/70"}`}>
              Are you sure you want to close dispute {confirmModal?.dispute?.id}?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Button>
              <Button onClick={() => handleResolve(confirmModal.dispute.id)} isLoading={actionLoading === confirmModal.dispute.id}>
                <CheckCircle2 size={16} className="mr-1.5" /> Close Dispute
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className={`mb-4 ${isLight ? "text-stone-600" : "text-white/70"}`}>
              {confirmModal?.action === "refund"
                ? `Enter the refund amount for ${confirmModal?.dispute?.customer}:`
                : `Enter the penalty amount for ${confirmModal?.dispute?.provider}:`}
            </p>
            <div className="relative mb-6">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-medium ${isLight ? "text-stone-500" : "text-white/50"}`}>₹</span>
              <Input
                type="number"
                placeholder="Enter amount"
                className="pl-8"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setConfirmModal(null); setAmountInput(""); }}>Cancel</Button>
              <Button
                onClick={() =>
                  confirmModal?.action === "refund"
                    ? handleRefund(confirmModal.dispute)
                    : handlePenalize(confirmModal.dispute)
                }
                isLoading={actionLoading === "refund" || actionLoading === "penalize"}
              >
                {confirmModal?.action === "refund" ? "Process Refund" : "Apply Penalty"}
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={!!messageModal}
        onClose={() => { setMessageModal(null); setMessageText(""); }}
        title="Message Both Parties"
      >
        <p className={`mb-4 text-sm ${isLight ? "text-stone-500" : "text-white/60"}`}>
          This message will be sent to both {messageModal?.customer} and {messageModal?.provider}.
        </p>
        <textarea
          className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all min-h-[120px] resize-none mb-6 ${
            isLight
              ? "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none"
              : "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none"
          }`}
          placeholder="Type your message here..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => { setMessageModal(null); setMessageText(""); }}>Cancel</Button>
          <Button onClick={handleMessage} isLoading={actionLoading === "message"}>
            <MessageSquare size={16} className="mr-1.5" /> Send Message
          </Button>
        </div>
      </Modal>
    </>
  );
}
