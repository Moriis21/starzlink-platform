"use client";

import { useState, useEffect } from "react";
import { messagesApi } from "@/lib/api";
import { Message } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { Mail, MailOpen, Trash2, Reply, Search } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/components/ui/Pagination";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await messagesApi.getAll({ page: String(page), limit: "20", search });
      setMessages(res.data?.data || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await messagesApi.delete(id);
      toast.success("Message deleted.");
      setSelected(null);
      fetchData();
    } catch { toast.error("Failed."); }
  };

  const handleRead = async (msg: Message) => {
    setSelected(msg);
    if (msg.status === "unread") {
      try {
        await messagesApi.updateStatus(msg.id, "read");
        fetchData();
      } catch {}
    }
  };

  const statusColors: Record<string, string> = {
    unread: "bg-blue-100 text-blue-700", read: "bg-gray-100 text-gray-500", replied: "bg-green-100 text-green-700",
  };

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-extrabold text-gray-900">Messages</h1><p className="text-gray-500 text-sm">View and manage contact messages from users.</p></div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex overflow-hidden" style={{ minHeight: "600px" }}>
        {/* Messages List */}
        <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              Array(5).fill(0).map((_, i) => <div key={i} className="p-4 border-b border-gray-50 animate-pulse"><div className="h-4 bg-gray-100 rounded mb-2 w-3/4" /><div className="h-3 bg-gray-50 rounded w-full" /></div>)
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-gray-400"><Mail className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No messages yet</p></div>
            ) : messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => handleRead(msg)}
                className={cn("w-full text-left p-4 border-b border-gray-50 hover:bg-blue-50 transition-colors", selected?.id === msg.id ? "bg-blue-50" : "", msg.status === "unread" ? "bg-blue-50/50" : "")}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("font-semibold text-gray-900 text-sm", msg.status === "unread" ? "font-bold" : "")}>{msg.full_name}</span>
                  <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
                </div>
                <p className="text-xs text-gray-600 truncate">{msg.subject}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{msg.message}</p>
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1 inline-block", statusColors[msg.status])}>{msg.status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Detail */}
        <div className="flex-1 p-6">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selected.subject}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span>From: <strong className="text-gray-900">{selected.full_name}</strong></span>
                    <span>{selected.email}</span>
                    {selected.phone && <span>{selected.phone}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(selected.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="flex items-center gap-1.5 px-3 py-2 bg-[#1a3c8f] text-white rounded-xl text-sm font-medium hover:bg-blue-900">
                    <Reply className="w-4 h-4" /> Reply
                  </a>
                  <button onClick={() => handleDelete(selected.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selected.message}</div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MailOpen className="w-14 h-14 mx-auto mb-3 opacity-20" />
                <p>Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
    </div>
  );
}
