"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, MoreVertical, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check if dismissed before
    const wasDismissed = localStorage.getItem("pwa_install_dismissed");
    if (wasDismissed) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Android/Desktop: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 3 seconds
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show after 5 seconds if in mobile Safari
    if (ios && !standalone) {
      const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
      if (isSafari) setTimeout(() => setShow(true), 5000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("pwa_install_dismissed", "1");
  };

  if (!show || isStandalone || dismissed) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[9990]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <img src="/images/logo.jpg" alt="StarzLink" className="w-8 h-8 object-contain rounded-lg"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Install StarzLink</p>
            <p className="text-blue-200 text-xs">Add to your home screen</p>
          </div>
          <button onClick={handleDismiss} className="p-1.5 text-blue-200 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {!isIOS ? (
            // Android / Desktop
            <>
              <p className="text-sm text-gray-600 mb-3">
                Install the StarzLink app for faster access, offline support, and a better experience.
              </p>
              <div className="flex gap-2">
                <button onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-2.5 rounded-xl hover:bg-blue-900 text-sm transition-colors">
                  <Download className="w-4 h-4" /> Install App
                </button>
                <button onClick={handleDismiss}
                  className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Not now
                </button>
              </div>
            </>
          ) : (
            // iOS Safari instructions
            <>
              <p className="text-sm text-gray-600 mb-3">
                To install StarzLink on your iPhone:
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#1a3c8f] text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">1</span>
                  <span>Tap <Share className="w-3.5 h-3.5 inline text-blue-600" /> <strong>Share</strong> in Safari's toolbar</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#1a3c8f] text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">2</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong> <Plus className="w-3.5 h-3.5 inline" /></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-[#1a3c8f] text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">3</span>
                  <span>Tap <strong>Add</strong> — StarzLink will appear on your home screen</span>
                </div>
              </div>
              <button onClick={handleDismiss}
                className="w-full mt-3 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Got it
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
