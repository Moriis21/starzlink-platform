"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Search, LogOut } from "lucide-react";
import NotificationBell from "@/components/ui/NotificationBell";
import MessageBadge from "@/components/ui/MessageBadge";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "super_admin"))) {
      router.replace("/login");
    }
  }, [user, loading]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a3c8f] mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading admin panel…</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Top Bar ── */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <div className="relative w-64 xl:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search anything…"
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Live notification bell */}
            <NotificationBell isAdmin />
            {/* Live message badge */}
            <MessageBadge />

            <div className="w-px h-6 bg-gray-100 mx-1" />

            {/* Admin avatar + info */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-[#1a3c8f] to-blue-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-sm">
                {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.full_name}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${user?.role === "super_admin" ? "bg-purple-500" : "bg-blue-500"}`} />
                    {user?.role?.replace("_", " ")}
                  </span>
                </p>
              </div>
              <button
                onClick={() => { logout(); router.replace("/login"); }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ── Page content with subtle fade-in ── */}
        <motion.main
          key={typeof window !== "undefined" ? window.location.pathname : "admin"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
