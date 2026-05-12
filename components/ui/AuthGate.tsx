"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";

interface AuthGateProps {
  children: React.ReactNode;
  /** First few elements to show as teaser before the blur wall */
  preview?: React.ReactNode;
}

export default function AuthGate({ children, preview }: AuthGateProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    </div>
  );

  if (user) return <>{children}</>;

  // Not logged in — show teaser + blur wall
  return (
    <div>
      {/* Show the teaser content (title, hero, quick info) */}
      {preview}

      {/* Blur wall */}
      <div className="relative">
        {/* Blurred fake content */}
        <div className="select-none pointer-events-none" aria-hidden>
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 blur-sm opacity-40">
            <div className="h-5 bg-gray-300 rounded w-full" />
            <div className="h-5 bg-gray-300 rounded w-5/6" />
            <div className="h-5 bg-gray-200 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-300 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-4/5" />
            <div className="h-20 bg-gray-100 rounded" />
            <div className="h-5 bg-gray-300 rounded w-full" />
            <div className="h-5 bg-gray-200 rounded w-2/3" />
          </div>
        </div>

        {/* Overlay login prompt */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-white/80 to-white">
          <div className="text-center px-6 py-8 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-[#1a3c8f]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#1a3c8f]" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Login to View Full Details</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Create a free account or log in to access the full details, requirements, application links and more.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                className="flex items-center justify-center gap-2 w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors"
              >
                <LogIn className="w-4 h-4" /> Log In to Continue
              </Link>
              <Link
                href={`/signup?next=${encodeURIComponent(pathname)}`}
                className="flex items-center justify-center gap-2 w-full border-2 border-[#1a3c8f] text-[#1a3c8f] font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Create Free Account
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Joining is free. Access thousands of opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
