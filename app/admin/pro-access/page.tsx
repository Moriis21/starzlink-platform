"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import {
  Crown,
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  History,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

interface ProGrant {
  id: string;
  plan_type: string;
  access_type: string;
  start_date: string;
  expiry_date: string | null;
  is_active: boolean;
  admin_note: string | null;
  granted_by_admin_id: string;
  created_at: string;
}

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string;
}

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  user_type: string;
  created_at: string;
  admin_pro_grants: ProGrant[] | ProGrant | null;
  subscriptions: Subscription[] | Subscription | null;
}

interface AuditLog {
  id: string;
  action: string;
  old_plan: string;
  new_plan: string;
  old_expiry_date: string | null;
  new_expiry_date: string | null;
  note: string | null;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();

function getActiveGrant(user: UserRow): ProGrant | null {
  const grants = user.admin_pro_grants;
  if (!grants) return null;
  const list = Array.isArray(grants) ? grants : [grants];
  return list.find((g) => g.is_active) ?? null;
}

function getSub(user: UserRow): Subscription | null {
  const subs = user.subscriptions;
  if (!subs) return null;
  return Array.isArray(subs) ? subs[0] ?? null : subs;
}

function isPaidPro(user: UserRow): boolean {
  const sub = getSub(user);
  return sub?.status === "active" && sub?.current_period_end > now();
}

function isManualPro(user: UserRow): boolean {
  const grant = getActiveGrant(user);
  return !!(grant?.is_active && (!grant?.expiry_date || grant?.expiry_date > now()));
}

function isLifetimePro(user: UserRow): boolean {
  const grant = getActiveGrant(user);
  return !!(grant?.plan_type === "pro_lifetime" && grant?.is_active);
}

function getPlanLabel(user: UserRow): string {
  if (isLifetimePro(user)) return "Pro Lifetime";
  if (isManualPro(user)) return "Pro (Admin Grant)";
  if (isPaidPro(user)) {
    const sub = getSub(user);
    return sub?.plan === "yearly" ? "Pro Yearly" : "Pro Monthly";
  }
  return "Free";
}

function getExpiryDate(user: UserRow): string | null {
  if (isLifetimePro(user)) return null;
  if (isManualPro(user)) return getActiveGrant(user)?.expiry_date ?? null;
  if (isPaidPro(user)) return getSub(user)?.current_period_end ?? null;
  return null;
}

function expiryColor(expiry: string | null): string {
  if (!expiry) return "text-purple-600";
  const diff = new Date(expiry).getTime() - Date.now();
  if (diff < 0) return "text-red-600";
  if (diff < 7 * 86400000) return "text-orange-500";
  return "text-green-600";
}

function PlanBadge({ label }: { label: string }) {
  const cls = label === "Free"
    ? "bg-gray-100 text-gray-500"
    : label.includes("Lifetime")
    ? "bg-purple-100 text-purple-700"
    : label.includes("Admin")
    ? "bg-blue-100 text-[#1a3c8f]"
    : "bg-green-100 text-green-700";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {label !== "Free" && <Crown className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${
        type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
      }`}
    >
      {type === "success" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
      {msg}
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
    </motion.div>
  );
}

// ── Grant Modal ───────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "1 Year", days: 365 },
  { label: "Lifetime", days: -1 },
  { label: "Custom Date", days: 0 },
];

function GrantModal({
  users,
  onClose,
  onSuccess,
  adminId,
}: {
  users: UserRow[];
  onClose: () => void;
  onSuccess: () => void;
  adminId: string;
}) {
  const [duration, setDuration] = useState<number>(30);
  const [customDate, setCustomDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedDuration = DURATION_OPTIONS.find((d) => d.days === duration);
  const isCustom = duration === 0;
  const isLifetime = duration === -1;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: any = {
        action: "grant",
        userIds: users.map((u) => u.id),
        adminId,
        planType: isLifetime ? "pro_lifetime" : "pro_manual",
        note: note || null,
      };
      if (isLifetime) {
        // no expiry
      } else if (isCustom) {
        payload.expiryDate = customDate;
      } else {
        payload.durationDays = duration;
      }

      const res = await fetch("/api/admin/pro-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-300" />
            <h2 className="font-bold text-lg">Grant Pro Access</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-[#1a3c8f] font-medium">
            Granting Pro to <span className="font-bold">{users.length} user{users.length !== 1 ? "s" : ""}</span>
            {users.length === 1 && (
              <span className="block text-xs text-gray-500 mt-0.5 font-normal">{users[0].email}</span>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setDuration(opt.days)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    duration === opt.days
                      ? "bg-[#1a3c8f] border-[#1a3c8f] text-white"
                      : "border-gray-200 text-gray-600 hover:border-[#1a3c8f]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isCustom && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Custom Expiry Date</label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]"
              />
            </div>
          )}

          {isLifetime && (
            <div className="bg-purple-50 rounded-xl px-4 py-3 text-sm text-purple-700 font-medium flex items-center gap-2">
              <Crown className="w-4 h-4" />
              This grants permanent, non-expiring Pro access.
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Admin Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for granting access..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (isCustom && !customDate)}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
            {loading ? "Granting..." : `Grant ${selectedDuration?.label ?? "Pro"}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── History Modal ─────────────────────────────────────────────────────────────

function HistoryModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insforge.database
      .from("pro_access_audit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setLogs((data as AuditLog[]) ?? []);
        setLoading(false);
      });
  }, [user.id]);

  const actionColor = (action: string) => {
    if (action === "grant") return "text-green-600 bg-green-50";
    if (action === "revoke") return "text-red-600 bg-red-50";
    if (action === "extend") return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Access History</h2>
            <p className="text-xs text-gray-500">{user.full_name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#1a3c8f] animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No history found for this user.</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="border border-gray-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span><span className="text-gray-400">From:</span> {log.old_plan || "free"}</span>
                    <span>→</span>
                    <span><span className="text-gray-400">To:</span> {log.new_plan || "free"}</span>
                  </div>
                  {log.new_expiry_date && (
                    <div className="text-xs text-gray-500">
                      Expiry: {new Date(log.new_expiry_date).toLocaleDateString()}
                    </div>
                  )}
                  {log.note && (
                    <div className="text-xs text-gray-500 italic">"{log.note}"</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProAccessPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [grantModal, setGrantModal] = useState<UserRow[] | null>(null);
  const [historyUser, setHistoryUser] = useState<UserRow | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<UserRow | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (q) params.set("search", q);
    try {
      const res = await fetch(`/api/admin/pro-access?${params}`);
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      showToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers("");
  }, [fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 400);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
  };

  const handleRevoke = async (targetUser: UserRow) => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/admin/pro-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revoke",
          userIds: [targetUser.id],
          adminId: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Pro access has been revoked successfully.", "success");
      fetchUsers(search);
    } catch (err: any) {
      showToast(err.message || "Failed to revoke.", "error");
    }
    setRevokeConfirm(null);
  };

  const selectedUsers = users.filter((u) => selected.has(u.id));

  return (
    <div className="space-y-6">
      {/* Modals */}
      <AnimatePresence>
        {toast && (
          <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      {grantModal && user?.id && (
        <GrantModal
          users={grantModal}
          adminId={user.id}
          onClose={() => setGrantModal(null)}
          onSuccess={() => {
            setGrantModal(null);
            setSelected(new Set());
            fetchUsers(search);
            showToast("Pro access has been granted successfully.", "success");
          }}
        />
      )}

      {historyUser && (
        <HistoryModal user={historyUser} onClose={() => setHistoryUser(null)} />
      )}

      {revokeConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Revoke Pro Access?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will remove Pro access for <strong>{revokeConfirm.full_name}</strong>. They will be downgraded to the Free plan immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRevokeConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevoke(revokeConfirm)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Revoke
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-extrabold text-gray-900">Pro Access Manager</h1>
          </div>
          <p className="text-sm text-gray-500">Grant, revoke, and manage Pro access for users.</p>
        </div>
        <button
          onClick={() => fetchUsers(search)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: users.length,
            icon: UserCheck,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Pro (Admin Grant)",
            value: users.filter(isManualPro).length,
            icon: Crown,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Pro Lifetime",
            value: users.filter(isLifetimePro).length,
            icon: ShieldCheck,
            color: "text-purple-600 bg-purple-50",
          },
          {
            label: "Paid Pro",
            value: users.filter(isPaidPro).length,
            icon: CheckCircle,
            color: "text-green-600 bg-green-50",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Bulk Actions */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]"
            />
          </div>

          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">{selected.size} selected</span>
              <button
                onClick={() => setGrantModal(selectedUsers)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                Grant Pro
              </button>
              <button
                onClick={async () => {
                  if (!user?.id) return;
                  if (!confirm(`Revoke Pro access for ${selected.size} users?`)) return;
                  try {
                    const res = await fetch("/api/admin/pro-access", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "revoke",
                        userIds: Array.from(selected),
                        adminId: user.id,
                      }),
                    });
                    if (!res.ok) throw new Error("Failed");
                    showToast("Pro access has been revoked successfully.", "success");
                    setSelected(new Set());
                    fetchUsers(search);
                  } catch {
                    showToast("Failed to revoke access.", "error");
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
              >
                <UserX className="w-3.5 h-3.5" />
                Revoke Pro
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left w-10">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-[#1a3c8f]">
                    {selected.size === users.length && users.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#1a3c8f]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Current Plan</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Access Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Expiry</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="w-6 h-6 text-[#1a3c8f] animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const plan = getPlanLabel(u);
                  const expiry = getExpiryDate(u);
                  const isChecked = selected.has(u.id);
                  const grant = getActiveGrant(u);

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-gray-50 transition-colors ${isChecked ? "bg-blue-50/50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(u.id)} className="text-gray-400 hover:text-[#1a3c8f]">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#1a3c8f]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{u.full_name || "—"}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <PlanBadge label={plan} />
                        {grant?.admin_note && (
                          <p className="text-xs text-gray-400 mt-1 italic truncate max-w-[160px]">{grant.admin_note}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 capitalize">
                        {grant?.access_type ?? (isPaidPro(u) ? "paid" : "—")}
                      </td>
                      <td className="px-4 py-3">
                        {expiry === null && plan.includes("Lifetime") ? (
                          <span className="text-purple-600 text-xs font-semibold">Never</span>
                        ) : expiry ? (
                          <span className={`text-xs font-semibold ${expiryColor(expiry)}`}>
                            {new Date(expiry).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setGrantModal([u])}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1a3c8f] transition-colors"
                            title={grant?.is_active ? "Extend Pro" : "Grant Pro"}
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                          {(isManualPro(u) || isLifetimePro(u)) && (
                            <button
                              onClick={() => setRevokeConfirm(u)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              title="Revoke Pro"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setHistoryUser(u)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                            title="View History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
