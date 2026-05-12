"use client";

import { useState, useEffect } from "react";
import { submissionsApi } from "@/lib/api";
import { Submission } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, Search, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await submissionsApi.getAll({ status: filter, search });
      setItems(res.data?.data || res.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter, search]);

  const handleApprove = async (id: string) => {
    try {
      await submissionsApi.approve(id);
      toast.success("Submission approved!");
      fetchData();
      setSelected(null);
    } catch { toast.error("Failed."); }
  };

  const handleReject = async (id: string) => {
    try {
      await submissionsApi.reject(id, rejectNote);
      toast.success("Submission rejected.");
      fetchData();
      setSelected(null);
      setRejectNote("");
    } catch { toast.error("Failed."); }
  };

  const statusIcons = { pending: <Clock className="w-4 h-4 text-yellow-500" />, approved: <CheckCircle className="w-4 h-4 text-green-500" />, rejected: <XCircle className="w-4 h-4 text-red-500" /> };
  const statusColors = { pending: "bg-yellow-100 text-yellow-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-extrabold text-gray-900">User Submissions</h1><p className="text-gray-500 text-sm">Review and approve user-submitted opportunity leads.</p></div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {["pending", "approved", "rejected"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={cn("px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors", filter === s ? "bg-[#1a3c8f] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3c8f]")}>{s}</button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none w-52" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Organization</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Submitted</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6}><div className="h-12 animate-pulse bg-gray-50 m-2 rounded" /></td></tr>)
            ) : items.length > 0 ? (
              items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{item.type}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.organization}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3"><span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex items-center gap-1 w-fit", (statusColors as any)[item.status])}>{(statusIcons as any)[item.status]}{item.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelected(item)} className="p-1.5 text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                      {item.status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(item.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => setSelected(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-400"><Clock className="w-10 h-10 mx-auto mb-2 opacity-20" /><p className="text-sm">No {filter} submissions</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setRejectNote(""); } }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{selected.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{selected.organization} · {selected.type}</p>
            <p className="text-sm text-gray-700 mb-4">{selected.description}</p>
            {selected.link && <a href={selected.link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1a3c8f] hover:underline block mb-4">{selected.link}</a>}
            {selected.status === "pending" && (
              <div className="space-y-3">
                <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={2} placeholder="Rejection note (optional)..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" />
                <div className="flex gap-3">
                  <button onClick={() => handleApprove(selected.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700"><CheckCircle className="w-4 h-4" /> Approve</button>
                  <button onClick={() => handleReject(selected.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600"><XCircle className="w-4 h-4" /> Reject</button>
                </div>
              </div>
            )}
            <button onClick={() => { setSelected(null); setRejectNote(""); }} className="w-full mt-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
