import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { MapPin, Navigation, Clock, AlertTriangle, Crosshair } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { fetchJobs, forceAssignJob, trackJob } from "../../services/adminService";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

export function JobMonitor() {
  const [filter, setFilter] = useState("All");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [forceAssignModal, setForceAssignModal] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [providerType, setProviderType] = useState("mechanic");
  const [trackMapModal, setTrackMapModal] = useState(null);
  const [trackData, setTrackData] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter !== "All") {
        const statusMap = {
          "Searching": "searching",
          "En Route": "en_route",
          "In Progress": "in_progress",
          "Nearing Completion": "in_progress",
        };
        params.status = statusMap[filter] || filter.toLowerCase();
      }
      const data = await fetchJobs(params);
      setJobs(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleForceAssign = async () => {
    if (!selectedProvider || !forceAssignModal) {
      showToast("Please select a provider", "error");
      return;
    }
    setActionLoading(forceAssignModal.id);
    try {
      await forceAssignJob(forceAssignModal.id, providerType, selectedProvider);
      showToast(`Job ${forceAssignModal.id} force-assigned.`);
      setForceAssignModal(null);
      setSelectedProvider("");
      loadJobs();
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to force assign", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleTrackMap = async (job) => {
    setTrackMapModal(job);
    setMapLoading(true);
    setTrackData(null);
    try {
      const data = await trackJob(job.id);
      setTrackData(data);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to load tracking data", "error");
    } finally {
      setMapLoading(false);
    }
  };

  const statusFilters = ["All", "Searching", "En Route", "In Progress", "Nearing Completion"];

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

      <GlassCard className="h-full flex flex-col overflow-hidden">
        <div className={`p-4 border-b flex gap-2 overflow-x-auto custom-scrollbar ${isLight ? "border-stone-200" : "border-white/5"}`}>
          {statusFilters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? (isLight ? 'bg-amber-500 text-white shadow-sm' : 'bg-emerald-500 text-black')
                  : (isLight ? 'bg-stone-100 text-stone-600 hover:bg-stone-200' : 'bg-white/5 text-white hover:bg-white/10')
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? "border-amber-500" : "border-emerald-500"}`} />
            </div>
          ) : error ? (
            <div className={`flex flex-col items-center py-12 ${isLight ? "text-red-500" : "text-red-400"}`}>
              <p>{error}</p>
              <button onClick={loadJobs} className="mt-3 text-sm underline">Retry</button>
            </div>
          ) : jobs.length === 0 ? (
            <div className={`py-12 text-center ${isLight ? "text-stone-400" : "text-white/40"}`}>
              No jobs found.
            </div>
          ) : (
            jobs.filter(j => filter === "All" || j.status === filter).map(job => (
              <div key={job.id} className={`p-4 rounded-xl border flex flex-col lg:flex-row gap-4 lg:items-center justify-between ${isLight ? "bg-white border-stone-200" : "bg-black/20 border-white/5"}`}>
                <div className="grid grid-cols-2 lg:flex gap-4 lg:gap-8 flex-1">
                   <div>
                     <p className={`text-[10px] uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Job ID / Time</p>
                     <p className={`text-sm font-mono ${isLight ? "text-stone-900" : "text-white"}`}>{job.id?.slice(0, 8)}</p>
                     <p className={`text-xs mt-1 flex items-center gap-1 ${isLight ? "text-amber-600" : "text-emerald-400"}`}><Clock size={10} /> {job.time}</p>
                   </div>

                   <div>
                     <p className={`text-[10px] uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Parties</p>
                     <p className={`text-sm font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{job.customer}</p>
                     <p className={`text-xs ${isLight ? "text-stone-500" : "text-white/60"}`}>via {job.provider}</p>
                   </div>

                   <div>
                     <p className={`text-[10px] uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Issue / Amount</p>
                     <p className={`text-sm font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{job.issue}</p>
                     <p className={`text-xs ${isLight ? "text-amber-700" : "text-emerald-300"}`}>{job.amount}</p>
                   </div>

                   <div className="col-span-2 lg:col-span-1">
                     <p className={`text-[10px] uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Location</p>
                     <p className={`text-sm flex items-center gap-1 ${isLight ? "text-stone-600" : "text-white/80"}`}><MapPin size={12} className={isLight ? "text-amber-500" : "text-emerald-500"} /> {job.location}</p>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                   <Badge variant={
                     job.status === 'Searching' ? 'warning' :
                     job.status === 'In Progress' ? 'success' : 'info'
                   }>
                     {job.status}
                   </Badge>

                   <div className="flex gap-2">
                     {job.status === 'Searching' && (
                       <button
                         onClick={() => { setForceAssignModal(job); setSelectedProvider(""); setProviderType("mechanic"); }}
                         className={`text-xs flex items-center gap-1 px-2 py-1 rounded border ${isLight ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"}`}
                       >
                         <AlertTriangle size={12} /> Force Assign
                       </button>
                     )}
                     <button
                       onClick={() => handleTrackMap(job)}
                       className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-colors ${isLight ? "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200" : "bg-white/5 hover:bg-white/10 text-white border-white/10"}`}
                     >
                       <Navigation size={12} /> Track Map
                     </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <Modal
        isOpen={!!forceAssignModal}
        onClose={() => { setForceAssignModal(null); setSelectedProvider(""); }}
        title={`Force Assign — ${forceAssignModal?.id?.slice(0, 8)}`}
      >
        {forceAssignModal && (
          <div className="space-y-4">
            <p className={`text-sm ${isLight ? "text-stone-600" : "text-white/70"}`}>
              Force-assign {forceAssignModal.issue} job for {forceAssignModal.customer} to a provider.
            </p>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isLight ? "text-stone-700" : "text-white/80"}`}>Provider Type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setProviderType("mechanic")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                    providerType === "mechanic"
                      ? isLight ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : isLight ? "bg-white border-stone-200 text-stone-500" : "bg-white/5 border-white/10 text-white/60"
                  }`}
                >
                  Mechanic
                </button>
                <button
                  onClick={() => setProviderType("garage")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${
                    providerType === "garage"
                      ? isLight ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : isLight ? "bg-white border-stone-200 text-stone-500" : "bg-white/5 border-white/10 text-white/60"
                  }`}
                >
                  Garage
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isLight ? "text-stone-700" : "text-white/80"}`}>Provider ID (UUID)</label>
              <input
                type="text"
                placeholder={providerType === "mechanic" ? "Enter mechanic ID..." : "Enter garage ID..."}
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-sm transition-all ${
                  isLight
                    ? "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none"
                    : "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:outline-none"
                }`}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => { setForceAssignModal(null); setSelectedProvider(""); }}>Cancel</Button>
              <Button onClick={handleForceAssign} isLoading={actionLoading === forceAssignModal.id}>
                <Crosshair size={16} className="mr-1.5" /> Force Assign
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!trackMapModal}
        onClose={() => { setTrackMapModal(null); setTrackData(null); }}
        title={`Track Map — ${trackMapModal?.id?.slice(0, 8)}`}
        maxWidth="max-w-3xl"
      >
        {mapLoading ? (
          <div className="flex justify-center py-12">
            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? "border-amber-500" : "border-emerald-500"}`} />
          </div>
        ) : trackData ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className={`flex-1 p-3 rounded-xl border ${isLight ? "bg-emerald-50 border-emerald-200" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                <p className={`text-[10px] uppercase mb-1 ${isLight ? "text-emerald-600" : "text-emerald-300"}`}>Customer</p>
                <p className={`text-sm font-medium ${isLight ? "text-emerald-800" : "text-emerald-200"}`}>
                  {trackMapModal.customer}<br/>
                  <span className="text-xs opacity-70">{trackData.customerLat?.toFixed(4)}, {trackData.customerLon?.toFixed(4)}</span>
                </p>
              </div>
              {trackData.providerLat && (
                <div className={`flex-1 p-3 rounded-xl border ${isLight ? "bg-blue-50 border-blue-200" : "bg-blue-500/10 border-blue-500/20"}`}>
                  <p className={`text-[10px] uppercase mb-1 ${isLight ? "text-blue-600" : "text-blue-300"}`}>Provider</p>
                  <p className={`text-sm font-medium ${isLight ? "text-blue-800" : "text-blue-200"}`}>
                    {trackMapModal.provider}<br/>
                    <span className="text-xs opacity-70">{trackData.providerLat?.toFixed(4)}, {trackData.providerLon?.toFixed(4)}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="h-[350px] rounded-xl overflow-hidden border">
              {typeof window !== "undefined" && (
                <MapContainer center={[trackData.customerLat || 20, trackData.customerLon || 78]} zoom={13} className="h-full w-full" scrollWheelZoom={true}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[trackData.customerLat, trackData.customerLon]}>
                    <Popup>{trackMapModal.customer} (Customer)</Popup>
                  </Marker>
                  {trackData.providerLat && trackData.providerLon && (
                    <Marker position={[trackData.providerLat, trackData.providerLon]}>
                      <Popup>{trackMapModal.provider} (Provider)</Popup>
                    </Marker>
                  )}
                </MapContainer>
              )}
            </div>
          </div>
        ) : (
          <div className={`py-12 text-center ${isLight ? "text-stone-400" : "text-white/40"}`}>
            No tracking data available.
          </div>
        )}
      </Modal>
    </>
  );
}
