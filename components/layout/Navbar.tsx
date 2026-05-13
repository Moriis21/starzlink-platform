"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Search, LogOut, User, LayoutDashboard, Bookmark, Bell, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import NotificationBell from "@/components/ui/NotificationBell";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Opportunities",
    href: "/opportunities",
    children: [
      { label: "All Opportunities", href: "/opportunities" },
      { label: "Jobs", href: "/opportunities/jobs" },
      { label: "Scholarships", href: "/opportunities/scholarships" },
      { label: "Internships", href: "/opportunities/internships" },
      { label: "Grants & Fellowships", href: "/opportunities/grants" },
      { label: "Competitions", href: "/opportunities/competitions" },
      { label: "Volunteer", href: "/opportunities/volunteer" },
      { label: "Study Abroad", href: "/opportunities/study-abroad" },
      { label: "Research", href: "/opportunities/research" },
    ],
  },
  { label: "Trainings", href: "/trainings" },
  { label: "Campus Updates", href: "/campus-updates" },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "All Resources", href: "/resources" },
      { label: "CV Templates", href: "/resources?category=cv-templates" },
      { label: "Guides & eBooks", href: "/resources?category=guides" },
    ],
  },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo variant="light" size="sm" href="/" />

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.children ? (
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      pathname.startsWith(link.href) ? "text-[#1a3c8f] bg-blue-50" : "text-gray-600 hover:text-[#1a3c8f] hover:bg-blue-50"
                    )}
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-colors block",
                      pathname === link.href ? "text-[#1a3c8f] bg-blue-50" : "text-gray-600 hover:text-[#1a3c8f] hover:bg-blue-50"
                    )}
                  >
                    {link.label}
                  </Link>
                )}
                {link.children && (
                  <div
                    className={cn(
                      "absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 transition-all duration-150",
                      openDropdown === link.label ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                    )}
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1a3c8f]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/opportunities" className="p-2 text-gray-500 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-xl transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            {user && <NotificationBell />}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#1a3c8f] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{user.full_name?.split(" ")[0]}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50" onClick={() => setProfileOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> My Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50" onClick={() => setProfileOpen(false)}>
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link href="/saved" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50" onClick={() => setProfileOpen(false)}>
                      <Bookmark className="w-4 h-4" /> Saved Items
                    </Link>
                    <Link href="/notifications" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50" onClick={() => setProfileOpen(false)}>
                      <Bell className="w-4 h-4" /> Notifications
                    </Link>
                    <Link href="/recommendations" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50" onClick={() => setProfileOpen(false)}>
                      <Sparkles className="w-4 h-4" /> For You
                    </Link>
                    <Link href="/referrals" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50" onClick={() => setProfileOpen(false)}>
                      <Users className="w-4 h-4" /> Referrals
                    </Link>
                    <Link href="/dashboard/career" className="flex items-center gap-2 px-4 py-2 text-sm text-[#1a3c8f] font-semibold hover:bg-blue-50" onClick={() => setProfileOpen(false)}>
                      <Sparkles className="w-4 h-4 text-yellow-500" /> AI Career
                    </Link>
                    {(user.role === "admin" || user.role === "super_admin") && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-[#1a3c8f] hover:bg-blue-50 font-medium" onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={() => { logout(); setProfileOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-[#1a3c8f] border border-[#1a3c8f] rounded-lg hover:bg-blue-50 transition-colors">
                  Log In
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-[#1a3c8f] rounded-lg hover:bg-blue-900 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden p-2 text-gray-600 hover:text-[#1a3c8f]" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                className={cn(
                  "block px-3 py-2.5 text-sm font-medium rounded-lg",
                  pathname === link.href ? "bg-blue-50 text-[#1a3c8f]" : "text-gray-700 hover:bg-blue-50"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="ml-4 space-y-1 mt-1">
                  {link.children.slice(1).map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-[#1a3c8f] rounded-lg hover:bg-blue-50"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="flex-1 py-2.5 text-sm text-white bg-red-500 rounded-lg font-medium">
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="flex-1 py-2.5 text-sm text-center text-[#1a3c8f] border border-[#1a3c8f] rounded-lg font-medium" onClick={() => setMobileOpen(false)}>Log In</Link>
                <Link href="/signup" className="flex-1 py-2.5 text-sm text-center text-white bg-[#1a3c8f] rounded-lg font-medium" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
