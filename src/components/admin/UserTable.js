import { useState, useEffect, useRef } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Search, MoreVertical, Eye, ShieldOff, ShieldCheck } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { fetchUsers, toggleUserStatus } from "../../services/adminService";

export function UserTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const dropdownRef = useRef(null);
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (roleFilter !== "All Roles") {
        params.role = roleFilter.toLowerCase().replace(/s$/, "");
      }
      if (statusFilter !== "All Status") {
        params.status = statusFilter.toLowerCase();
      }
      const data = await fetchUsers(params);
      setUsers(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (user) => {
    setActionLoading(user.id);
    try {
      const newActive = user.status === "Suspended";
      await toggleUserStatus(user.id, newActive);
      setUsers(prev => prev.map(u =>
        u.id === user.id
          ? { ...u, status: newActive ? "Active" : "Suspended" }
          : u
      ));
      showToast(`${user.name} ${newActive ? "activated" : "suspended"}.`);
      setOpenDropdown(null);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to update user status", "error");
    } finally {
      setActionLoading(null);
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

      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-stone-400" : "text-white/50"}`} />
            <Input
              placeholder="Search by name or ID..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isLight ? "bg-white border border-stone-200 text-stone-700 focus:ring-amber-500/20" : "bg-white/5 border border-white/10 text-white focus:ring-emerald-500/50"}`}
            >
              <option className={isLight ? "bg-white" : "bg-[#064e3b]"}>All Roles</option>
              <option className={isLight ? "bg-white" : "bg-[#064e3b]"}>Customers</option>
              <option className={isLight ? "bg-white" : "bg-[#064e3b]"}>Mechanics</option>
              <option className={isLight ? "bg-white" : "bg-[#064e3b]"}>Garages</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isLight ? "bg-white border border-stone-200 text-stone-700 focus:ring-amber-500/20" : "bg-white/5 border border-white/10 text-white focus:ring-emerald-500/50"}`}
            >
              <option className={isLight ? "bg-white" : "bg-[#064e3b]"}>All Status</option>
              <option className={isLight ? "bg-white" : "bg-[#064e3b]"}>Active</option>
              <option className={isLight ? "bg-white" : "bg-[#064e3b]"}>Suspended</option>
              <option className={isLight ? "bg-white" : "bg-[#064e3b]"}>Pending</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isLight ? "border-amber-500" : "border-emerald-500"}`} />
          </div>
        ) : error ? (
          <div className={`py-12 text-center ${isLight ? "text-red-500" : "text-red-400"}`}>
            <p>{error}</p>
            <button onClick={loadUsers} className="mt-3 text-sm underline">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className={`w-full text-left text-sm ${isLight ? "text-stone-600" : "text-white/70"}`}>
              <thead className={`text-xs uppercase border-b ${isLight ? "text-stone-400 border-stone-200" : "text-white/40 border-white/5"}`}>
                <tr>
                  <th className="px-4 pb-3 font-medium">User ID</th>
                  <th className="px-4 pb-3 font-medium">Name</th>
                  <th className="px-4 pb-3 font-medium">Role</th>
                  <th className="px-4 pb-3 font-medium">Status</th>
                  <th className="px-4 pb-3 font-medium">Joined Date</th>
                  <th className="px-4 pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={`border-b transition-colors ${isLight ? "border-stone-100 hover:bg-stone-50" : "border-white/5 hover:bg-white/5"}`}>
                    <td className={`px-4 py-4 font-mono text-xs ${isLight ? "text-stone-400" : "text-white/50"}`}>{user.id?.slice(0, 8)}</td>
                    <td className={`px-4 py-4 font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{user.name}</td>
                    <td className="px-4 py-4">{user.role}</td>
                    <td className="px-4 py-4">
                      <Badge variant={
                        user.status === 'Active' ? 'success' :
                        user.status === 'Suspended' ? 'danger' : 'warning'
                      }>
                        {user.status}
                      </Badge>
                    </td>
                    <td className={`px-4 py-4 ${isLight ? "text-stone-400" : "text-white/50"}`}>{user.joined}</td>
                    <td className="px-4 py-4 text-right relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                        className={`p-1 rounded transition-colors ${isLight ? "hover:bg-stone-100 text-stone-400 hover:text-stone-600" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openDropdown === user.id && (
                        <div
                          ref={dropdownRef}
                          className={`absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border shadow-2xl overflow-hidden ${
                            isLight ? "bg-white border-stone-200" : "bg-zinc-900 border-white/10"
                          }`}
                        >
                          <button
                            onClick={() => { setProfileModal(user); setOpenDropdown(null); }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                              isLight ? "text-stone-700 hover:bg-stone-50" : "text-white/80 hover:bg-white/5"
                            }`}
                          >
                            <Eye size={14} /> View Profile
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={actionLoading === user.id}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                              user.status === "Suspended"
                                ? isLight ? "text-green-600 hover:bg-green-50" : "text-emerald-400 hover:bg-emerald-500/10"
                                : isLight ? "text-red-600 hover:bg-red-50" : "text-red-400 hover:bg-red-500/10"
                            }`}
                          >
                            {user.status === "Suspended" ? (
                              <><ShieldCheck size={14} /> Activate User</>
                            ) : (
                              <><ShieldOff size={14} /> Suspend User</>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className={`py-12 text-center ${isLight ? "text-stone-400" : "text-white/40"}`}>
                No users found matching &quot;{searchTerm}&quot;
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <Modal isOpen={!!profileModal} onClose={() => setProfileModal(null)} title="User Profile">
        {profileModal && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Name</p>
              <p className={`font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{profileModal.name}</p>
            </div>
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>User ID</p>
              <p className={`font-mono text-sm ${isLight ? "text-stone-900" : "text-white"}`}>{profileModal.id}</p>
            </div>
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Role</p>
              <p className={`font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{profileModal.role}</p>
            </div>
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Status</p>
              <Badge variant={
                profileModal.status === 'Active' ? 'success' :
                profileModal.status === 'Suspended' ? 'danger' : 'warning'
              }>{profileModal.status}</Badge>
            </div>
            <div className={`p-4 rounded-xl border ${isLight ? "bg-stone-50 border-stone-200" : "bg-white/5 border-white/10"}`}>
              <p className={`text-xs uppercase mb-1 ${isLight ? "text-stone-400" : "text-white/40"}`}>Joined</p>
              <p className={`font-medium ${isLight ? "text-stone-900" : "text-white"}`}>{profileModal.joined}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
