"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export default function PWARegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [reg, setReg] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        setReg(registration);

        // Check for updates every 60 seconds
        const interval = setInterval(() => registration.update(), 60000);

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });

        return () => clearInterval(interval);
      } catch (err) {
        console.warn("Service worker registration failed:", err);
      }
    };

    registerSW();
  }, []);

  const applyUpdate = () => {
    if (reg?.waiting) {
      reg.waiting.postMessage("skipWaiting");
    }
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[10000]">
      <div className="bg-[#0d1b4b] text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3">
        <div className="flex-1">
          <p className="font-bold text-sm">New update available</p>
          <p className="text-blue-200 text-xs mt-0.5">Refresh to get the latest version of StarzLink.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={applyUpdate}
            className="flex items-center gap-1.5 bg-white text-[#0d1b4b] text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Update Now
          </button>
          <button onClick={() => setUpdateAvailable(false)}
            className="p-2 text-blue-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
