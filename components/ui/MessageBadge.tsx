"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Mail, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { messagesApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
}

export default function MessageBadge() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = messages.filter(m => m.status === "unread").length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await messagesApi.getAll({ limit: "8" });
        setMessages(res.data?.data || []);
      } catch {}
      setLoading(false);
    };
    fetch();
    // Re-check every 60s
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-xl transition-colors"
        aria-label="Messages"
      >
        <MessageSquare className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center badge-pulse"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1a3c8f]" />
                <span className="font-bold text-gray-900 text-sm">Messages</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
                )}
              </div>
              <Link href="/admin/messages" onClick={() => setOpen(false)} className="text-xs text-[#1a3c8f] font-medium hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View all
              </Link>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0" />
                    <div className="flex-1"><div className="h-3 bg-gray-100 rounded w-1/2 mb-1.5" /><div className="h-3 bg-gray-50 rounded w-full" /></div>
                  </div>
                ))
              ) : messages.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <Link
                    key={msg.id}
                    href="/admin/messages"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors",
                      msg.status === "unread" && "bg-blue-50/30"
                    )}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#1a3c8f] to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {msg.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-xs font-semibold text-gray-900", msg.status === "unread" && "text-[#1a3c8f]")}>
                          {msg.full_name}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{formatDate(msg.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium truncate">{msg.subject}</p>
                      <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                    </div>
                    {msg.status === "unread" && <div className="w-2 h-2 bg-[#1a3c8f] rounded-full flex-shrink-0 mt-2" />}
                  </Link>
                ))
              )}
            </div>

            <div className="border-t border-gray-50 px-4 py-2.5 bg-gray-50/50">
              <Link href="/admin/messages" onClick={() => setOpen(false)} className="text-xs text-[#1a3c8f] font-semibold hover:underline flex items-center justify-center gap-1">
                Open Messages Inbox →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
