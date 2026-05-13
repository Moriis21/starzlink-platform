"use client";

import { useState, useEffect } from "react";
import { campaignsApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { Plus, Trash2, Send, Mail, Users, Eye, MousePointer, X } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "text-yellow-700 bg-yellow-50",
  scheduled: "text-blue-700 bg-blue-50",
  sent: "text-green-700 bg-green-50",
  failed: "text-red-700 bg-red-50",
};

const AUDIENCES = ["all", "students", "graduates", "professionals", "newsletter_only"];

interface Campaign {
  id: string;
  subject: string;
  preview_text: string;
  body: string;
  target_audience: string;
  status: string;
  sent_at: string | null;
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject: "", preview_text: "", body: "", target_audience: "all", status: "draft",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await campaignsApi.getAll({ page, limit: 15 });
    setCampaigns(res.data?.data ?? []);
    setTotal(res.data?.total ?? 0);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page]);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await campaignsApi.create(form);
    if (error) { toast.error("Failed to create campaign"); } else { toast.success("Campaign created!"); setShowModal(false); fetchData(); }
    setSaving(false);
  };

  const handleSend = async (id: string) => {
    if (!confirm("Send this campaign now? This cannot be undone.")) return;
    setSending(id);
    await campaignsApi.send(id);
    toast.success("Campaign sent!");
    fetchData();
    setSending(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    await campaignsApi.delete(id);
    toast.success("Deleted");
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-500 text-sm">Create and send email campaigns to your users.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-blue-900 transition-colors text-sm">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Campaigns", value: total, icon: Mail, color: "text-blue-600 bg-blue-50" },
          { label: "Sent", value: campaigns.filter(c => c.status === "sent").length, icon: Send, color: "text-green-600 bg-green-50" },
          { label: "Total Recipients", value: campaigns.reduce((s, c) => s + (c.recipient_count ?? 0), 0), icon: Users, color: "text-purple-600 bg-purple-50" },
          { label: "Total Opens", value: campaigns.reduce((s, c) => s + (c.open_count ?? 0), 0), icon: Eye, color: "text-orange-600 bg-orange-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-gray-900">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Subject</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Audience</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Stats</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : campaigns.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No campaigns yet. Create your first campaign!</td></tr>
            ) : campaigns.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900 line-clamp-1">{c.subject}</p>
                  {c.preview_text && <p className="text-xs text-gray-400 line-clamp-1">{c.preview_text}</p>}
                  <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="capitalize text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{c.target_audience?.replace("_", " ")}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                  {c.status === "sent" ? (
                    <div className="space-y-0.5">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.recipient_count} recipients</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {c.open_count} opens</span>
                      <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" /> {c.click_count} clicks</span>
                    </div>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_COLORS[c.status] ?? "")}>{c.status}</span>
                  {c.sent_at && <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.sent_at)}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {c.status === "draft" && (
                      <button onClick={() => handleSend(c.id)} disabled={sending === c.id} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Send Now">
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={Math.ceil(total / 15)} onPageChange={setPage} />

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">New Email Campaign</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Subject *</label>
                <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Email subject line" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Preview Text</label>
                <input value={form.preview_text} onChange={e => set("preview_text", e.target.value)} placeholder="Brief preview shown in email clients..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Target Audience</label>
                <select value={form.target_audience} onChange={e => set("target_audience", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  {AUDIENCES.map(a => <option key={a} value={a} className="capitalize">{a.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Body (HTML) *</label>
                <textarea value={form.body} onChange={e => set("body", e.target.value)} rows={8} placeholder="<p>Your email content here...</p>" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none font-mono" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
                <select value={form.status} onChange={e => set("status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  <option value="draft">Save as Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60">
                  {saving ? "Creating..." : "Create Campaign"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
