import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Search, DollarSign, CreditCard, Receipt, RefreshCw } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { fetchPayments } from "../../services/adminService";
import api from "../../lib/api";

export function PaymentsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [refundModal, setRefundModal] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== "All") {
        params.status = statusFilter.toLowerCase();
      }
      const data = await fetchPayments(params);
      setPayments(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [statusFilter]);

  const filtered = payments.filter(p =>
    p.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefund = async () => {
    if (!refundModal) return;
    const amount = parseInt(refundAmount) * 100;
    if (!amount || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    setActionLoading("refund");
    try {
      await api.post(`/admin/payments/${refundModal.id}/refund`, {
        amount,
        notes: `Refund processed by admin for payment ${refundModal.id}`,
      });
      setPayments(prev => prev.filter(p => p.id !== refundModal.id));
      showToast(`Refund of ₹${parseInt(refundAmount).toLocaleString("en-IN")} processed.`);
      setRefundModal(null);
      setRefundAmount("");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to process refund", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const statusOptions = ["All", "Pending", "Captured", "Failed", "Refunded"];

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

      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-stone-400" : "text-white/50"}`} />
            <Input placeholder="Search by user or payment ID..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto custom-scrollbar">
            {statusOptions.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  statusFilter === s
                    ? isLight ? "bg-amber-500 text-white shadow-sm" : "bg-emerald-500 text-black"
                    : isLight ? "bg-stone-100 text-stone-600 hover:bg-stone-200" : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? "border-amber-500" : "border-emerald-500"}`} />
          </div>
        ) : error ? (
          <div className={`py-12 text-center ${isLight ? "text-red-500" : "text-red-400"}`}>
            <p>{error}</p>
            <button onClick={loadData} className="mt-3 text-sm underline">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className={`w-full text-left text-sm ${isLight ? "text-stone-600" : "text-white/70"}`}>
              <thead className={`text-xs uppercase border-b ${isLight ? "text-stone-400 border-stone-200" : "text-white/40 border-white/5"}`}>
                <tr>
                  <th className="px-4 pb-3 font-medium">Payment ID</th>
                  <th className="px-4 pb-3 font-medium">User</th>
                  <th className="px-4 pb-3 font-medium">Amount</th>
                  <th className="px-4 pb-3 font-medium">Status</th>
                  <th className="px-4 pb-3 font-medium">Method</th>
                  <th className="px-4 pb-3 font-medium">Provider</th>
                  <th className="px-4 pb-3 font-medium">Date</th>
                  <th className="px-4 pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className={`border-b transition-colors ${isLight ? "border-stone-100 hover:bg-stone-50" : "border-white/5 hover:bg-white/5"}`}>
                    <td className={`px-4 py-4 font-mono text-xs ${isLight ? "text-stone-400" : "text-white/50"}`}>{p.id?.slice(0, 8)}</td>
                    <td className={`px-4 py-4 font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{p.userName}</td>
                    <td className={`px-4 py-4 font-semibold ${isLight ? "text-stone-900" : "text-white"}`}>{p.formattedAmount}</td>
                    <td className="px-4 py-4">
                      <Badge variant={
                        p.status === "Captured" ? "success" :
                        p.status === "Pending" ? "warning" :
                        p.status === "Failed" ? "danger" :
                        "info"
                      }>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1">
                        <CreditCard size={12} className={isLight ? "text-stone-400" : "text-white/50"} />
                        {p.method}
                      </span>
                    </td>
                    <td className={`px-4 py-4 capitalize ${isLight ? "text-stone-500" : "text-white/60"}`}>{p.provider}</td>
                    <td className={`px-4 py-4 text-xs ${isLight ? "text-stone-400" : "text-white/50"}`}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {p.status === "Captured" && (
                        <button
                          onClick={() => { setRefundModal(p); setRefundAmount(""); }}
                          disabled={actionLoading === "refund"}
                          className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
                            isLight ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                          }`}
                        >
                          <RefreshCw size={12} /> Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className={`py-12 text-center ${isLight ? "text-stone-400" : "text-white/40"}`}>
                No payments found.
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <Modal isOpen={!!refundModal} onClose={() => { setRefundModal(null); setRefundAmount(""); }} title="Process Refund">
        {refundModal && (
          <>
            <p className={`mb-4 ${isLight ? "text-stone-600" : "text-white/70"}`}>
              Refund for <strong>{refundModal.userName}</strong> — original amount: <strong>{refundModal.formattedAmount}</strong>
            </p>
            <div className="relative mb-6">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-medium ${isLight ? "text-stone-500" : "text-white/50"}`}>₹</span>
              <Input type="number" placeholder="Enter refund amount" className="pl-8" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setRefundModal(null); setRefundAmount(""); }}>Cancel</Button>
              <Button onClick={handleRefund} isLoading={actionLoading === "refund"}>
                <DollarSign size={16} className="mr-1.5" /> Process Refund
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
