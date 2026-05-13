"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/career/UpgradeModal";
import {
  Download,
  Lock,
  Loader2,
  ArrowLeft,
  AlertCircle,
  FileText,
  Mic,
  Mail,
  Crown,
} from "lucide-react";
import { motion } from "framer-motion";

// ── Clean CV text — strips all markdown symbols ─────────────────────────────

function cleanCVText(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/`{1,3}/g, "")
    .replace(/_{1,2}/g, "")
    .replace(/^\s*[-•]\s/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ImprovedCVPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();

  const [content, setContent] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"after" | "before">("after");
  const [originalText, setOriginalText] = useState("");
  const [upgradeModal, setUpgradeModal] = useState(false);

  // ── Anti-copy protection for free users ──────────────────────────────────
  useEffect(() => {
    if (isPro) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && ["c", "p", "s", "a"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPro]);

  useEffect(() => {
    if (!id || !user?.id) return;

    const fetchData = async () => {
      try {
        const { data, error: dbError } = await insforge.database
          .from("improved_cvs")
          .select("*, cv_uploads(extracted_text)")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (dbError || !data) {
          setError("Improved CV not found.");
        } else {
          const d = data as any;
          const cleaned = cleanCVText(d.improved_content ?? "");
          setContent(cleaned);
          setEditedContent(cleaned);
          setOriginalText(d.cv_uploads?.extracted_text ?? "");
        }
      } catch {
        setError("Failed to load improved CV.");
      }
      setLoading(false);
    };

    fetchData();
  }, [id, user?.id]);

  const downloadPDF = () => {
    if (!isPro) { setUpgradeModal(true); return; }
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Improved CV</title>
        <style>
          body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 40px; font-size: 12pt; line-height: 1.6; color: #111; }
          pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; font-size: 11pt; }
          @media print { body { margin: 0; padding: 20px; } }
        </style>
      </head>
      <body><pre>${editedContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadWord = () => {
    if (!isPro) { setUpgradeModal(true); return; }
    const blob = new Blob([editedContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "improved-cv.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || subLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold">{error}</p>
        <Link href="/dashboard/career" className="mt-4 inline-block text-[#1a3c8f] font-semibold hover:underline text-sm">
          Back to Career Dashboard
        </Link>
      </div>
    );
  }

  // Calculate blur cutoff — free users see 30% of lines
  const lines = editedContent.split("\n");
  const cutoffLine = Math.floor(lines.length * 0.3);
  const visibleContent = lines.slice(0, cutoffLine).join("\n");
  const blurredContent = lines.slice(cutoffLine).join("\n");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <UpgradeModal
        isOpen={upgradeModal}
        onClose={() => setUpgradeModal(false)}
        featureName="CV Download"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/career" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Your Professionally Improved CV</h1>
            <p className="text-sm text-gray-500">AI-rewritten for maximum impact and ATS compatibility</p>
          </div>
        </div>
        {isPro && (
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full">
            <Crown className="w-3.5 h-3.5" /> Pro Access
          </span>
        )}
      </div>

      {/* Free user upgrade notice */}
      {!isPro && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              You have used your free CV analysis credit.
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Upgrade to Pro to download, copy, export, and unlock full career tools.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href="/dashboard/career/upgrade"
              className="px-4 py-2 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Upgrade Monthly ($5)
            </Link>
            <Link
              href="/dashboard/career/upgrade"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Upgrade Yearly ($50)
            </Link>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView("after")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            view === "after"
              ? "bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          After (Improved)
        </button>
        <button
          onClick={() => setView("before")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            view === "before"
              ? "bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Before (Original)
        </button>
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
        {view === "before" ? (
          <div className="p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Original CV Text</p>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
              {originalText || "Original text not available."}
            </pre>
          </div>
        ) : isPro ? (
          <div className="p-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">
              Improved CV — Edit below
            </p>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full min-h-[600px] text-sm text-gray-800 leading-relaxed font-mono resize-y border-0 outline-none bg-transparent"
              spellCheck
            />
          </div>
        ) : (
          <div
            className="p-6 relative"
            onContextMenu={(e) => e.preventDefault()}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Improved CV Preview</p>
            <pre
              className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed"
              style={{ userSelect: "none" }}
            >
              {visibleContent}
            </pre>
            <div className="relative">
              <pre
                className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed"
                style={{ filter: "blur(4px)", userSelect: "none" }}
              >
                {blurredContent}
              </pre>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white flex items-end justify-center pb-8">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-700 font-bold text-sm">Upgrade to Pro to Download</p>
                  <button
                    onClick={() => setUpgradeModal(true)}
                    className="mt-3 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm inline-flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" /> Unlock Full CV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={downloadPDF}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-sm font-semibold relative ${
            isPro
              ? "border-[#1a3c8f] text-[#1a3c8f] hover:bg-blue-50"
              : "border-gray-200 text-gray-400 cursor-pointer hover:border-yellow-400"
          }`}
        >
          <Download className="w-5 h-5" />
          <span>Download PDF</span>
          {!isPro && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Pro</span>}
        </button>

        <button
          onClick={downloadWord}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-sm font-semibold ${
            isPro
              ? "border-[#1a3c8f] text-[#1a3c8f] hover:bg-blue-50"
              : "border-gray-200 text-gray-400 cursor-pointer hover:border-yellow-400"
          }`}
        >
          <Download className="w-5 h-5" />
          <span>Download Word</span>
          {!isPro && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Pro</span>}
        </button>

        <Link
          href="/dashboard/career/letter"
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-200 text-gray-600 hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-all text-sm font-semibold text-center"
        >
          <Mail className="w-5 h-5" />
          <span>Application Letter</span>
        </Link>

        <Link
          href="/dashboard/career/interview"
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-200 text-gray-600 hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-all text-sm font-semibold text-center"
        >
          <Mic className="w-5 h-5" />
          <span>Interview Prep</span>
        </Link>
      </div>
    </div>
  );
}
