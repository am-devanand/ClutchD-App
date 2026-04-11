import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Search, MoreVertical } from "lucide-react";

const MOCK_USERS = [
  { id: "U1092", name: "Rahul Sharma", role: "Customer", status: "Active", joined: "12 Mar 2024" },
  { id: "P2041", name: "Vijay Kumar", role: "Mechanic", status: "Active", joined: "05 Feb 2024" },
  { id: "G3055", name: "Speedy Garage", role: "Garage", status: "Suspended", joined: "28 Jan 2024" },
  { id: "U1095", name: "Priya Singh", role: "Customer", status: "Active", joined: "14 Mar 2024" },
  { id: "P2045", name: "Amit Patel", role: "Mechanic", status: "Pending", joined: "15 Mar 2024" },
];

export function UserTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <Input 
            placeholder="Search by name or ID..." 
            className="pl-9 bg-white/5 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            <option className="bg-[#064e3b]">All Roles</option>
            <option className="bg-[#064e3b]">Customers</option>
            <option className="bg-[#064e3b]">Mechanics</option>
            <option className="bg-[#064e3b]">Garages</option>
          </select>
          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
            <option className="bg-[#064e3b]">All Status</option>
            <option className="bg-[#064e3b]">Active</option>
            <option className="bg-[#064e3b]">Suspended</option>
            <option className="bg-[#064e3b]">Pending</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="text-xs uppercase text-white/40 border-b border-white/5">
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
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 font-mono text-xs text-white/50">{user.id}</td>
                <td className="px-4 py-4 font-medium text-white">{user.name}</td>
                <td className="px-4 py-4">{user.role}</td>
                <td className="px-4 py-4">
                  <Badge variant={
                    user.status === 'Active' ? 'success' : 
                    user.status === 'Suspended' ? 'danger' : 'warning'
                  }>
                    {user.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-white/50">{user.joined}</td>
                <td className="px-4 py-4 text-right">
                  <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-white/40">
            No users found matching &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
    </GlassCard>
  );
}
