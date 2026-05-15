"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, GraduationCap, BookOpen, Bookmark,
  Star, Users, Bell, User, LogOut, Sparkles, ChevronRight,
  FileText, Mic, Mail, Link2, Grid3x3
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Career Tools", href: "/dashboard/tools", icon: Grid3x3 },
  { label: "AI Career Assistant", href: "/dashboard/career", icon: Sparkles },
  { label: "CV Builder", href: "/dashboard/career/upload", icon: FileText },
  { label: "Interview Prep", href: "/dashboard/career/interview", icon: Mic },
  { label: "Cover Letter", href: "/dashboard/career/letter", icon: Mail },
  { label: "LinkedIn Optimizer", href: "/dashboard/career/linkedin", icon: Link2 },
  { label: "Saved Items", href: "/dashboard/saved", icon: Bookmark },
  { label: "Opportunities", href: "/opportunities", icon: Briefcase },
  { label: "Scholarships", href: "/opportunities/scholarships", icon: GraduationCap },
  { label: "Trainings", href: "/trainings", icon: BookOpen },
  { label: "Referrals", href: "/referrals", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: User },
];

interface Props {
  className?: string;
}

export default function DashboardSidebar({ className }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <aside className={cn(
      "hidden lg:flex flex-col bg-white border-r border-gray-100 w-56 flex-shrink-0 sticky top-0 h-screen overflow-y-auto",
      className
    )}>
      {/* User info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#1a3c8f] to-blue-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || "User"}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors group",
                active
                  ? "bg-[#1a3c8f] text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#1a3c8f]"
              )}
            >
              <item.icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-white" : "text-gray-400 group-hover:text-[#1a3c8f]")} />
              <span className="truncate">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => { try { logout(); } catch {} }}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
