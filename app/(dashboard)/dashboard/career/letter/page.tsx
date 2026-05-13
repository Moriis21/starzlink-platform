"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/career/UpgradeModal";
import {
  Mail,
  Loader2,
  Crown,
  Lock,
  Download,
  Copy,
  CheckCircle,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LetterPage() {
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const [upgradeModal, setUpgradeModal] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState("");
  const [editedLetter, setEditedLetter] = useState("");
  const [copied, setCopied] = useState(false);

  // Pre-fill with latest CV text if available
  useEffect(() => {
    if (!user?.id) return;
    insforge.database
      .from("cv_uploads")
      .select("extracted_text")
      .eq("user_id", user.id)
      .eq("status", "analyzed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if ((data as any)?.extracted_text) {
          setCvText((data as any).extracted_text.slice(0, 3000));
        }
      });
  }, [user?.id]);

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !companyName.trim() || !user?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/career/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          companyName: companyName.trim(),
          cvText: cvText.trim(),
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to generate letter");
      }

      const { content } = await res.json();
      setLetter(content);
      setEditedLetter(content);
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([editedLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application-letter-${companyName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (subLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <UpgradeModal isOpen={upgradeModal} onClose={() => setUpgradeModal(false)} featureName="Application Letter Generator" />
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Application Letter Generator</h2>
        <p className="text-gray-500 mb-6">
          Generate professional, tailored cover letters for any job application in seconds.
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 text-left mb-6 shadow-sm">
          <ul className="space-y-2">
            {["Custom letters for any job and company", "Uses your CV background automatically", "Professional and persuasive tone", "Fully editable before sending", "Instant download"].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setUpgradeModal(true)}
          className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2"
        >
          <Crown className="w-4 h-4" /> Unlock Letter Generator
        </button>
        <Link href="/dashboard/career" className="block mt-3 text-sm text-gray-500 hover:text-gray-700">
          ← Back to Career Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#1a3c8f]" /> Application Letter Generator
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Generate professional cover letters in seconds</p>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full">
          <Crown className="w-3.5 h-3.5" /> Pro
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6 space-y-4 h-fit">
          <h3 className="font-bold text-gray-900">Job Details</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title *</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Marketing Manager"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your Background / CV Key Points
              <span className="text-gray-400 font-normal text-xs ml-1">(optional — auto-filled from latest CV)</span>
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV text or key professional highlights..."
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] focus:border-transparent resize-none text-sm"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!jobTitle.trim() || !companyName.trim() || loading}
            className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating letter...</>
            ) : (
              <><Mail className="w-4 h-4" /> Generate Letter</>
            )}
          </button>
        </div>

        {/* Preview */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Letter Preview</h3>
            {letter && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#1a3c8f] px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#1a3c8f] px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            )}
          </div>

          {letter ? (
            <>
              <textarea
                value={editedLetter}
                onChange={(e) => setEditedLetter(e.target.value)}
                className="w-full min-h-[450px] border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{editedLetter.length} characters</p>
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center h-[450px] flex flex-col items-center justify-center">
              <Mail className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Your letter will appear here</p>
              <p className="text-gray-300 text-xs mt-1">Fill in the details and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
