"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/context/AuthContext";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  CreditCard, CheckCircle, XCircle, Eye, Search, Loader2,
  Smartphone, Building2, RefreshCw, X, ExternalLink, Clock,
  DollarSign, TrendingUp, ShieldCheck, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Payment {
  id: string;
  user_id: string;
  payment_type: string;
  item_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_reference?: string;
  proof_file_url?: string;
  payment_status: string;
  admin_approval_status: string;
  rejection_reason?: string;
  user_note?: string;
  created_at: string;
  profiles?: { full_name: string; email: string; phone?: string; avatar_url?: string };
}

const METHOD_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  orange_money:  { label: "Orange Money",  color: "text-orange-700", bg: "bg-orange-100" },
  mobile_money:  { label: "Mobile Money",  color: "text-blue-700",   bg: "bg-blue-100"   },
  credit_card:   { label: "Credit Card",   color: "text-gray-700",   bg: "bg-gray-100"   },
  paypal:        { label: "PayPal",        color: "text-yellow-700", bg: "bg-yellow-100" },
  bank_transfer: { label: "Bank Transfer", color: "text-purple-700", bg: "bg-purple-100" },
};

const ITEM_LABELS: Record<string, string> = {
  pro_monthly: "Pro Monthly ($5/mo)",
  pro_yearly:  "Pro Yearly ($50/yr)",
  template:    "CV Template",
  ebook:       "E-Book",
  digital_resource: "Digital Resource",
  course: "Course",
  other: "Other",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:               { label: "Pending",           color: "text-yellow-700", bg: "bg-yellow-100" },
  pending_verification:  { label: "Pending Verify",    color: "text-orange-700", bg: "bg-orange-100" },
  pending_admin_approval:{ label: "Pending Approval",  color: "text-blue-700",   bg: "bg-blue-100"   },
  approved:              { label: "Approved",           color: "text-green-700",  bg: "bg-green-100"  },
  rejected:              { label: "Rejected",           color: "text-red-700",    bg: "bg-red-100"    },
  verified:              { label: "Verified",           color: "text-green-700",  bg: "bg-green-100"  },
};

export default function PaymentManagerPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approvedToday: 0, totalRevenue: 0, rejected: 0 });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: tab, limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/payments?${params}`);
      const data = await res.json();
      setPayments(data.payments ?? []);
      setTotal(data.total ?? 0);
    } catch { toast.error("Failed to load payments"); }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const [pendingRes, approvedRes, allRes] = await Promise.all([
        insforge.database.from("payments").select("id", { count: "exact" }).eq("admin_approval_status", "pending").limit(1),
        insforge.database.from("payments").select("id", { count: "exact" }).eq("admin_approval_status", "approved").gte("approved_at", new Date(Date.now() - 86400000).toISOString()).limit(1),
        insforge.database.from("payments").select("amount,admin_approval_status"),
      ]);
      const allPayments = (allRes.data ?? []) as any[];
      const revenue = allPayments.filter((p: any) => p.admin_approval_status === "approved").reduce((s: number, p: any) => s + Number(p.amount), 0);
      const rejected = allPayments.filter((p: any) => p.admin_approval_status === "rejected").length;
      setStats({ pending: pendingRes.count ?? 0, approvedToday: approvedRes.count ?? 0, totalRevenue: revenue, rejected });
    } catch {}
  };

  useEffect(() => { fetchPayments(); }, [tab, search]);
  useEffect(() => { fetchStats(); }, []);

  const handleApprove = async (payment: Payment) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", paymentId: payment.id, adminId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Payment approved! Pro access granted.");
      setSelected(null);
      fetchPayments();
      fetchStats();
    } catch (err: any) { toast.error(err.message || "Approval failed"); }
    setActionLoading(false);
  };

  const handleReject = async (payment: Payment) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", paymentId: payment.id, adminId: user?.id, rejectionReason: rejectNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Payment rejected.");
      setSelected(null);
      setShowRejectModal(false);
      setRejectNote("");
      fetchPayments();
      fetchStats();
    } catch (err: any) { toast.error(err.message || "Rejection failed"); }
    setActionLoading(false);
  };

  const statusOf = (p: Payment) => STATUS_CONFIG[p.admin_approval_status] ?? STATUS_CONFIG.pending;
  const methodOf = (m: string) => METHOD_LABELS[m] ?? { label: m, color: "text-gray-600", bg: "bg-gray-100" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#1a3c8f]" /> Payment Verification Manager
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Review, verify, and approve user payment requests</p>
        </div>
        <button onClick={() => { fetchPayments(); fetchStats(); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3c8f] border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Review", value: stats.pending, icon: Clock, color: "bg-yellow-50 text-yellow-700", border: "border-yellow-200" },
          { label: "Approved Today", value: stats.approvedToday, icon: CheckCircle, color: "bg-green-50 text-green-700", border: "border-green-200" },
          { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-blue-50 text-blue-700", border: "border-blue-200" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "bg-red-50 text-red-700", border: "border-red-200" },
        ].map(s => (
          <div key={s.label} className={`${s.color} ${s.border} border rounded-2xl p-4`}>
            <s.icon className="w-5 h-5 mb-2 opacity-70" />
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-medium opacity-75 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-100">
          {(["pending", "approved", "rejected", "all"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-5 py-3.5 text-sm font-semibold capitalize transition-colors",
                tab === t ? "text-[#1a3c8f] border-b-2 border-[#1a3c8f] bg-blue-50/50" : "text-gray-500 hover:bg-gray-50")}>
              {t === "all" ? "All Payments" : t === "pending" ? `Pending (${stats.pending})` : t === "approved" ? "Approved" : "Rejected"}
            </button>
          ))}
          <div className="relative ml-auto p-2 pr-4">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user..."
              className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] w-52" />
          </div>
        </div>

        {/* Desktop table */}
        {loading ? (
          <div className="p-8 space-y-3">
            {Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No {tab !== "all" ? tab : ""} payments found</p>
          </div>
        ) : (
          <>
            {/* Table — desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["User", "Method", "Amount", "Item", "Status", "Date", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map(p => {
                    const m = methodOf(p.payment_method);
                    const s = statusOf(p);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 text-sm">{(p.profiles as any)?.full_name || "Unknown User"}</p>
                          <p className="text-xs text-gray-400">{(p.profiles as any)?.email || `ID: ${(p.user_id||"").slice(0,12)}…`}</p>
                          {(p.profiles as any)?.phone && <p className="text-xs text-gray-400">{(p.profiles as any).phone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.color} ${m.bg}`}>{m.label}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">${Number(p.amount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{ITEM_LABELS[p.item_type] || p.item_type}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color} ${s.bg}`}>{s.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(p.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelected(p)} className="p-1.5 text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-lg" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                            {p.admin_approval_status === "pending" && (
                              <>
                                <button onClick={() => handleApprove(p)} disabled={actionLoading}
                                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setSelected(p); setShowRejectModal(true); }}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Reject">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards — mobile */}
            <div className="md:hidden divide-y divide-gray-100">
              {payments.map(p => {
                const m = methodOf(p.payment_method);
                const s = statusOf(p);
                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{(p.profiles as any)?.full_name || "Unknown"}</p>
                        <p className="text-xs text-gray-400">{(p.profiles as any)?.email}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${s.color} ${s.bg}`}>{s.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.color} ${m.bg}`}>{m.label}</span>
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">${Number(p.amount).toFixed(2)}</span>
                      <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">{ITEM_LABELS[p.item_type] || p.item_type}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-[#1a3c8f] hover:text-[#1a3c8f]">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      {p.admin_approval_status === "pending" && (
                        <>
                          <button onClick={() => handleApprove(p)} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 border border-green-200 rounded-xl text-xs font-semibold text-green-700 hover:bg-green-100">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => { setSelected(p); setShowRejectModal(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-100">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && !showRejectModal && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <motion.div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] px-5 py-4 text-white flex items-center justify-between">
                <h2 className="font-extrabold">Payment Details</h2>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-4">
                {/* User info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">User</p>
                  <p className="font-bold text-gray-900">{(selected.profiles as any)?.full_name || "Unknown User"}</p>
                  <p className="text-sm text-gray-500">{(selected.profiles as any)?.email || "—"}</p>
                  {(selected.profiles as any)?.phone && (
                    <p className="text-sm text-gray-500 mt-0.5">📞 {(selected.profiles as any).phone}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">ID: {selected.user_id?.slice(0, 16)}…</p>
                </div>
                {/* Payment info */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Amount", value: `$${Number(selected.amount).toFixed(2)} ${selected.currency}` },
                    { label: "Method", value: methodOf(selected.payment_method).label },
                    { label: "Item", value: ITEM_LABELS[selected.item_type] || selected.item_type },
                    { label: "Status", value: statusOf(selected).label },
                    { label: "Date", value: formatDate(selected.created_at) },
                    { label: "Transaction Ref", value: selected.transaction_reference || "N/A" },
                  ].map(row => (
                    <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                      <p className="text-sm font-semibold text-gray-900 break-all">{row.value}</p>
                    </div>
                  ))}
                </div>
                {/* Proof of payment */}
                {selected.proof_file_url && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Proof of Payment</p>
                    <a href={selected.proof_file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#1a3c8f] hover:underline bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <ExternalLink className="w-4 h-4" /> View Payment Proof
                    </a>
                  </div>
                )}
                {selected.user_note && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                    <p className="text-xs text-yellow-700 font-semibold mb-1">User Note</p>
                    <p className="text-sm text-yellow-800">{selected.user_note}</p>
                  </div>
                )}
                {selected.rejection_reason && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs text-red-600 font-semibold mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{selected.rejection_reason}</p>
                  </div>
                )}
                {/* Actions */}
                {selected.admin_approval_status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleApprove(selected)} disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve & Activate
                    </button>
                    <button onClick={() => setShowRejectModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject modal */}
      <AnimatePresence>
        {showRejectModal && selected && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="font-extrabold text-gray-900">Reject Payment</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection (shown to the user):</p>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3}
                placeholder="e.g. Transaction reference not found, amount mismatch..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleReject(selected)} disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 disabled:opacity-60">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
