"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Copy, Check, AlertTriangle, Loader2, Home } from "lucide-react";
import toast from "react-hot-toast";

function ViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const url = searchParams.get("url") || "";
  const title = searchParams.get("title") || "External Page";
  const back = searchParams.get("back") || "/opportunities";
  const type = searchParams.get("type") || "page";

  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const decodedUrl = url ? decodeURIComponent(url) : "";

  // Some sites block iframes — detect and show fallback
  const handleIframeLoad = () => setLoading(false);
  const handleIframeError = () => { setLoading(false); setBlocked(true); };

  // Timeout — if iframe takes too long, assume blocked
  useEffect(() => {
    if (!decodedUrl) return;
    const t = setTimeout(() => { if (loading) { setLoading(false); setBlocked(true); } }, 8000);
    return () => clearTimeout(t);
  }, [decodedUrl, loading]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(decodedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied!");
    } catch { toast.error("Copy failed"); }
  };

  if (!decodedUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No URL provided</h2>
        <Link href="/opportunities" className="text-[#1a3c8f] hover:underline">← Back to Opportunities</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky top bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm px-4 py-2.5 flex items-center gap-3">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1a3c8f] font-medium flex-shrink-0">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{decodeURIComponent(title)}</p>
          <p className="text-xs text-gray-400 truncate hidden sm:block">{decodedUrl}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={copyLink}
            className="p-2 text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-lg transition-colors" title="Copy link">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <a href={decodedUrl} target="_blank" rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-lg transition-colors" title="Open in new tab">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 relative">
        {/* Loading state */}
        {loading && !blocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading page…</p>
          </div>
        )}

        {/* Blocked/fallback state */}
        {blocked && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Cannot load inside StarzLink</h2>
            <p className="text-gray-500 text-sm mb-6">
              This website prevents embedding. Use the button below to open it directly.
            </p>
            <div className="space-y-3 w-full">
              <a href={decodedUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors">
                <ExternalLink className="w-4 h-4" />
                Open {decodeURIComponent(title)}
              </a>
              <button onClick={copyLink}
                className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">
                {copied ? <><Check className="w-4 h-4 text-green-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
              </button>
              <Link href={back}
                className="flex items-center justify-center gap-2 w-full text-gray-500 text-sm hover:text-[#1a3c8f] py-2">
                <ArrowLeft className="w-4 h-4" /> Back to {type === "scholarship" ? "Scholarship" : type === "job" ? "Job" : "Opportunity"}
              </Link>
              <Link href="/dashboard"
                className="flex items-center justify-center gap-2 w-full text-gray-400 text-sm hover:text-[#1a3c8f] py-1">
                <Home className="w-4 h-4" /> Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* iframe */}
        {!blocked && (
          <iframe
            src={decodedUrl}
            className={`w-full border-0 ${loading ? "h-0" : "min-h-[calc(100vh-130px)]"}`}
            style={{ height: loading ? 0 : "calc(100vh - 130px)" }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={decodeURIComponent(title)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        )}
      </div>
    </div>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}
