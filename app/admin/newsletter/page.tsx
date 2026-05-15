"use client";

import { useState, useEffect } from "react";
import { newsletterApi } from "@/lib/api";
import { insforge } from "@/lib/insforge";
import { NewsletterSubscriber } from "@/types";
import { formatDate } from "@/lib/utils";
import { Mail, Users, Send, Search, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [composing, setComposing] = useState(false);
  const [newsletter, setNewsletter] = useState({ subject: "", body: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subRes, campaignRes] = await Promise.all([
          newsletterApi.getSubscribers({ search }),
          insforge.database.from("email_campaigns").select("id", { count: "exact" }).eq("status", "sent").limit(1),
        ]);
        setSubscribers(subRes.data?.data || subRes.data || []);
        setTotal(subRes.data?.total || 0);
        setSentCount(campaignRes.count ?? 0);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [search]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletter.subject || !newsletter.body) { toast.error("Fill in all fields."); return; }
    setSending(true);
    try {
      await newsletterApi.sendNewsletter(newsletter);
      toast.success(`Newsletter sent to ${total} subscribers!`);
      setNewsletter({ subject: "", body: "" });
      setComposing(false);
    } catch { toast.error("Failed to send."); }
    setSending(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-extrabold text-gray-900">Newsletter</h1><p className="text-gray-500 text-sm">Manage subscribers and send newsletters.</p></div>
        <button onClick={() => setComposing(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a3c8f] text-white rounded-xl text-sm font-medium hover:bg-blue-900">
          <Send className="w-4 h-4" /> Compose Newsletter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
          <Users className="w-8 h-8 text-[#1a3c8f] mx-auto mb-2" />
          <p className="text-3xl font-extrabold text-gray-900">{total || subscribers.length}</p>
          <p className="text-sm text-gray-500">Total Subscribers</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
          <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-3xl font-extrabold text-gray-900">{sentCount}</p>
          <p className="text-sm text-gray-500">Newsletters Sent</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
          <Send className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-3xl font-extrabold text-gray-900">{sentCount > 0 ? sentCount : "—"}</p>
          <p className="text-sm text-gray-500">Campaigns Delivered</p>
        </div>
      </div>

      {/* Compose Modal */}
      {composing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Compose Newsletter</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Subject *</label>
                <input value={newsletter.subject} onChange={e => setNewsletter(n => ({ ...n, subject: e.target.value }))} placeholder="Newsletter subject" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Content *</label>
                <textarea value={newsletter.body} onChange={e => setNewsletter(n => ({ ...n, body: e.target.value }))} rows={10} placeholder="Write your newsletter content here..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" required />
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
                This newsletter will be sent to <strong>{total || subscribers.length} subscribers</strong>.
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={sending} className="flex-1 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60">
                  {sending ? "Sending..." : `Send to ${total || subscribers.length} Subscribers`}
                </button>
                <button type="button" onClick={() => setComposing(false)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Subscribers</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subscribers..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none w-52" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:border-[#1a3c8f]">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subscribed On</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
            ) : subscribers.length > 0 ? (
              subscribers.map((sub, i) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sub.created_at)}</td>
                  <td className="px-4 py-3">
                    <button onClick={async () => { try { await newsletterApi.unsubscribe(sub.email); toast.success("Unsubscribed."); setSubscribers(s => s.filter(x => x.id !== sub.id)); } catch {} }} className="text-xs text-red-500 hover:underline">Remove</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-4 py-16 text-center text-gray-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-20" /><p className="text-sm">No subscribers yet</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
