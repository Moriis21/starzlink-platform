"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/career/UpgradeModal";
import {
  Link2,
  Loader2,
  Crown,
  Lock,
  Copy,
  CheckCircle,
  Tag,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ToolNavBar, NextSteps } from "@/components/ui/ToolNav";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1a3c8f] px-2 py-1 rounded hover:bg-gray-100 transition-colors ml-auto"
    >
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function LinkedinPage() {
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const [upgradeModal, setUpgradeModal] = useState(false);

  const [headline, setHeadline] = useState("");
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);

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
          setCvText((data as any).extracted_text.slice(0, 4000));
        }
      });
  }, [user?.id]);

  const handleOptimize = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/career/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentHeadline: headline.trim(),
          cvText: cvText.trim(),
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Optimization failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    }
    setLoading(false);
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
        <UpgradeModal isOpen={upgradeModal} onClose={() => setUpgradeModal(false)} featureName="LinkedIn Optimizer" />
        <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-sky-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">LinkedIn Optimizer</h2>
        <p className="text-gray-500 mb-6">
          Transform your LinkedIn profile with AI-powered suggestions that attract recruiters and opportunities.
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 text-left mb-6 shadow-sm">
          <ul className="space-y-2">
            {["5 compelling headline options", "Full About section rewrite", "Top 15 skills to add", "20 searchability keywords", "10 profile improvement tips"].map(f => (
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
          <Crown className="w-4 h-4" /> Unlock LinkedIn Optimizer
        </button>
        <Link href="/dashboard/career" className="block mt-3 text-sm text-gray-500 hover:text-gray-700">
          ← Back to Career Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb crumbs={[{ label: "Career Tools", href: "/dashboard/tools" }, { label: "AI Career Assistant", href: "/dashboard/career" }, { label: "LinkedIn Optimizer" }]} />
      <ToolNavBar />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-[#1a3c8f]" /> LinkedIn Optimizer
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">AI-powered suggestions to attract more opportunities</p>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full">
          <Crown className="w-3.5 h-3.5" /> Pro
        </span>
      </div>

      {/* Input Form */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Your Professional Profile</h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current LinkedIn Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Software Engineer at TechCorp | Building scalable systems"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Your CV / Professional Summary
            <span className="text-gray-400 font-normal text-xs ml-1">(auto-filled from latest CV)</span>
          </label>
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste your CV text or professional highlights..."
            rows={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] focus:border-transparent resize-none text-sm"
          />
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading || (!headline.trim() && !cvText.trim())}
          className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Optimizing your LinkedIn profile...</>
          ) : (
            <><Link2 className="w-4 h-4" /> Optimize My LinkedIn</>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Headline Suggestions */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5">
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Headline Suggestions</h3>
            <div className="w-8 h-1 bg-[#1a3c8f] rounded-full mb-4" />
            <div className="space-y-2">
              {(result.headline_suggestions ?? []).map((h: string, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-gray-800 flex-1">{h}</p>
                  <CopyButton text={h} />
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          {result.about_rewrite && (
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-extrabold text-gray-900">About Section Rewrite</h3>
                <CopyButton text={result.about_rewrite} />
              </div>
              <div className="w-8 h-1 bg-[#1a3c8f] rounded-full mb-4" />
              <div className="bg-gray-50 rounded-xl p-4">
                <p className={`text-sm text-gray-700 leading-relaxed ${!aboutExpanded ? "line-clamp-4" : ""}`}>
                  {result.about_rewrite}
                </p>
                <button
                  onClick={() => setAboutExpanded(!aboutExpanded)}
                  className="mt-2 flex items-center gap-1 text-xs text-[#1a3c8f] font-medium"
                >
                  {aboutExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show more</>}
                </button>
              </div>
            </div>
          )}

          {/* Skills & Keywords */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5">
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Top Skills to Add</h3>
              <div className="w-8 h-1 bg-green-500 rounded-full mb-4" />
              <div className="flex flex-wrap gap-2">
                {(result.skills_suggestions ?? []).map((skill: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => navigator.clipboard.writeText(skill)}
                    title="Click to copy"
                    className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5">
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Important Keywords</h3>
              <div className="w-8 h-1 bg-yellow-500 rounded-full mb-4" />
              <div className="flex flex-wrap gap-2">
                {(result.keyword_suggestions ?? []).map((kw: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => navigator.clipboard.writeText(kw)}
                    title="Click to copy"
                    className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-yellow-200 transition-colors cursor-pointer"
                  >
                    <Tag className="w-2.5 h-2.5" /> {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Tips */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5">
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Profile Improvement Tips</h3>
            <div className="w-8 h-1 bg-purple-500 rounded-full mb-4" />
            <ol className="space-y-3">
              {(result.profile_tips ?? []).map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
      <NextSteps />
    </div>
  );
}
