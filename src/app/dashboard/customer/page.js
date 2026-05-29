"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useServiceStore } from "../../../store/serviceStore";
import { useAuthStore } from "../../../store/authStore";
import { useTrackingStore } from "../../../store/trackingStore";
import { useThemeStore } from "../../../store/themeStore";
import { ServiceRequestPanel } from "../../../components/dashboard/ServiceRequestPanel";
import { ServiceStatusTracker } from "../../../components/dashboard/ServiceStatusTracker";
import { ProviderList } from "../../../components/dashboard/ProviderList";
import { PaymentModal } from "../../../components/dashboard/PaymentModal";
import { ReviewModal } from "../../../components/dashboard/ReviewModal";
import { NotificationBell } from "../../../components/ui/NotificationBell";
import { SOSButton } from "../../../components/ui/SOSButton";
import { LogOut, User, History, Wrench, Wifi, WifiOff } from "lucide-react";
import { SERVICE_STATUS } from "../../../lib/constants";
import api from "../../../lib/api";

const MapView = dynamic(
  () => import("../../../components/dashboard/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-stone-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
    ),
  }
);

// Lazy-loaded history component (Phase 6)
const ServiceHistory = dynamic(
  () => import("../../../components/dashboard/ServiceHistory").then(m => ({ default: m.ServiceHistory })),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin border-amber-500 dark:border-emerald-500" /></div> }
);

export default function CustomerDashboard() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { activeRequest, createRequest, cancelRequest, restoreActiveRequest } = useServiceStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const updateRequestStatus = useCallback(
    (...args) => useServiceStore.getState().updateRequestStatus(...args),
    []
  );
  const completeRequest = useCallback(
    (...args) => useServiceStore.getState().completeRequest(...args),
    []
  );

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewProviderName, setReviewProviderName] = useState("the professional");
  const [paymentAmount, setPaymentAmount] = useState(1200);
  const [activeTab, setActiveTab] = useState("request"); // "request" | "history"

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
    }
  }, [isAuthenticated]);

  // Request GPS location on mount
  useEffect(() => {
    if (isAuthenticated) {
      useTrackingStore.getState().requestGPSLocation();
    }
  }, [isAuthenticated]);

  // Restore active request on mount (handles page refresh)
  useEffect(() => {
    if (isAuthenticated && !activeRequest) {
      restoreActiveRequest();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling fallback: if WebSocket is unavailable, poll job status every 15s
  useEffect(() => {
    if (!activeRequest || !activeRequest.id) return;
    if (activeRequest.status === SERVICE_STATUS.COMPLETED) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/jobs/status/${activeRequest.id}`);
        const serverStatus = res.data?.status;
        if (serverStatus && serverStatus !== activeRequest.status) {
          updateRequestStatus(serverStatus, res.data?.mechanic, true);
        }
      } catch {
        // Silently ignore — WebSocket is the primary channel
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [activeRequest?.id, activeRequest?.status, updateRequestStatus]);

  if (!isAuthenticated) {
    return (
      <div className={`h-screen w-full flex items-center justify-center ${isLight ? "bg-yellow-50" : "bg-[#09090b]"}`}>
        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? "border-yellow-500" : "border-emerald-500"}`} />
      </div>
    );
  }

  const handleRequestSubmit = async (data) => {
    const location = useTrackingStore.getState().userLocation;
    const lat = Array.isArray(location) ? location[0] : undefined;
    const lng = Array.isArray(location) ? location[1] : undefined;
    await createRequest({
      ...data,
      customerLat: lat,
      customerLng: lng,
    });
  };

  const handlePaymentInitiate = (request) => {
    const req = request ?? useServiceStore.getState().activeRequest;
    const name =
      req?.mechanic?.name ?? activeRequest?.mechanic?.name ?? "the professional";
    setReviewProviderName(name);
    // Use finalized totalAmount from pricing if available, else estimate
    const finalAmount = req?.pricing?.totalAmount ?? req?.priceEstimate?.min ?? activeRequest?.priceEstimate?.min ?? 1200;
    setPaymentAmount(finalAmount);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (paymentDetails) => {
    setIsPaymentOpen(false);
    completeRequest(paymentDetails);
    setIsReviewOpen(true);
  };

  const handleReviewSubmit = () => {
    setIsReviewOpen(false);
    setReviewProviderName("the professional");
  };

  const handleCancelRequest = () => {
    cancelRequest();
  };

  return (
    <div className="h-screen w-full flex flex-col p-4 sm:p-6 pb-0 overflow-hidden relative z-10 gap-6">
      <header className={`flex justify-between items-center px-6 py-4 backdrop-blur-xl rounded-2xl flex-shrink-0 relative z-50 ${isLight ? "bg-white/70 border border-slate-200" : "bg-white/5 border border-white/10"}`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold tracking-tighter ${isLight ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : "bg-gradient-to-br from-emerald-400 to-emerald-600"}`}>
            M
          </div>
          <h1 className={`text-xl font-bold tracking-tight hidden sm:block ${isLight ? "text-slate-900" : "text-white"}`}>
            ClutchD
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center gap-1 p-1 rounded-xl ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
          <button
            onClick={() => setActiveTab("request")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "request"
                ? (isLight ? "bg-white text-yellow-700 shadow-sm" : "bg-white/10 text-emerald-300")
                : (isLight ? "text-slate-500 hover:text-slate-700" : "text-white/40 hover:text-white/60")
            }`}
          >
            <Wrench size={14} />
            Service
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "history"
                ? (isLight ? "bg-white text-yellow-700 shadow-sm" : "bg-white/10 text-emerald-300")
                : (isLight ? "text-slate-500 hover:text-slate-700" : "text-white/40 hover:text-white/60")
            }`}
          >
            <History size={14} />
            History
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
              {user?.name || "Customer"}
            </span>
            <span className={`text-[10px] uppercase tracking-wider ${isLight ? "text-yellow-600" : "text-emerald-100/60"}`}>
              Customer Mode
            </span>
          </div>
          <NotificationBell />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? "bg-yellow-500/15 border border-yellow-500/30 text-yellow-600" : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"}`}>
            <User size={18} />
          </div>
          <button
            onClick={logout}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ml-2 ${isLight ? "bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500" : "bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/70 hover:text-red-400"}`}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {activeTab === "request" ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-6">
          <div className="lg:col-span-7 xl:col-span-8 rounded-2xl overflow-hidden relative shadow-2xl h-[300px] sm:h-[400px] lg:h-full lg:min-h-[400px]">
            <MapView />

            <div className={`absolute top-4 left-4 z-[400] backdrop-blur-md px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 ${isLight ? "bg-white/80 border-slate-200 text-slate-700" : "bg-black/60 border-white/10 text-white"}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? "bg-yellow-500" : "bg-emerald-400"}`} />
              Live Area Map
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 h-full flex flex-col min-h-[500px] lg:min-h-0 overflow-y-auto custom-scrollbar pr-1 lg:pr-0 gap-6">
            {!activeRequest ? (
              <>
                <ServiceRequestPanel onSubmit={handleRequestSubmit} />
                <ProviderList />
              </>
            ) : (
              <ServiceStatusTracker
                request={activeRequest}
                onComplete={handlePaymentInitiate}
                onCancel={handleCancelRequest}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
          <ServiceHistory />
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={paymentAmount}
        pricing={activeRequest?.pricing}
        jobId={activeRequest?.id}
        onSuccess={handlePaymentSuccess}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        providerName={reviewProviderName}
        onSubmit={handleReviewSubmit}
      />
      <SOSButton />
    </div>
  );
}
