"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Archive, RefreshCw, Trash2, RotateCcw, Calendar, Search,
  Briefcase, GraduationCap, BookOpen, Globe, Clock, CheckCircle,
  AlertTriangle, Download, Play, X, ChevronDown, Filter
} from "lucide-react";

type ContentType = "all" | "jobs" | "scholarships" | "trainings" | "opportunities";
type StatusTab = "expired" | "archived";

const TYPE_OPTIONS: { value: ContentType; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All Types", icon: Globe },
  { value: "jobs", label: "Jobs", icon: Briefcase },
  { value: "scholarships", label: "Scholarships", icon: GraduationCap },
  { value: "trainings", label: "Trainings", icon: BookOpen },
  { value: "opportunities", label: "Opportunities", icon: Globe },
];

const STATUS_BADGES: Record<string, string> = {
  expired: "bg-red-100 text-red-700",
  archived: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700",
  deleted: "bg-red-200 text-red-800",
};

interface Record { id: string; title: string; status: string; deadline?: string; created_at: string; expired_at?: string; archived_at?: string; _table: string; _type: string; }

export default function ExpiredContentPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<StatusTab>("expired");
  const [typeFilter, setTypeFilter] = useState<ContentType>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record | null>(null);
  const [modal, setModal] = useState<"restore" | "extend" | "archive" | "delete" | null>(null);
  const [newDeadline, setNewDeadline] = useState("");
  const [extendReason, setExtendReason] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: typeFilter, status: statusTab });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/expired?${params}`);
      const data = await res.json();
      setRecords(data.records ?? []);
      setStats(data.stats ?? {});
    } catch { toast.error("Failed to load expired records"); }
    setLoading(false);
  }, [typeFilter, statusTab, search]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const runCleanup = async () => {
    setCleaning(true);
    setCleanupResult(null);
    try {
      const res = await fetch("/api/admin/cleanup", { method: "POST" });
      const data = await res.json();
      setCleanupResult(data.message);
      toast.success(data.message);
      fetchRecords();
    } catch { toast.error("Cleanup failed."); }
    setCleaning(false);
  };

  const doAction = async () => {
    if (!selected || !modal) return;
    if (modal === "delete" && deleteConfirm !== "DELETE") {
      toast.error('Type "DELETE" to confirm permanent deletion.'); return;
    }
    setActionLoading(true);
    try {
      const body: any = { action: modal, id: selected.id, table: selected._table };
      if (modal === "extend" || modal === "restore") body.newDeadline = newDeadline || undefined;
      if (modal === "extend") body.reason = extendReason;

      const res = await fetch("/api/admin/expired", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const msgs: Record<string, string> = { restore: "Record restored and made public.", extend: "Deadline extended and record restored.", archive: "Record archived.", delete: "Record permanently deleted." };
      toast.success(msgs[modal] || "Done.");
      setModal(null); setSelected(null); setNewDeadline(""); setExtendReason(""); setDeleteConfirm("");
      fetchRecords();
    } catch (e: any) { toast.error(e.message || "Action failed."); }
    setActionLoading(false);
  };

  const totalExpired = Object.values(stats).reduce((s: number, n: any) => s + (n || 0), 0) as number;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Archive className="w-6 h-6 text-[#1a3c8f]" /> Expired Content Manager
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Review, restore, extend, archive, or permanently delete expired records.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={runCleanup} disabled={cleaning}
            className="flex items-center gap-1.5 bg-[#1a3c8f] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-900 disabled:opacity-60">
            {cleaning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {cleaning ? "Running..." : "Run Expired Cleanup"}
          </button>
          <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Cleanup result */}
      {cleanupResult && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {cleanupResult}
          <button onClick={() => setCleanupResult(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Expired", value: totalExpired, icon: Clock, color: "bg-red-50 text-red-700 border-red-200" },
          { label: "Jobs", value: stats.jobs ?? 0, icon: Briefcase, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Scholarships", value: stats.scholarships ?? 0, icon: GraduationCap, color: "bg-purple-50 text-purple-700 border-purple-200" },
          { label: "Trainings", value: stats.trainings ?? 0, icon: BookOpen, color: "bg-orange-50 text-orange-700 border-orange-200" },
          { label: "Opportunities", value: stats.opportunities ?? 0, icon: Globe, color: "bg-green-50 text-green-700 border-green-200" },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <s.icon className="w-5 h-5 mb-2 opacity-70" />
            <p className="text-2xl font-extrabold">{loading ? "—" : s.value}</p>
            <p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Status tabs + filters */}
        <div className="border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between p-4 gap-3">
            <div className="flex gap-1">
              {(["expired", "archived"] as StatusTab[]).map(s => (
                <button key={s} onClick={() => setStatusTab(s)}
                  className={cn("px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors",
                    statusTab === s ? "bg-[#1a3c8f] text-white" : "text-gray-500 hover:bg-gray-100")}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as ContentType)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none bg-white">
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none w-44" />
              </div>
              <button onClick={fetchRecords} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50" title="Refresh">
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <Archive className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {statusTab === "expired" ? "No expired content found. All active records are within their deadlines." : "No archived content yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Title", "Type", "Deadline", "Expired On", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map(r => (
                    <tr key={`${r._table}-${r.id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 text-sm max-w-xs truncate">{r.title}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full capitalize">{r._type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {r.deadline ? new Date(r.deadline).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {r.expired_at ? formatDate(r.expired_at) : r.archived_at ? formatDate(r.archived_at) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full capitalize", STATUS_BADGES[r.status] ?? "bg-gray-100 text-gray-500")}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelected(r); setModal("restore"); }}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Restore">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelected(r); setModal("extend"); }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Extend Deadline">
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelected(r); setModal("archive"); }}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Archive">
                            <Archive className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelected(r); setModal("delete"); }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {records.map(r => (
                <div key={`${r._table}-${r.id}`} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm leading-snug flex-1">{r.title}</p>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 capitalize", STATUS_BADGES[r.status])}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap text-xs text-gray-400">
                    <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">{r._type}</span>
                    {r.deadline && <span>Deadline: {new Date(r.deadline).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex gap-2">
                    {[
                      { action: "restore" as const, label: "Restore", icon: RotateCcw, color: "text-green-700 border-green-200 hover:bg-green-50" },
                      { action: "extend" as const, label: "Extend", icon: Calendar, color: "text-blue-700 border-blue-200 hover:bg-blue-50" },
                      { action: "archive" as const, label: "Archive", icon: Archive, color: "text-gray-700 border-gray-200 hover:bg-gray-50" },
                      { action: "delete" as const, label: "Delete", icon: Trash2, color: "text-red-600 border-red-200 hover:bg-red-50" },
                    ].map(btn => (
                      <button key={btn.action} onClick={() => { setSelected(r); setModal(btn.action); }}
                        className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border", btn.color)}>
                        <btn.icon className="w-3.5 h-3.5" />{btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {modal && selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) { setModal(null); setSelected(null); } }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">

            {/* Restore */}
            {modal === "restore" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="font-extrabold text-gray-900">Restore Record</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Restoring: <strong>{selected.title}</strong>
                </p>
                {selected.deadline && new Date(selected.deadline) < new Date() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    The original deadline has passed. Enter a new future deadline to restore.
                  </div>
                )}
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">New Deadline (optional)</label>
                <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] mb-4" />
                <div className="flex gap-3">
                  <button onClick={doAction} disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60 text-sm">
                    {actionLoading ? "Restoring..." : "Restore Record"}
                  </button>
                  <button onClick={() => { setModal(null); setSelected(null); }} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 text-sm">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Extend */}
            {modal === "extend" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="font-extrabold text-gray-900">Extend Deadline</h2>
                </div>
                <p className="text-sm text-gray-600 mb-1"><strong>{selected.title}</strong></p>
                <p className="text-xs text-gray-400 mb-4">
                  Current deadline: {selected.deadline ? new Date(selected.deadline).toLocaleDateString() : "None"}
                </p>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">New Deadline *</label>
                <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] mb-3" required />
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Reason for Extension</label>
                <input value={extendReason} onChange={e => setExtendReason(e.target.value)} placeholder="e.g. More applications needed"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] mb-4" />
                <div className="flex gap-3">
                  <button onClick={doAction} disabled={actionLoading || !newDeadline}
                    className="flex-1 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60 text-sm">
                    {actionLoading ? "Extending..." : "Extend & Restore"}
                  </button>
                  <button onClick={() => { setModal(null); setSelected(null); }} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 text-sm">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Archive */}
            {modal === "archive" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Archive className="w-5 h-5 text-gray-600" />
                  </div>
                  <h2 className="font-extrabold text-gray-900">Archive Record</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Archive <strong>{selected.title}</strong>? It will be hidden from all public pages and kept for internal records.
                </p>
                <div className="flex gap-3">
                  <button onClick={doAction} disabled={actionLoading}
                    className="flex-1 bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-800 disabled:opacity-60 text-sm">
                    {actionLoading ? "Archiving..." : "Archive Record"}
                  </button>
                  <button onClick={() => { setModal(null); setSelected(null); }} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 text-sm">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* Delete */}
            {modal === "delete" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <h2 className="font-extrabold text-gray-900">Permanently Delete</h2>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  You are about to permanently delete: <strong>{selected.title}</strong>
                </p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 mb-4">
                  ⚠️ This action <strong>cannot be undone</strong>. The record will be permanently removed from the database.
                </div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Type <strong>DELETE</strong> to confirm</label>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE"
                  className="w-full border border-red-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 mb-4 font-mono" />
                <div className="flex gap-3">
                  <button onClick={doAction} disabled={actionLoading || deleteConfirm !== "DELETE"}
                    className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:opacity-60 text-sm">
                    {actionLoading ? "Deleting..." : "Delete Permanently"}
                  </button>
                  <button onClick={() => { setModal(null); setSelected(null); setDeleteConfirm(""); }} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 text-sm">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
