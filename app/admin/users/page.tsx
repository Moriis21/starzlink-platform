"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { formatDate, cn } from "@/lib/utils";
import {
  Search, Users, Loader2, MoreVertical, ShieldOff, ShieldCheck,
  Trash2, Eye, X, ChevronLeft, ChevronRight, UserCog, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

interface AppUser {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role: "user" | "admin" | "super_admin";
  user_type: string;
  is_suspended?: boolean;
  created_at: string;
}

const roleColors: Record<string, string> = {
  user: "bg-gray-100 text-gray-600",
  admin: "bg-blue-100 text-blue-700",
  super_admin: "bg-purple-100 text-purple-700",
};

const PAGE_SIZE = 15;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AppUser | null>(null);
  const [viewUser, setViewUser] = useState<AppUser | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter, statusFilter]);

  const handleSuspend = async (u: AppUser) => {
    setActionLoading(u.id);
    try {
      const newVal = !u.is_suspended;
      await insforge.database.from("profiles").update({ is_suspended: newVal }).eq("id", u.id);
      toast.success(newVal ? `${u.full_name || "User"} suspended.` : `${u.full_name || "User"} reactivated.`);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_suspended: newVal } : x));
    } catch { toast.error("Failed."); }
    setActionLoading(null);
    setOpenMenu(null);
  };

  const handleDelete = async (u: AppUser) => {
    setActionLoading(u.id);
    try {
      // Delete from profiles table (the auth user record stays but profile is gone)
      await insforge.database.from("profiles").delete().eq("id", u.id);
      // Also attempt to delete from InsForge auth (admin endpoint)
      await fetch(`https://8qn72bza.us-east.insforge.app/auth/v1/admin/users/${u.id}`, {
        method: "DELETE",
        headers: { "apikey": "ik_6d6c0108a931deb33707cad6a802a9ed", "Authorization": "Bearer ik_6d6c0108a931deb33707cad6a802a9ed" },
      }).catch(() => {}); // best-effort
      toast.success(`${u.full_name || "User"} permanently deleted.`);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setTotal(t => t - 1);
    } catch { toast.error("Delete failed."); }
    setActionLoading(null);
    setConfirmDelete(null);
  };

  const handleRoleChange = async (u: AppUser, newRole: string) => {
    setActionLoading(u.id);
    try {
      await insforge.database.from("profiles").update({ role: newRole }).eq("id", u.id);
      toast.success(`Role changed to ${newRole.replace("_", " ")}.`);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole as any } : x));
    } catch { toast.error("Failed."); }
    setActionLoading(null);
    setOpenMenu(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Users Management</h1>
          <p className="text-gray-500 text-sm">Manage all registered users · {total.toLocaleString()} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a3c8f]"
          />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none bg-white">
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none bg-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array(6).fill(0).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className={cn("hover:bg-gray-50 transition-colors", u.is_suspended && "bg-red-50/30")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#1a3c8f] to-blue-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{u.full_name || "—"}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">{u.user_type || "user"}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", roleColors[u.role])}>
                      {u.role?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    {u.is_suspended ? (
                      <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">Suspended</span>
                    ) : (
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      {actionLoading === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <button onClick={() => setViewUser(u)} className="p-1.5 text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-lg" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                              title="More actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openMenu === u.id && (
                              <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-20 w-48 py-1">
                                {/* Role change */}
                                <div className="px-3 py-1.5">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Change Role</p>
                                  {["user", "admin", "super_admin"].map(r => (
                                    <button
                                      key={r}
                                      onClick={() => handleRoleChange(u, r)}
                                      disabled={u.role === r}
                                      className={cn("w-full text-left text-xs px-2 py-1.5 rounded-lg capitalize transition-colors",
                                        u.role === r ? "text-gray-300 cursor-default" : "text-gray-700 hover:bg-blue-50 hover:text-[#1a3c8f]")}
                                    >
                                      <span className={cn("inline-block w-2 h-2 rounded-full mr-1.5", roleColors[r]?.split(" ")[0])} />
                                      {r.replace("_", " ")}
                                    </button>
                                  ))}
                                </div>
                                <div className="border-t border-gray-100 mt-1 pt-1">
                                  {/* Suspend / Reactivate */}
                                  <button
                                    onClick={() => handleSuspend(u)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors"
                                  >
                                    {u.is_suspended ? (
                                      <><ShieldCheck className="w-3.5 h-3.5 text-green-500" /><span className="text-green-700 font-medium">Reactivate Account</span></>
                                    ) : (
                                      <><ShieldOff className="w-3.5 h-3.5 text-orange-500" /><span className="text-orange-700 font-medium">Suspend Account</span></>
                                    )}
                                  </button>
                                  {/* Delete */}
                                  <button
                                    onClick={() => { setConfirmDelete(u); setOpenMenu(null); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-red-600 font-medium">Delete Permanently</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}

      {/* ── User Detail Modal ── */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setViewUser(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-gray-900">User Details</h2>
              <button onClick={() => setViewUser(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1a3c8f] to-blue-400 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-2">
                {viewUser.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <p className="font-bold text-gray-900">{viewUser.full_name}</p>
              <p className="text-sm text-gray-500">{viewUser.email}</p>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: "Role", value: viewUser.role?.replace("_", " ") },
                { label: "Account Type", value: viewUser.user_type },
                { label: "Phone", value: viewUser.phone || "—" },
                { label: "Status", value: viewUser.is_suspended ? "🔴 Suspended" : "🟢 Active" },
                { label: "Joined", value: formatDate(viewUser.created_at) },
                { label: "User ID", value: viewUser.id.slice(0, 16) + "…" },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400 text-xs">{row.label}</span>
                  <span className="font-medium text-gray-900 text-xs capitalize">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { handleSuspend(viewUser); setViewUser(null); }}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors",
                  viewUser.is_suspended ? "border-green-200 text-green-700 hover:bg-green-50" : "border-orange-200 text-orange-700 hover:bg-orange-50")}
              >
                {viewUser.is_suspended ? <><ShieldCheck className="w-3.5 h-3.5" /> Reactivate</> : <><ShieldOff className="w-3.5 h-3.5" /> Suspend</>}
              </button>
              <button
                onClick={() => { setConfirmDelete(viewUser); setViewUser(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900 text-center mb-1">Delete Permanently?</h2>
            <p className="text-sm text-gray-500 text-center mb-1">
              You are about to permanently delete:
            </p>
            <p className="text-center font-bold text-gray-900 mb-1">{confirmDelete.full_name}</p>
            <p className="text-center text-xs text-gray-400 mb-5">{confirmDelete.email}</p>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 mb-5">
              ⚠️ This action <strong>cannot be undone</strong>. The user's profile, saved items, and account data will be permanently removed from the system.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={actionLoading === confirmDelete.id}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:opacity-60 text-sm"
              >
                {actionLoading === confirmDelete.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
