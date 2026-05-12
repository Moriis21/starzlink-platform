"use client";

import { useState, useEffect } from "react";
import { usersApi } from "@/lib/api";
import { User } from "@/types";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

const roleColors: Record<string, string> = {
  user: "bg-gray-100 text-gray-600", admin: "bg-blue-100 text-blue-700", super_admin: "bg-purple-100 text-purple-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      if (search) params.search = search;
      const res = await usersApi.getAll(params);
      setUsers(res.data?.data || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await usersApi.delete(id);
      toast.success("User deleted.");
      fetchData();
    } catch { toast.error("Failed."); }
  };

  const columns = [
    {
      key: "full_name", label: "User",
      render: (u: User) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a3c8f] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{u.full_name?.charAt(0)}</div>
          <div><p className="font-semibold text-gray-900 text-sm">{u.full_name}</p><p className="text-xs text-gray-500">{u.email}</p></div>
        </div>
      )
    },
    { key: "phone", label: "Phone", render: (u: User) => <span className="text-xs">{u.phone || "-"}</span> },
    { key: "user_type", label: "Type", render: (u: User) => <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">{u.user_type}</span> },
    { key: "role", label: "Role", render: (u: User) => <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", roleColors[u.role])}>{u.role?.replace("_", " ")}</span> },
    { key: "created_at", label: "Joined", render: (u: User) => <span className="text-xs text-gray-500">{formatDate(u.created_at)}</span> },
  ];

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-extrabold text-gray-900">Users Management</h1><p className="text-gray-500 text-sm">Manage all registered users on StarzLink.</p></div>
      <AdminTable title="Users" addHref="#" columns={columns as any} data={users} loading={loading} search={search} onSearchChange={setSearch} onDelete={handleDelete} onEdit={() => {}} total={total} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
