import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Search, Star, Wrench, MapPin, Phone, ShieldCheck, ShieldOff, Eye, CheckCircle, XCircle } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { fetchMechanics, verifyMechanic } from "../../services/adminService";

export function MechanicsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mechanics, setMechanics] = useState([]);
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
      const data = await fetchMechanics();
      setMechanics(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load mechanics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleVerify = async (mechanic) => {
    setActionLoading(mechanic.id);
    try {
      const newVerified = !mechanic.verified;
      await verifyMechanic(mechanic.id, newVerified);
      setMechanics(prev => prev.map(m =>
        m.id === mechanic.id ? { ...m, verified: newVerified } : m
      ));
      showToast(`${mechanic.fullName} ${newVerified ? "verified" : "unverified"}.`);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to update", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = mechanics.filter(m =>
    m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.includes(searchTerm) ||
    m.expertise?.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <Input placeholder="Search by name, phone, or skill..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Badge variant="info">{mechanics.length} Total</Badge>
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
                  <th className="px-4 pb-3 font-medium">Name</th>
                  <th className="px-4 pb-3 font-medium">Phone</th>
                  <th className="px-4 pb-3 font-medium">Skills</th>
                  <th className="px-4 pb-3 font-medium">Rating</th>
                  <th className="px-4 pb-3 font-medium">Jobs Done</th>
                  <th className="px-4 pb-3 font-medium">Verified</th>
                  <th className="px-4 pb-3 font-medium">Available</th>
                  <th className="px-4 pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className={`border-b transition-colors ${isLight ? "border-stone-100 hover:bg-stone-50" : "border-white/5 hover:bg-white/5"}`}>
                    <td className={`px-4 py-4 font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{m.fullName}</td>
                    <td className={`px-4 py-4 ${isLight ? "text-stone-500" : "text-white/60"}`}>{m.phone}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(m.expertise || []).slice(0, 2).map((s, i) => (
                          <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${isLight ? "bg-stone-100 text-stone-600" : "bg-white/10 text-white/70"}`}>{s}</span>
                        ))}
                        {(m.expertise || []).length > 2 && <span className="text-[10px] text-stone-400">+{m.expertise.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1">
                        <Star size={12} className={isLight ? "text-amber-500" : "text-amber-400"} />
                        {m.rating}
                      </span>
                    </td>
                    <td className={`px-4 py-4 ${isLight ? "text-stone-600" : "text-white/70"}`}>{m.jobsCompleted}</td>
                    <td className="px-4 py-4">
                      <Badge variant={m.verified ? "success" : "warning"}>{m.verified ? "Verified" : "Pending"}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`flex items-center gap-1 ${m.available ? (isLight ? "text-green-600" : "text-emerald-400") : (isLight ? "text-red-500" : "text-red-400")}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.available ? "bg-green-500" : "bg-red-500"}`} />
                        {m.available ? "Available" : "Busy"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setProfileModal(m)}
                          className={`p-1.5 rounded transition-colors ${isLight ? "hover:bg-stone-100 text-stone-400 hover:text-stone-600" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleVerify(m)}
                          disabled={actionLoading === m.id}
                          className={`p-1.5 rounded transition-colors ${
                            m.verified
                              ? isLight ? "hover:bg-red-50 text-red-500 hover:text-red-600" : "hover:bg-red-500/10 text-red-400 hover:text-red-300"
                              : isLight ? "hover:bg-green-50 text-green-600 hover:text-green-700" : "hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300"
                          }`}
                          title={m.verified ? "Unverify" : "Verify"}
                        >
                          {m.verified ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className={`py-12 text-center ${isLight ? "text-stone-400" : "text-white/40"}`}>
                No mechanics found matching &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <Modal isOpen={!!profileModal} onClose={() => setProfileModal(null)} title="Mechanic Profile" maxWidth="max-w-lg">
        {profileModal && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Name</p>
              <p className={`font-medium text-lg ${isLight ? "text-stone-900" : "text-white"}`}>{profileModal.fullName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Phone</p>
                <p className={`font-medium flex items-center gap-1 ${isLight ? "text-stone-800" : "text-white"}`}><Phone size={14} /> {profileModal.phone}</p>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Experience</p>
                <p className={`font-medium ${isLight ? "text-stone-800" : "text-white"}`}>{profileModal.experience || "—"}</p>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {(profileModal.expertise || []).length > 0
                  ? profileModal.expertise.map((s, i) => (
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
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Rating</p>
                <p className={`font-medium flex items-center gap-1 ${isLight ? "text-stone-800" : "text-white"}`}><Star size={14} className="text-amber-500" /> {profileModal.rating}</p>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
                <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Jobs Done</p>
                <p className={`font-medium ${isLight ? "text-stone-800" : "text-white"}`}>{profileModal.jobsCompleted}</p>
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
