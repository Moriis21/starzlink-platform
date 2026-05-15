"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/context/AuthContext";
import { formatDate, cn } from "@/lib/utils";
import { CreditCard, Wallet, Clock, CheckCircle2, XCircle, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Payment {
  id: string;
  payment_type: string;
  item_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_reference?: string;
  payment_status: string;
  admin_approval_status: string;
  rejection_reason?: string;
  created_at: string;
}

const METHOD_LABELS: Record<string, string> = {
  orange_money: "Orange Money", mobile_money: "Mobile Money",
  credit_card: "Credit Card", paypal: "PayPal", bank_transfer: "Bank Transfer",
};
const METHOD_COLORS: Record<string, string> = {
  orange_money: "bg-orange-100 text-orange-700", mobile_money: "bg-blue-100 text-blue-700",
  credit_card: "bg-gray-100 text-gray-700", paypal: "bg-yellow-100 text-yellow-700",
  bank_transfer: "bg-purple-100 text-purple-700",
};
const ITEM_LABELS: Record<string, string> = {
  pro_monthly: "Pro Monthly Plan", pro_yearly: "Pro Yearly Plan",
  template: "CV Template", ebook: "E-Book", digital_resource: "Digital Resource",
  course: "Online Course", other: "Other",
};

function StatusBadge({ payment }: { payment: Payment }) {
  const cfg = (() => {
    if (payment.admin_approval_status === "approved" || payment.payment_status === "verified")
      return { label: "Approved", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
    if (payment.admin_approval_status === "rejected" || payment.payment_status === "rejected")
      return { label: "Rejected", color: "bg-red-100 text-red-700", icon: <XCircle className="w-3.5 h-3.5" /> };
    if (payment.payment_status === "pending_admin_approval")
      return { label: "Pending Approval", color: "bg-blue-100 text-blue-700", icon: <Clock className="w-3.5 h-3.5" /> };
    return { label: "Pending Verification", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3.5 h-3.5" /> };
  })();
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "subscription" | "resource">("all");

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      let q = insforge.database.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (filter === "subscription") q = q.eq("payment_type", "subscription");
      if (filter === "resource") q = q.eq("payment_type", "resource_purchase");
      const { data } = await q;
      setPayments((data as any) ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id, filter]);

  const totalSpent = payments.filter(p => p.admin_approval_status === "approved").reduce((s, p) => s + Number(p.amount), 0);
  const pending = payments.filter(p => p.admin_approval_status === "pending").length;
  const approved = payments.filter(p => p.admin_approval_status === "approved").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#1a3c8f]" /> Payment History
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Your payment and purchase records</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3c8f] border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Paid", value: `$${totalSpent.toFixed(2)}`, color: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Pending", value: pending, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
          { label: "Approved", value: approved, color: "bg-green-50 text-green-700 border-green-200" },
        ].map(c => (
          <div key={c.label} className={`${c.color} border rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-extrabold">{c.value}</p>
            <p className="text-xs font-medium opacity-75 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {(["all", "subscription", "resource"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors",
              filter === f ? "bg-white text-[#1a3c8f] shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            {f === "all" ? "All" : f === "subscription" ? "Subscriptions" : "Resources"}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-bold text-gray-600 mb-2">No payment records yet</h3>
          <p className="text-sm text-gray-400 mb-6">Upgrade to Pro or purchase a resource to see your history here.</p>
          <Link href="/dashboard/career/upgrade"
            className="inline-flex items-center gap-1.5 bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors text-sm">
            Upgrade to Pro <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Left */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#1a3c8f]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-[#1a3c8f]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{ITEM_LABELS[p.item_type] || p.item_type}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${METHOD_COLORS[p.payment_method] || "bg-gray-100 text-gray-600"}`}>
                        {METHOD_LABELS[p.payment_method] || p.payment_method}
                      </span>
                      {p.transaction_reference && (
                        <span className="text-xs text-gray-400 font-mono">Ref: {p.transaction_reference}</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Right */}
                <div className="text-right space-y-1.5 flex-shrink-0">
                  <p className="font-extrabold text-gray-900">${Number(p.amount).toFixed(2)} <span className="text-xs text-gray-400 font-normal">{p.currency}</span></p>
                  <StatusBadge payment={p} />
                  <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                </div>
              </div>
              {/* Rejection reason */}
              {p.admin_approval_status === "rejected" && p.rejection_reason && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-700">
                  <strong>Rejection reason:</strong> {p.rejection_reason}
                </div>
              )}
              {/* Pending info */}
              {p.admin_approval_status === "pending" && (
                <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2 text-xs text-yellow-700 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  Payment is pending admin verification. This usually takes 2–3 minutes.
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
