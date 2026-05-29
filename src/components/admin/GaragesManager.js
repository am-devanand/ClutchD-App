import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Search, Star, MapPin, Phone, Users, Clock, Wrench, Eye, CheckCircle, XCircle } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { fetchGarages, verifyGarage } from "../../services/adminService";

export function GaragesManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
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
      const data = await fetchGarages();
      setGarages(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load garages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleVerify = async (garage) => {
    setActionLoading(garage.id);
    try {
      const newVerified = !garage.verified;
      await verifyGarage(garage.id, newVerified);
      setGarages(prev => prev.map(g =>
        g.id === garage.id ? { ...g, verified: newVerified } : g
      ));
      showToast(`${garage.garageName} ${newVerified ? "verified" : "unverified"}.`);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to update", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = garages.filter(g =>
    g.garageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.phone?.includes(searchTerm)
  );

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
            <Input placeholder="Search by name, owner, or phone..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Badge variant="info">{garages.length} Total</Badge>
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
                  <th className="px-4 pb-3 font-medium">Garage Name</th>
                  <th className="px-4 pb-3 font-medium">Owner</th>
                  <th className="px-4 pb-3 font-medium">Phone</th>
                  <th className="px-4 pb-3 font-medium">Rating</th>
                  <th className="px-4 pb-3 font-medium">Mechanics</th>
                  <th className="px-4 pb-3 font-medium">Jobs Done</th>
                  <th className="px-4 pb-3 font-medium">Verified</th>
                  <th className="px-4 pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} className={`border-b transition-colors ${isLight ? "border-stone-100 hover:bg-stone-50" : "border-white/5 hover:bg-white/5"}`}>
                    <td className={`px-4 py-4 font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{g.garageName}</td>
                    <td className={`px-4 py-4 ${isLight ? "text-stone-600" : "text-white/70"}`}>{g.ownerName}</td>
                    <td className={`px-4 py-4 ${isLight ? "text-stone-500" : "text-white/60"}`}>{g.phone}</td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1">
                        <Star size={12} className={isLight ? "text-amber-500" : "text-amber-400"} />
                        {g.rating}
                      </span>
                    </td>
                    <td className="px-4 py-4">{g.mechanicCount}</td>
                    <td className={`px-4 py-4 ${isLight ? "text-stone-600" : "text-white/70"}`}>{g.jobsCompleted}</td>
                    <td className="px-4 py-4">
                      <Badge variant={g.verified ? "success" : "warning"}>{g.verified ? "Verified" : "Pending"}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setProfileModal(g)}
                          className={`p-1.5 rounded transition-colors ${isLight ? "hover:bg-stone-100 text-stone-400 hover:text-stone-600" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleVerify(g)}
                          disabled={actionLoading === g.id}
                          className={`p-1.5 rounded transition-colors ${
                            g.verified
                              ? isLight ? "hover:bg-red-50 text-red-500 hover:text-red-600" : "hover:bg-red-500/10 text-red-400 hover:text-red-300"
                              : isLight ? "hover:bg-green-50 text-green-600 hover:text-green-700" : "hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300"
                          }`}
                          title={g.verified ? "Unverify" : "Verify"}
                        >
                          {g.verified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className={`py-12 text-center ${isLight ? "text-stone-400" : "text-white/40"}`}>
                No garages found matching &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <Modal isOpen={!!profileModal} onClose={() => setProfileModal(null)} title="Garage Profile" maxWidth="max-w-lg">
        {profileModal && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Garage Name</p>
              <p className={`font-medium text-lg ${isLight ? "text-stone-900" : "text-white"}`}>{profileModal.garageName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Owner</p>
                <p className={`font-medium ${isLight ? "text-stone-800" : "text-white"}`}>{profileModal.ownerName}</p>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Phone</p>
                <p className={`font-medium flex items-center gap-1 ${isLight ? "text-stone-800" : "text-white"}`}><Phone size={14} /> {profileModal.phone}</p>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Services</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {(profileModal.services || []).length > 0
                  ? profileModal.services.map((s, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${isLight ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"}`}>
                        <Wrench size={12} /> {s}
                      </span>
                    ))
                  : <span className="text-sm text-stone-400">None specified</span>
                }
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Location</p>
              <p className={`font-medium flex items-center gap-1 ${isLight ? "text-stone-800" : "text-white"}`}><MapPin size={14} /> {profileModal.location || `${profileModal.lat?.toFixed(4)}, ${profileModal.lon?.toFixed(4)}`}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Operating Hours</p>
                <p className={`font-medium flex items-center gap-1 ${isLight ? "text-stone-800" : "text-white"}`}><Clock size={14} /> {profileModal.operatingHours || "—"}</p>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Mechanics</p>
                <p className={`font-medium flex items-center gap-1 ${isLight ? "text-stone-800" : "text-white"}`}><Users size={14} /> {profileModal.mechanicCount}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Rating</p>
                <p className={`font-medium flex items-center gap-1 ${isLight ? "text-stone-800" : "text-white"}`}><Star size={14} className="text-amber-500" /> {profileModal.rating}</p>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Penalty</p>
                <p className={`font-medium ${profileModal.penalized ? (isLight ? "text-red-600" : "text-red-400") : (isLight ? "text-stone-800" : "text-white")}`}>
                  {profileModal.penalized ? `₹${(profileModal.penaltyAmount / 100).toLocaleString("en-IN")}` : "None"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Badge variant={profileModal.verified ? "success" : "warning"}>{profileModal.verified ? "Verified" : "KYC Pending"}</Badge>
              <Badge variant={profileModal.penalized ? "danger" : "default"}>{profileModal.penalized ? "Penalized" : "Clean"}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
