"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, MessageSquare, Briefcase, GraduationCap, BookOpen, Megaphone, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge";
import { formatDate, cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface NotifItem {
  id: string;
  type: "job" | "scholarship" | "training" | "campus" | "message" | "system";
  title: string;
  body: string;
  href: string;
  read: boolean;
  created_at: string;
}

const typeIcon: Record<string, React.ElementType> = {
  job: Briefcase,
  scholarship: GraduationCap,
  training: BookOpen,
  campus: Megaphone,
  message: MessageSquare,
  system: Bell,
};

const typeColor: Record<string, string> = {
  job: "bg-blue-100 text-blue-600",
  scholarship: "bg-purple-100 text-purple-600",
  training: "bg-orange-100 text-orange-600",
  campus: "bg-green-100 text-green-600",
  message: "bg-pink-100 text-pink-600",
  system: "bg-gray-100 text-gray-600",
};

export default function NotificationBell({ isAdmin = false }: { isAdmin?: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch notifications — newest 3 jobs + 3 scholarships + 2 campus updates
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const [jobs, scholars, campus] = await Promise.all([
          insforge.database.from("jobs").select("id,title,company,created_at").eq("status","active").order("created_at",{ascending:false}).limit(3),
          insforge.database.from("scholarships").select("id,title,provider,created_at").eq("status","active").order("created_at",{ascending:false}).limit(3),
          insforge.database.from("campus_updates").select("id,title,institution,created_at").order("created_at",{ascending:false}).limit(2),
        ]);

        const items: NotifItem[] = [
          ...(jobs.data || []).map((j: any) => ({
            id: `job-${j.id}`, type: "job" as const,
            title: "New Job Opportunity",
            body: `${j.title} at ${j.company}`,
            href: `/opportunities/jobs/${j.id}`,
            read: false,
            created_at: j.created_at,
          })),
          ...(scholars.data || []).map((s: any) => ({
            id: `sch-${s.id}`, type: "scholarship" as const,
            title: "New Scholarship",
            body: `${s.title} by ${s.provider}`,
            href: `/opportunities/scholarships/${s.id}`,
            read: false,
            created_at: s.created_at,
          })),
          ...(campus.data || []).map((c: any) => ({
            id: `campus-${c.id}`, type: "campus" as const,
            title: "Campus Update",
            body: c.title,
            href: `/campus-updates/${c.id}`,
            read: false,
            created_at: c.created_at,
          })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Restore read state from localStorage
        const readIds: string[] = JSON.parse(localStorage.getItem("starzlink_read_notifs") || "[]");
        setNotifications(items.map(n => ({ ...n, read: readIds.includes(n.id) })));
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [user]);

  const markAllRead = () => {
    const ids = notifications.map(n => n.id);
    localStorage.setItem("starzlink_read_notifs", JSON.stringify(ids));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    const existing: string[] = JSON.parse(localStorage.getItem("starzlink_read_notifs") || "[]");
    if (!existing.includes(id)) {
      localStorage.setItem("starzlink_read_notifs", JSON.stringify([...existing, id]));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-xl transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
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
                <Bell className="w-4 h-4 text-[#1a3c8f]" />
                <span className="font-bold text-gray-900 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-[#1a3c8f] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#1a3c8f] font-medium hover:underline">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3 p-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1"><div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5" /><div className="h-3 bg-gray-50 rounded w-full" /></div>
                  </div>
                ))
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = typeIcon[n.type] || Bell;
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => { markRead(n.id); setOpen(false); }}
                      className={cn(
                        "flex gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors group",
                        !n.read && "bg-blue-50/30"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", typeColor[n.type])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-semibold text-gray-900 leading-tight", !n.read && "text-[#1a3c8f]")}>{n.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.body}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 bg-[#1a3c8f] rounded-full flex-shrink-0 mt-1.5" />}
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-50 px-4 py-2.5 bg-gray-50/50">
              <Link href="/opportunities" onClick={() => setOpen(false)} className="text-xs text-[#1a3c8f] font-semibold hover:underline flex items-center justify-center gap-1">
                View All Opportunities →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
