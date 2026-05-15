"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function FloatingDashboardButton() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Hide on admin pages, auth pages, dashboard itself, and viewer
  if (!user) return null;
  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/complete-profile")) return null;
  if (pathname.startsWith("/dashboard")) return null;
  if (pathname.startsWith("/viewer")) return null;

  return (
    <Link
      href="/dashboard"
      className="fixed bottom-20 right-4 z-40 lg:hidden w-12 h-12 bg-[#1a3c8f] text-white rounded-full shadow-lg shadow-[#1a3c8f]/40 flex items-center justify-center hover:bg-blue-900 transition-all active:scale-95"
      title="Go to Dashboard"
    >
      <LayoutDashboard className="w-5 h-5" />
    </Link>
  );
}
