"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/dashboard", icon: Home, exact: true },
  { label: "Explore", href: "/opportunities", icon: Search },
  { label: "Saved", href: "/dashboard/saved", icon: Bookmark },
  { label: "Career", href: "/dashboard/career", icon: Sparkles },
  { label: "Profile", href: "/profile", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around px-2 py-1 safe-area-pb">
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[60px]",
                active ? "text-[#1a3c8f]" : "text-gray-400 hover:text-gray-600")}>
              <item.icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              <span className={cn("text-[10px] font-medium", active ? "text-[#1a3c8f] font-bold" : "text-gray-400")}>
                {item.label}
              </span>
              {active && <div className="w-1 h-1 rounded-full bg-[#1a3c8f]" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
