"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { formatDate, cn } from "@/lib/utils";
import {
  CheckCircle, XCircle, Clock, Search, Eye, X, Megaphone,
  User, Building2, IdCard, BookOpen, Calendar, Tag, Link2,
  Send, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

interface CampusSubmission {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  full_name: string;
  email: string;
  phone?: string;
  is_student?: boolean;
  institution?: string;
  student_id?: string;
  study_level?: string;
  connection_desc?: string;
  update_title?: string;
  update_category?: string;
  update_description?: string;
  update_date?: string;
  source_url?: string;
  admin_note?: string;
  submitted_at?: string;
  created_at: string;
  // legacy fields for generic submissions
  title?: string;
  organization?: string;
  description?: string;
  link?: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const statusIcons = {
  pending: <Clock className="w-3.5 h-3.5" />,
  approved: <CheckCircle className="w-3.5 h-3.5" />,
  rejected: <XCircle className="w-3.5 h-3.5" />,
};

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<CampusSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CampusSubmission | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      let q = insforge.database
        .from("submissions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      if (typeFilter !== "all") q = q.eq("type", typeFilter);
      if (search) q = q.or(`update_title.ilike.%${search}%,full_name.ilike.%${search}%,institution.ilike.%${search}%`);

      const { data, error } = await q;
      if (!error) setItems((data as any) ?? []);
    } catch {}
    setLoading(false);
  };

  const fetchCounts = async () => {
    const [p, a, r] = await Promise.all([
      insforge.database.from("submissions").select("id", { count: "exact" }).eq("status", "pending").limit(1),
      insforge.database.from("submissions").select("id", { count: "exact" }).eq("status", "approved").limit(1),
      insforge.database.from("submissions").select("id", { count: "exact" }).eq("status", "rejected").limit(1),
    ]);
    setCounts({ pending: p.count ?? 0, approved: a.count ?? 0, rejected: r.count ?? 0 });
  };

  useEffect(() => { fetchData(); }, [filter, typeFilter, search]);
  useEffect(() => { fetchCounts(); }, []);

  const handleApprove = async (item: CampusSubmission) => {
    setActionLoading(true);
    try {
      // Update submission status
      await insforge.database.from("submissions").update({ status: "approved" }).eq("id", item.id);

      // If it's a campus update submission, publish it directly to campus_updates table
      if (item.type === "campus_update" && item.update_title) {
        await insforge.database.from("campus_updates").insert({
          title: item.update_title,
          institution: item.institution || "Unknown Institution",
          category: item.update_category || "news",
          date: item.update_date || new Date().toISOString().split("T")[0],
          description: item.update_description || "",
          status: "active",
          created_at: new Date().toISOString(),
        });
        toast.success("Approved and published to Campus Updates!");
      } else {
        toast.success("Submission approved!");
      }

      setSelected(null);
      fetchData();
      fetchCounts();
    } catch {
      toast.error("Failed to approve.");
    }
    setActionLoading(false);
  };

  const handleReject = async (item: CampusSubmission) => {
    setActionLoading(true);
    try {
      await insforge.database
        .from("submissions")
        .update({ status: "rejected", admin_note: rejectNote || null })
        .eq("id", item.id);
      toast.success("Submission rejected.");
      setSelected(null);
      setRejectNote("");
      fetchData();
      fetchCounts();
    } catch {
      toast.error("Failed to reject.");
    }
    setActionLoading(false);
  };

  const displayTitle = (item: CampusSubmission) =>
    item.update_title || item.title || "(No title)";
  const displayInstitution = (item: CampusSubmission) =>
    item.institution || item.organization || "—";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">User Submissions</h1>
          <p className="text-gray-500 text-sm">Review, approve, or reject user-submitted campus updates and opportunity leads.</p>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {([
          { status: "pending", label: "Pending Review", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
          { status: "approved", label: "Approved", color: "bg-green-50 border-green-200 text-green-700" },
          { status: "rejected", label: "Rejected", color: "bg-red-50 border-red-200 text-red-700" },
        ] as const).map(s => (
          <button
            key={s.status}
            onClick={() => setFilter(s.status)}
            className={cn(
              "rounded-2xl p-4 border text-left transition-all",
              s.color,
              filter === s.status ? "ring-2 ring-offset-1 ring-current" : "hover:shadow-sm"
            )}
          >
            <p className="text-2xl font-extrabold">{counts[s.status]}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors",
                filter === s ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white"
        >
          <option value="all">All Types</option>
          <option value="campus_update">Campus Updates</option>
          <option value="job">Jobs</option>
          <option value="scholarship">Scholarships</option>
        </select>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, name, institution…"
            className="pl-8 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No {filter !== "all" ? filter : ""} submissions found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Update Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Submitted By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Institution</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1 max-w-xs">{displayTitle(item)}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-gray-700">{item.full_name || "—"}</p>
                    <p className="text-xs text-gray-400">{item.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell max-w-[180px] truncate">{displayInstitution(item)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                      {item.type?.replace("_", " ") || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", statusColors[item.status])}>
                      {statusIcons[item.status]} {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelected(item); setRejectNote(""); }}
                        className="p-1.5 text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(item)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelected(item); setRejectNote(""); }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Detail / Review Modal ─────────────────────────────────────────────── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setRejectNote(""); } }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] p-5 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base leading-tight line-clamp-1">{displayTitle(selected)}</h2>
                  <p className="text-blue-200 text-xs mt-0.5 capitalize">{selected.type?.replace("_", " ")} submission</p>
                </div>
              </div>
              <button onClick={() => { setSelected(null); setRejectNote(""); }} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold", statusColors[selected.status])}>
                  {statusIcons[selected.status]} {selected.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">Submitted {formatDate(selected.created_at)}</span>
              </div>

              {/* Submitter info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1a3c8f]" /> Submitted By
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500 text-xs">Name</span><p className="font-medium text-gray-900">{selected.full_name || "—"}</p></div>
                  <div><span className="text-gray-500 text-xs">Email</span><p className="font-medium text-gray-900">{selected.email}</p></div>
                  {selected.phone && <div><span className="text-gray-500 text-xs">Phone</span><p className="font-medium text-gray-900">{selected.phone}</p></div>}
                  {selected.is_student !== undefined && (
                    <div><span className="text-gray-500 text-xs">Role</span><p className="font-medium text-gray-900">{selected.is_student ? "Student" : "Staff / Other"}</p></div>
                  )}
                </div>
              </div>

              {/* Institution */}
              {(selected.institution || selected.student_id || selected.study_level) && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1a3c8f]" /> Institution Details
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {selected.institution && <div className="sm:col-span-2"><span className="text-gray-500 text-xs">Institution</span><p className="font-medium text-gray-900">{selected.institution}</p></div>}
                    {selected.student_id && <div><span className="text-gray-500 text-xs">Student ID</span><p className="font-medium text-gray-900 flex items-center gap-1"><IdCard className="w-3.5 h-3.5 text-gray-400" />{selected.student_id}</p></div>}
                    {selected.study_level && <div><span className="text-gray-500 text-xs">Level</span><p className="font-medium text-gray-900 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-gray-400" />{selected.study_level}</p></div>}
                    {selected.connection_desc && <div className="sm:col-span-2"><span className="text-gray-500 text-xs">Connection to Update</span><p className="text-gray-700 text-xs leading-relaxed mt-0.5">{selected.connection_desc}</p></div>}
                  </div>
                </div>
              )}

              {/* The Update */}
              <div className="border border-gray-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#1a3c8f]" /> Update Content
                </h3>
                <div className="space-y-3 text-sm">
                  {(selected.update_title || selected.title) && (
                    <div>
                      <span className="text-gray-500 text-xs">Title</span>
                      <p className="font-semibold text-gray-900">{selected.update_title || selected.title}</p>
                    </div>
                  )}
                  <div className="flex gap-6">
                    {selected.update_category && (
                      <div>
                        <span className="text-gray-500 text-xs flex items-center gap-1"><Tag className="w-3 h-3" />Category</span>
                        <p className="font-medium text-gray-900 capitalize">{selected.update_category}</p>
                      </div>
                    )}
                    {selected.update_date && (
                      <div>
                        <span className="text-gray-500 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />Date</span>
                        <p className="font-medium text-gray-900">{selected.update_date}</p>
                      </div>
                    )}
                  </div>
                  {(selected.update_description || selected.description) && (
                    <div>
                      <span className="text-gray-500 text-xs">Description</span>
                      <p className="text-gray-700 text-sm leading-relaxed mt-0.5 whitespace-pre-line">
                        {selected.update_description || selected.description}
                      </p>
                    </div>
                  )}
                  {(selected.source_url || selected.link) && (
                    <div>
                      <span className="text-gray-500 text-xs flex items-center gap-1"><Link2 className="w-3 h-3" />Source URL</span>
                      <a href={selected.source_url || selected.link} target="_blank" rel="noopener noreferrer" className="text-[#1a3c8f] text-xs hover:underline break-all">{selected.source_url || selected.link}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin note (if rejected) */}
              {selected.admin_note && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-600 mb-1">Admin Note</p>
                  <p className="text-sm text-red-800">{selected.admin_note}</p>
                </div>
              )}

              {/* Approve hint */}
              {selected.status === "pending" && selected.type === "campus_update" && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-800">
                    <strong>Approving</strong> this submission will automatically publish it to the <strong>Campus Updates</strong> page on the website.
                  </p>
                </div>
              )}

              {/* Actions */}
              {selected.status === "pending" && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Rejection Note <span className="text-gray-400 font-normal text-xs">(optional — shown to submitter)</span></label>
                    <textarea
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      rows={2}
                      placeholder="Reason for rejection…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-300 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selected)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => handleReject(selected)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
