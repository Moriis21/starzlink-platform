"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Loader2, RefreshCw, Bot, User } from "lucide-react";
import { insforge } from "@/lib/insforge";

export default function WhatsAppLogsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, intents: {} as Record<string, number> });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await insforge.database.from("whatsapp_bot_messages").select("*").order("created_at", { ascending: false }).limit(100);
      const msgs = (data || []) as any[];
      setMessages(msgs);
      const intents: Record<string, number> = {};
      msgs.forEach(m => { intents[m.intent || "unknown"] = (intents[m.intent || "unknown"] || 0) + 1; });
      setStats({ total: msgs.length, intents });
    } catch { setMessages([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const topIntents = Object.entries(stats.intents).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">WhatsApp Bot Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{stats.total} messages processed</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Intent stats */}
      {topIntents.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-bold text-gray-700 mb-4 text-sm">Top User Intents</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {topIntents.map(([intent, count]) => (
              <div key={intent} className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-extrabold text-[#1a3c8f]">{count}</div>
                <div className="text-xs text-gray-500 capitalize mt-0.5">{intent}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#1a3c8f]" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-4 text-xs text-gray-500 font-medium">
              <span>From</span><span>Message</span><span>Intent</span><span>Time</span>
            </div>
          </div>
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No messages yet. Configure WhatsApp Business API to start receiving messages.</p>
            </div>
          ) : messages.map(m => (
            <div key={m.id} className="border-b border-gray-50 last:border-0 px-5 py-3 hover:bg-gray-50/50">
              <div className="grid grid-cols-4 gap-2 text-sm items-start">
                <div className="flex items-center gap-2 text-gray-600 font-mono text-xs truncate"><User className="w-3.5 h-3.5 flex-shrink-0" />{m.from_number}</div>
                <div className="truncate">
                  <p className="text-gray-800 text-xs truncate">{m.message_in}</p>
                  {m.message_out && <p className="text-gray-400 text-xs truncate mt-0.5">↳ {m.message_out.slice(0, 80)}...</p>}
                </div>
                <div><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">{m.intent || "unknown"}</span></div>
                <div className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Setup instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
        <h3 className="font-bold text-yellow-800 mb-2">⚙️ WhatsApp Setup</h3>
        <p className="text-sm text-yellow-700 mb-2">To activate the WhatsApp bot, add these to your Vercel environment variables:</p>
        <div className="space-y-1 font-mono text-xs bg-white rounded-xl p-3 border border-yellow-100">
          <div><span className="text-gray-500">WHATSAPP_ACCESS_TOKEN</span>=your_token</div>
          <div><span className="text-gray-500">WHATSAPP_PHONE_ID</span>=your_phone_number_id</div>
          <div><span className="text-gray-500">WHATSAPP_VERIFY_TOKEN</span>=starzlink_wa_2026</div>
        </div>
        <p className="text-xs text-yellow-600 mt-2">Webhook URL: <code className="bg-white px-1 rounded">https://starzlink.vercel.app/api/whatsapp/webhook</code></p>
      </div>
    </div>
  );
}
