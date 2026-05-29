"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { fetchPendingKyc, verifyMechanic, verifyGarage } from "../../services/adminService";

export function KYCApproval() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPendingKyc();
      setApplications(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load KYC applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async (app) => {
    setActionLoading(app.id);
    try {
      if (app.profileType === "garage") {
        await verifyGarage(app.id, true);
      } else {
        await verifyMechanic(app.id, true);
      }
      setApplications(prev => prev.filter(a => a.id !== app.id));
      showToast(`${app.name} approved successfully.`);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to approve", "error");
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleReject = async (app) => {
    setActionLoading(app.id);
    try {
      if (app.profileType === "garage") {
        await verifyGarage(app.id, false);
      } else {
        await verifyMechanic(app.id, false);
      }
      setApplications(prev => prev.filter(a => a.id !== app.id));
      showToast(`${app.name} rejected.`);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to reject", "error");
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

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

      {loading ? (
        <div className="col-span-full py-12 text-center">
          <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto ${isLight ? "border-amber-500" : "border-emerald-500"}`} />
        </div>
      ) : error ? (
        <div className={`col-span-full py-12 text-center ${isLight ? "text-red-500" : "text-red-400"}`}>
          <p>{error}</p>
          <button onClick={loadApplications} className="mt-3 text-sm underline">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {applications.length === 0 ? (
            <div className={`col-span-full py-12 text-center ${isLight ? "text-stone-400" : "text-white/50"}`}>
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>No pending KYC applications.</p>
            </div>
          ) : (
            applications.map((app) => (
              <GlassCard key={app.id} className="p-5 sm:p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-lg font-bold ${isLight ? "text-stone-900" : "text-white"}`}>{app.name}</h3>
                    <p className={`text-xs font-medium ${isLight ? "text-amber-700" : "text-emerald-400"}`}>{app.type}</p>
                  </div>
                  <Badge variant="warning">{app.status}</Badge>
                </div>

                <div className="mb-4">
                  <p className={`text-xs mb-2 ${isLight ? "text-stone-400" : "text-white/40"}`}>Submitted {app.submitted}</p>
                  <p className={`text-sm font-medium mb-1 ${isLight ? "text-stone-700" : "text-white/80"}`}>Attached Documents:</p>
                  <ul className={`text-sm space-y-1 ${isLight ? "text-stone-500" : "text-white/60"}`}>
                    {app.documents.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <FileText size={12} className={isLight ? "text-amber-500" : "text-emerald-500/70"} /> {doc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`mt-auto grid grid-cols-2 gap-3 pt-4 border-t ${isLight ? "border-stone-200" : "border-white/5"}`}>
                  <Button
                    variant="outline"
                    className={isLight ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" : "text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"}
                    isLoading={actionLoading === app.id}
                    onClick={() => setConfirmModal({ app, action: "reject" })}
                  >
                    <XCircle size={16} className="mr-2" /> Reject
                  </Button>
                  <Button
                    onClick={() => setConfirmModal({ app, action: "approve" })}
                    isLoading={actionLoading === app.id}
                  >
                    <CheckCircle size={16} className="mr-2" /> Approve
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.action === "approve" ? "Approve KYC" : "Reject KYC"}
      >
        <p className={`mb-6 ${isLight ? "text-stone-600" : "text-white/70"}`}>
          {confirmModal?.action === "approve"
            ? `Are you sure you want to approve ${confirmModal?.app?.name}?`
            : `Are you sure you want to reject ${confirmModal?.app?.name}?`}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmModal(null)}>Cancel</Button>
          <Button
            variant={confirmModal?.action === "approve" ? "primary" : "danger"}
            onClick={() =>
              confirmModal?.action === "approve"
                ? handleApprove(confirmModal.app)
                : handleReject(confirmModal.app)
            }
          >
            {confirmModal?.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
