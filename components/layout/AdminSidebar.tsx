"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Briefcase, GraduationCap, BookOpen, Megaphone,
  FolderOpen, MessageSquare, Mail, BarChart3, Settings, Shield, Activity,
  Globe, Menu, X, ChevronDown, ChevronRight, Tag, TrendingUp, ClipboardList,
  Calendar, Trophy, Gift, Crown
} from "lucide-react";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    label: "Users",
    icon: Users,
    children: [
      { label: "All Users", href: "/admin/users" },
      { label: "Roles & Permissions", href: "/admin/roles" },
    ]
  },
  {
    label: "Opportunities",
    icon: Briefcase,
    children: [
      { label: "Jobs", href: "/admin/jobs" },
      { label: "Scholarships", href: "/admin/scholarships" },
      { label: "Trainings", href: "/admin/trainings" },
      { label: "Opportunities", href: "/admin/opportunities" },
    ]
  },
  { label: "Campus Updates", href: "/admin/campus-updates", icon: Megaphone },
  { label: "Resources", href: "/admin/resources", icon: FolderOpen },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Partners", href: "/admin/partners", icon: Globe },
  { label: "Submissions", href: "/admin/submissions", icon: BookOpen },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare, badge: true },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Campaigns", href: "/admin/campaigns", icon: Mail },
  { label: "Leaderboard", href: "/admin/leaderboard", icon: Trophy },
  { label: "Pro Access", href: "/admin/pro-access", icon: Crown },
  { label: "Redemptions", href: "/admin/redemptions", icon: Gift },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Reports", href: "/admin/reports", icon: TrendingUp },
  { label: "Activity Logs", href: "/admin/activity-logs", icon: ClipboardList },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["Opportunities"]);
  const { user } = useAuth();

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);
  };

  return (
    <aside className={cn(
      "bg-[#0d1b4b] text-white flex flex-col transition-all duration-300 h-screen sticky top-0",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
        {!collapsed && (
          <Logo variant="dark" size="sm" href="/" />
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
              {user.full_name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate max-w-[140px]">{user.full_name}</p>
              <p className="text-xs text-blue-300 capitalize">{user.role?.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => {
          if (item.children) {
            const isOpen = openGroups.includes(item.label);
            const isActive = item.children.some(c => pathname === c.href);
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive ? "bg-white/15 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
                {!collapsed && isOpen && (
                  <div className="ml-8 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-3 py-2 rounded-lg text-sm transition-colors",
                          pathname === child.href ? "bg-[#1a3c8f] text-white font-medium" : "text-gray-400 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive ? "bg-[#1a3c8f] text-white font-medium" : "text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
            <Globe className="w-4 h-4" /> View Public Site
          </Link>
        </div>
      )}
    </aside>
  );
}
