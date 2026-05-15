"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, GraduationCap, Bookmark,
  Users, Bell, User, LogOut, Sparkles, ChevronRight,
  Settings, Trophy, Globe, Cpu
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string;
}

const NAV_GROUPS: { heading?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: "Dashboard Home", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "AI Tools",       href: "/dashboard/ai-tools", icon: Cpu },
    ],
  },
  {
    heading: "Opportunities",
    items: [
      { label: "Browse Opportunities", href: "/opportunities", icon: Briefcase },
      { label: "Scholarships",         href: "/opportunities/scholarships", icon: GraduationCap },
      { label: "Saved Items",          href: "/dashboard/saved", icon: Bookmark },
      { label: "Recommendations",      href: "/recommendations", icon: Sparkles },
    ],
  },
  {
    heading: "My Profile",
    items: [
      { label: "Portfolio",        href: "/tools/portfolio-builder", icon: Globe },
      { label: "Skills & Badges",  href: "/tools/skills-assessment", icon: Trophy },
      { label: "Referrals",        href: "/referrals", icon: Users },
      { label: "Notifications",    href: "/notifications", icon: Bell },
    ],
  },
  {
    heading: "Settings",
    items: [
      { label: "Profile Settings", href: "/dashboard/settings/profile", icon: User },
      { label: "Account Settings", href: "/dashboard/settings/account", icon: Settings },
    ],
  },
];

interface Props {
  className?: string;
}

export default function DashboardSidebar({ className }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  // Special: AI Tools is active for all /dashboard/ai-tools/* AND /dashboard/career/* AND /tools/*
  const isAIToolsActive = (item: NavItem) => {
    if (item.href !== "/dashboard/ai-tools") return isActive(item);
    return (
      pathname === "/dashboard/ai-tools" ||
      pathname.startsWith("/dashboard/ai-tools/") ||
      pathname.startsWith("/dashboard/career") ||
      (pathname.startsWith("/tools/") && !pathname.startsWith("/tools/cv-builder") && !pathname.startsWith("/tools/scholarship-calculator"))
    );
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
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.heading && (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">
                {group.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isAIToolsActive(item);
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
                    <item.icon className={cn(
                      "w-4 h-4 flex-shrink-0",
                      active ? "text-white" : "text-gray-400 group-hover:text-[#1a3c8f]"
                    )} />
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/60 flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
