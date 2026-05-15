"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Home, Bookmark } from "lucide-react";

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => { setOnline(true); window.location.href = "/"; };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const retry = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/stats", { method: "HEAD", cache: "no-store" });
      if (res.ok) window.location.href = "/";
    } catch {}
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] flex flex-col items-center justify-center px-4 text-white">
      <div className="text-center max-w-sm">
        {/* Logo */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <img src="/images/logo.jpg" alt="StarzLink" className="w-14 h-14 object-contain rounded-xl"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>

        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <WifiOff className="w-8 h-8 text-blue-200" />
        </div>

        <h1 className="text-2xl font-extrabold mb-2">You're Offline</h1>
        <p className="text-blue-200 text-sm mb-8 leading-relaxed">
          Some features may be limited without an internet connection. Check your connection and try again.
        </p>

        <div className="space-y-3">
          <button
            onClick={retry}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 bg-white text-[#1a3c8f] font-bold py-3.5 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking connection…" : "Retry Connection"}
          </button>

          <Link href="/"
            className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-colors">
            <Home className="w-4 h-4" /> Go to Home
          </Link>

          <Link href="/dashboard/saved"
            className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-colors">
            <Bookmark className="w-4 h-4" /> View Saved Items
          </Link>
        </div>

        <p className="text-xs text-blue-300 mt-6">
          StarzLink — Opportunity • Impact • Inspiration
        </p>
      </div>
    </div>
  );
}
