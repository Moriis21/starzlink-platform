"use client";

import { useState, useEffect } from "react";
import { usersApi, adminApi } from "@/lib/api";
import { Shield, Users, Search, ChevronDown, Check } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const roles = [
  { value: "user", label: "User", desc: "Regular platform user — can browse, save, and submit", color: "bg-gray-100 text-gray-700" },
  { value: "admin", label: "Admin", desc: "Manage content, users, and platform operations", color: "bg-blue-100 text-blue-700" },
  { value: "super_admin", label: "Super Admin", desc: "Full platform control — settings, roles, all data", color: "bg-purple-100 text-purple-700" },
];

interface Profile { id: string; full_name: string; phone?: string; role: string; user_type: string; created_at: string; }

export default function AdminRolesPage() {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ limit: 100 });
      setUsers(res.data?.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (userId === currentUser?.id) { toast.error("You cannot change your own role."); return; }
    if (!isSuperAdmin && newRole === "super_admin") { toast.error("Only Super Admins can assign Super Admin role."); return; }
    if (!isSuperAdmin && newRole === "admin" && currentRole === "super_admin") { toast.error("Only Super Admins can demote Super Admins."); return; }

    setPromoting(userId);
    try {
      await usersApi.updateRole(userId, newRole);
      await adminApi.logAction("role_change", "users", `Changed role of user ${userId} from ${currentRole} to ${newRole}`);
      toast.success(`Role updated to ${newRole.replace("_", " ")} successfully!`);
      fetchData();
    } catch { toast.error("Failed to update role."); }
    setPromoting(null);
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (u as any).email?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = roles.reduce((acc, r) => {
    acc[r.value] = users.filter(u => u.role === r.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Roles & Permissions</h1>
        <p className="text-gray-500 text-sm">Manage user roles and access control. {!isSuperAdmin && <span className="text-yellow-600 font-medium">Only Super Admins can assign Super Admin role.</span>}</p>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {roles.map(role => (
          <div key={role.value} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", role.color)}>
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900">{role.label}</h3>
            <p className="text-xs text-gray-500 mb-3">{role.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold text-gray-900">{grouped[role.value] || 0}</span>
              <span className="text-xs text-gray-400">users</span>
            </div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Manage User Roles</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none w-52" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Current Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assign Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-10 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>No users found</p></td></tr>
              ) : filtered.map(u => {
                const roleInfo = roles.find(r => r.value === u.role);
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className={cn("hover:bg-gray-50", isSelf ? "bg-blue-50/30" : "")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#1a3c8f] to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{u.full_name?.charAt(0) || "?"}</div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{u.full_name} {isSelf && <span className="text-xs text-blue-500">(You)</span>}</p>
                          <p className="text-xs text-gray-400">{u.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs capitalize bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{u.user_type}</span></td>
                    <td className="px-4 py-3"><span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", roleInfo?.color || "bg-gray-100 text-gray-600")}>{u.role?.replace("_", " ")}</span></td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className="text-xs text-gray-400 italic">Cannot change own role</span>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          {roles.map(r => {
                            const canAssign = r.value === "super_admin" ? isSuperAdmin : true;
                            const isCurrentRole = u.role === r.value;
                            return (
                              <button
                                key={r.value}
                                onClick={() => !isCurrentRole && canAssign && handleRoleChange(u.id, u.role, r.value)}
                                disabled={isCurrentRole || !canAssign || promoting === u.id}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                                  isCurrentRole ? `${r.color} ring-2 ring-offset-1 ring-current opacity-100 cursor-default` : canAssign ? "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer" : "bg-gray-50 text-gray-300 cursor-not-allowed"
                                )}
                              >
                                {isCurrentRole && <Check className="w-3 h-3 inline mr-1" />}
                                {r.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(u.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
