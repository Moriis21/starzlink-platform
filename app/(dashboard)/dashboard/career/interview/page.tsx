"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradeModal from "@/components/career/UpgradeModal";
import {
  Mic,
  ChevronDown,
  ChevronUp,
  Loader2,
  Crown,
  Lock,
  DollarSign,
  AlertTriangle,
  Star,
  Users,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ToolNavBar, NextSteps } from "@/components/ui/ToolNav";

type TabKey = "common" | "technical" | "behavioral" | "hr" | "salary" | "mistakes" | "confidence";

function Accordion({ question, answer, tip }: { question: string; answer: string; tip?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left gap-3"
      >
        <span className="font-semibold text-gray-800 text-sm">{question}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-white">
              <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
              {tip && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3" /> {tip}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InterviewPage() {
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("common");
  const [upgradeModal, setUpgradeModal] = useState(false);

  const TABS: { key: TabKey; label: string; icon: any }[] = [
    { key: "common", label: "Common Questions", icon: Mic },
    { key: "technical", label: "Technical", icon: Users },
    { key: "behavioral", label: "Behavioral", icon: Users },
    { key: "hr", label: "HR Tips", icon: Users },
    { key: "salary", label: "Salary Negotiation", icon: DollarSign },
    { key: "mistakes", label: "Common Mistakes", icon: AlertTriangle },
    { key: "confidence", label: "Confidence Tips", icon: Star },
  ];

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !user?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/career/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: jobTitle.trim(), userId: user.id }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to generate guide");
      }

      const data = await res.json();
      setGuide(data);
      setActiveTab("common");
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
        <UpgradeModal isOpen={upgradeModal} onClose={() => setUpgradeModal(false)} featureName="Interview Pro" />
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Interview Pro</h2>
        <p className="text-gray-500 mb-6">
          Get AI-powered preparation guides for any job interview — tailored questions, strong answers, salary tips, and more.
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 text-left mb-6 shadow-sm">
          <ul className="space-y-2">
            {[
              "Common, Technical & Behavioral Questions",
              "Strong answer examples for each question",
              "HR tips and salary negotiation scripts",
              "Common interview mistakes to avoid",
              "Confidence-building techniques",
            ].map(f => (
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
          <Crown className="w-4 h-4" /> Unlock Interview Pro
        </button>
        <Link href="/dashboard/career" className="block mt-3 text-sm text-gray-500 hover:text-gray-700">
          ← Back to Career Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb crumbs={[{ label: "Career Tools", href: "/dashboard/tools" }, { label: "AI Career Assistant", href: "/dashboard/career" }, { label: "Interview Prep" }]} />
      <ToolNavBar />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Mic className="w-6 h-6 text-[#1a3c8f]" /> Interview Pro
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">AI-powered interview preparation for any job</p>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full">
          <Crown className="w-3.5 h-3.5" /> Pro
        </span>
      </div>

      {/* Form */}
      {!guide && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4">What role are you interviewing for?</h3>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="e.g. Software Engineer, Marketing Manager, Nurse..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a3c8f] focus:border-transparent text-base mb-4"
          />
          <button
            onClick={handleGenerate}
            disabled={!jobTitle.trim() || loading}
            className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Preparing your interview guide...</>
            ) : (
              <><Mic className="w-4 h-4" /> Generate Interview Guide</>
            )}
          </button>
        </motion.div>
      )}

      {/* Results */}
      {guide && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Interview Guide: <span className="text-[#1a3c8f]">{guide.sessionId ? jobTitle : jobTitle}</span>
            </h2>
            <button
              onClick={() => { setGuide(null); setJobTitle(""); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" /> New Session
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
            <div className="flex overflow-x-auto border-b border-gray-100">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-[#1a3c8f] text-[#1a3c8f] bg-blue-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-3">
              {activeTab === "common" && (
                (guide.common_questions ?? []).map((q: any, i: number) => (
                  <Accordion key={i} question={q.question} answer={q.strong_answer} />
                ))
              )}
              {activeTab === "technical" && (
                (guide.technical_questions ?? []).map((q: any, i: number) => (
                  <Accordion key={i} question={q.question} answer={q.answer} />
                ))
              )}
              {activeTab === "behavioral" && (
                (guide.behavioral_questions ?? []).map((q: any, i: number) => (
                  <Accordion key={i} question={q.question} answer={q.answer} tip={q.tip} />
                ))
              )}
              {activeTab === "hr" && (
                <ol className="space-y-2">
                  {(guide.hr_tips ?? []).map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ol>
              )}
              {activeTab === "salary" && (
                <ul className="space-y-2">
                  {(guide.salary_negotiation ?? []).map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <DollarSign className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> {tip}
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === "mistakes" && (
                <ul className="space-y-2">
                  {(guide.common_mistakes ?? []).map((m: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" /> {m}
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === "confidence" && (
                <ul className="space-y-2">
                  {(guide.confidence_tips ?? []).map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" /> {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}
      <NextSteps />
    </div>
  );
}
