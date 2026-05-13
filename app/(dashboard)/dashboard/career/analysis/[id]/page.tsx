"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import {
  CheckCircle,
  AlertTriangle,
  Tag,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f97316" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth="8" stroke="#e5e7eb" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-extrabold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="px-4 py-3 text-sm text-gray-700">{children}</div>}
    </div>
  );
}

type TabKey = "strengths" | "improve" | "keywords" | "formatting" | "sections" | "jobs";

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [upload, setUpload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("strengths");
  const [improving, setImproving] = useState(false);

  useEffect(() => {
    if (!id || !user?.id) return;

    const fetchAnalysis = async () => {
      try {
        const { data, error: dbError } = await insforge.database
          .from("cv_analysis")
          .select("*, cv_uploads(file_name, id)")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (dbError || !data) {
          setError("Analysis not found.");
        } else {
          setAnalysis(data as any);
          setUpload((data as any).cv_uploads);
        }
      } catch {
        setError("Failed to load analysis.");
      }
      setLoading(false);
    };

    fetchAnalysis();
  }, [id, user?.id]);

  const handleImprove = async () => {
    if (!analysis?.upload_id || !user?.id) return;
    setImproving(true);
    try {
      const res = await fetch("/api/career/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: analysis.upload_id, userId: user.id }),
      });

      if (!res.ok) {
        const { error: apiError } = await res.json();
        throw new Error(apiError || "Failed to improve CV");
      }

      const { improvedCvId } = await res.json();
      router.push(`/dashboard/career/improved/${improvedCvId}`);
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    }
    setImproving(false);
  };

  const TABS: { key: TabKey; label: string }[] = [
    { key: "strengths", label: "Strengths" },
    { key: "improve", label: "Areas to Improve" },
    { key: "keywords", label: "Missing Keywords" },
    { key: "formatting", label: "Formatting Issues" },
    { key: "sections", label: "Section Review" },
    { key: "jobs", label: "Recommended Jobs" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold">{error || "Analysis not found"}</p>
        <Link href="/dashboard/career/upload" className="mt-4 inline-block text-[#1a3c8f] font-semibold hover:underline text-sm">
          ← Upload a new CV
        </Link>
      </div>
    );
  }

  const cvScore = analysis.overall_score ?? 0;
  const atsScore = analysis.ats_score ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/career" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">CV Analysis Results</h1>
          {upload?.file_name && <p className="text-sm text-gray-500">{upload.file_name}</p>}
        </div>
      </div>

      {/* Score circles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5 flex flex-col items-center"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Overall CV Score</p>
          <ScoreRing score={cvScore} />
          <p className="mt-3 text-xs text-gray-500">
            {cvScore >= 70 ? "Excellent" : cvScore >= 50 ? "Needs Work" : "Needs Major Revision"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5 flex flex-col items-center"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">ATS Score</p>
          <ScoreRing score={atsScore} />
          <p className="mt-3 text-xs text-gray-500">
            {atsScore >= 70 ? "ATS Friendly" : atsScore >= 50 ? "Moderate" : "Low ATS Compatibility"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5 text-center"
        >
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-extrabold text-gray-900">{(analysis.strengths as string[])?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">Strengths</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5 text-center"
        >
          <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-extrabold text-gray-900">
            {((analysis.weak_areas as string[])?.length ?? 0) + ((analysis.formatting_issues as string[])?.length ?? 0)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Issues Found</p>
        </motion.div>
      </div>

      {/* Career Advice */}
      {analysis.career_advice && (
        <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-2xl p-6 text-white">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold mb-1">AI Career Advice</h3>
              <p className="text-blue-100 text-sm leading-relaxed">{analysis.career_advice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
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

        <div className="p-5">
          {activeTab === "strengths" && (
            <ul className="space-y-2">
              {((analysis.strengths as string[]) ?? []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
              {(analysis.strengths as string[])?.length === 0 && (
                <p className="text-gray-400 text-sm">No strengths identified.</p>
              )}
            </ul>
          )}

          {activeTab === "improve" && (
            <ul className="space-y-2">
              {((analysis.weak_areas as string[]) ?? []).map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  {w}
                </li>
              ))}
              {(analysis.weak_areas as string[])?.length === 0 && (
                <p className="text-gray-400 text-sm">No weak areas identified.</p>
              )}
            </ul>
          )}

          {activeTab === "keywords" && (
            <div className="flex flex-wrap gap-2">
              {((analysis.missing_keywords as string[]) ?? []).map((kw, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" /> {kw}
                </span>
              ))}
              {(analysis.missing_keywords as string[])?.length === 0 && (
                <p className="text-gray-400 text-sm">No missing keywords identified.</p>
              )}
            </div>
          )}

          {activeTab === "formatting" && (
            <ul className="space-y-2">
              {((analysis.formatting_issues as string[]) ?? []).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
              {(analysis.formatting_issues as string[])?.length === 0 && (
                <p className="text-gray-400 text-sm">No formatting issues found. Great job!</p>
              )}
            </ul>
          )}

          {activeTab === "sections" && (
            <div className="space-y-2">
              {Object.entries((analysis.section_review as Record<string, string>) ?? {}).map(([section, review]) => (
                <Accordion key={section} title={section.charAt(0).toUpperCase() + section.slice(1)}>
                  <p>{review}</p>
                </Accordion>
              ))}
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="flex flex-wrap gap-2">
              {((analysis.recommended_job_titles as string[]) ?? []).map((title, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-full">
                  <Briefcase className="w-3 h-3" /> {title}
                </span>
              ))}
              {(analysis.recommended_job_titles as string[])?.length === 0 && (
                <p className="text-gray-400 text-sm">No job titles recommended.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-6">
        <h3 className="font-extrabold text-gray-900 mb-1">Ready to take the next step?</h3>
        <p className="text-gray-500 text-sm mb-4">Let our AI professionally rewrite your CV for maximum impact.</p>
        <button
          onClick={handleImprove}
          disabled={improving}
          className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60 flex items-center gap-2"
        >
          {improving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is rewriting your CV...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Improve My CV Professionally
            </>
          )}
        </button>
      </div>
    </div>
  );
}
