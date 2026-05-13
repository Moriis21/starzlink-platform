"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { eventsApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { Plus, Search, Edit, Trash2, Calendar } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  upcoming: "text-blue-700 bg-blue-50",
  ongoing: "text-green-700 bg-green-50",
  past: "text-gray-600 bg-gray-50",
  cancelled: "text-red-700 bg-red-50",
};

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await eventsApi.getAll(params);
      const d = res.data;
      setEvents(d?.data ?? []);
      setTotalPages(d?.total_pages ?? 1);
      setTotal(d?.total ?? 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search, status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await eventsApi.delete(id);
    toast.success("Event deleted");
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Events Management</h1>
          <p className="text-gray-500 text-sm">Manage all events and deadlines.</p>
        </div>
        <Link href="/admin/events/new" className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-900 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Event
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search events..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="past">Past</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="self-center text-sm text-gray-500">{total} total</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Event</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : events.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No events found.</td></tr>
            ) : events.map(ev => (
              <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900 line-clamp-1">{ev.title}</p>
                  {ev.organizer && <p className="text-xs text-gray-400">{ev.organizer}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                  <span className="capitalize text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{ev.event_type?.replace("_", " ")}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(ev.event_date)}</span>
                  {ev.start_time && <span className="text-gray-400">{ev.start_time}{ev.end_time ? ` - ${ev.end_time}` : ""}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_COLORS[ev.status] ?? "text-gray-500 bg-gray-50")}>{ev.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => router.push(`/admin/events/${ev.id}/edit`)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(ev.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
