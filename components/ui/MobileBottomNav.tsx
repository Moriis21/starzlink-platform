"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, Cpu, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home",    href: "/dashboard",          icon: Home,     exact: true },
  { label: "Explore", href: "/opportunities",       icon: Search },
  { label: "Saved",   href: "/dashboard/saved",     icon: Bookmark },
  { label: "AI Tools",href: "/dashboard/ai-tools",  icon: Cpu },
  { label: "Profile", href: "/profile",             icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (item: typeof NAV[0]) => {
    if (item.exact) return pathname === item.href;
    // AI Tools tab also lights up for career/* and /tools/* pages
    if (item.href === "/dashboard/ai-tools") {
      return (
        pathname.startsWith("/dashboard/ai-tools") ||
        pathname.startsWith("/dashboard/career") ||
        (pathname.startsWith("/tools/") && pathname !== "/tools/cv-builder")
      );
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around px-1 py-1 safe-area-pb">
        {NAV.map(item => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-colors min-w-[56px]",
                active ? "text-[#1a3c8f]" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-xl transition-all",
                active && "bg-blue-50"
              )}>
                <item.icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                active ? "text-[#1a3c8f] font-bold" : "text-gray-400"
              )}>
                {item.label}
              </span>
              {active && <div className="w-1 h-1 rounded-full bg-[#1a3c8f] mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
