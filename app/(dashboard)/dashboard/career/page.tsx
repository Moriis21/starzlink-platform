"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import { useSubscription } from "@/hooks/useSubscription";
import {
  FileText,
  BarChart2,
  Mic,
  Mail,
  Link2,
  Crown,
  Sparkles,
  Lock,
  TrendingUp,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

function ScoreRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth="6" stroke="#e5e7eb" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth="6"
        stroke={color}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5"
    >
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </motion.div>
  );
}

export default function CareerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { sub, isPro, loading: subLoading } = useSubscription();
  const [stats, setStats] = useState({ uploads: 0, avgScore: 0, avgAts: 0 });
  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const [uploadsRes, analysisRes] = await Promise.allSettled([
          insforge.database
            .from("cv_uploads")
            .select("id, file_name, status, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          insforge.database
            .from("cv_analysis")
            .select("overall_score, ats_score, upload_id")
            .eq("user_id", user.id),
        ]);

        if (uploadsRes.status === "fulfilled" && uploadsRes.value.data) {
          setRecentUploads(uploadsRes.value.data as any[]);
          setStats(prev => ({ ...prev, uploads: (uploadsRes.value.data as any[]).length }));
        }

        if (analysisRes.status === "fulfilled" && analysisRes.value.data) {
          const analyses = analysisRes.value.data as any[];
          if (analyses.length > 0) {
            const avgScore = Math.round(analyses.reduce((s, a) => s + (a.overall_score || 0), 0) / analyses.length);
            const avgAts = Math.round(analyses.reduce((s, a) => s + (a.ats_score || 0), 0) / analyses.length);
            setStats(prev => ({ ...prev, avgScore, avgAts }));
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [user?.id]);

  const scoreColor = (s: number) => s >= 70 ? "#22c55e" : s >= 50 ? "#f97316" : "#ef4444";

  const quickActions = [
    {
      title: "Analyze My CV",
      desc: "Get AI-powered feedback and scores",
      href: "/dashboard/career/upload",
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      locked: false,
    },
    {
      title: "View Analysis",
      desc: "Review your CV history and scores",
      href: "/dashboard/career/history",
      icon: BarChart2,
      color: "bg-purple-50 text-purple-600",
      locked: false,
    },
    {
      title: "Interview Pro",
      desc: "Prepare for any job interview with AI",
      href: "/dashboard/career/interview",
      icon: Mic,
      color: "bg-green-50 text-green-600",
      locked: !isPro,
    },
    {
      title: "Application Letter",
      desc: "Generate professional cover letters",
      href: "/dashboard/career/letter",
      icon: Mail,
      color: "bg-orange-50 text-orange-600",
      locked: !isPro,
    },
    {
      title: "LinkedIn Optimizer",
      desc: "Improve your LinkedIn profile with AI",
      href: "/dashboard/career/linkedin",
      icon: Link2,
      color: "bg-sky-50 text-sky-600",
      locked: !isPro,
    },
  ];

  if (!isPro) {
    quickActions.push({
      title: "Upgrade to Pro",
      desc: "Unlock all premium career tools",
      href: "/dashboard/career/upgrade",
      icon: Crown,
      color: "bg-yellow-50 text-yellow-600",
      locked: false,
    });
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "analyzed":
        return <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Analyzed</span>;
      case "processing":
        return <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Processing</span>;
      case "failed":
        return <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><AlertCircle className="w-3 h-3" /> Failed</span>;
      default:
        return <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#1a3c8f]" />
            AI Career Assistant
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Powered by AI — your personal career advancement toolkit
          </p>
        </div>
        {isPro ? (
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-full self-start">
            <Crown className="w-4 h-4" /> Pro Member
          </span>
        ) : (
          <Link
            href="/dashboard/career/upgrade"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all self-start"
          >
            <Crown className="w-4 h-4" /> Upgrade to Pro
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="CV Uploads" value={loading ? "—" : stats.uploads} icon={Upload} color="bg-blue-50 text-blue-600" />
        <StatCard
          label="Avg CV Score"
          value={loading ? "—" : stats.avgScore ? `${stats.avgScore}%` : "N/A"}
          icon={TrendingUp}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Avg ATS Score"
          value={loading ? "—" : stats.avgAts ? `${stats.avgAts}%` : "N/A"}
          icon={BarChart2}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Current Plan"
          value={subLoading ? "—" : isPro ? "Pro" : "Free"}
          icon={Crown}
          color={isPro ? "bg-yellow-50 text-yellow-600" : "bg-gray-50 text-gray-500"}
        />
      </div>

      {/* Pro Expiry */}
      {isPro && sub?.current_period_end && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-900 text-sm">Pro Active</p>
            <p className="text-yellow-700 text-xs">
              Renews on {new Date(sub.current_period_end).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: action.locked ? 1 : 1.02 }}
            >
              <Link
                href={action.href}
                className={`relative flex items-start gap-4 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl p-5 transition-all ${
                  action.locked ? "cursor-pointer opacity-75" : "hover:shadow-xl"
                }`}
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-gray-900">{action.title}</p>
                    {action.locked && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{action.desc}</p>
                </div>
                {action.locked && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Pro
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent CV Reviews */}
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 mb-3">Recent CV Reviews</h2>
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : recentUploads.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">No CV uploads yet</p>
              <p className="text-gray-400 text-xs mt-1">Upload your first CV to get started</p>
              <Link
                href="/dashboard/career/upload"
                className="inline-block mt-4 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm"
              >
                Upload CV
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span>File</span>
                <span className="hidden sm:block">Uploaded</span>
                <span>Status</span>
                <span className="text-right">Action</span>
              </div>
              {recentUploads.map((upload) => (
                <div key={upload.id} className="grid grid-cols-4 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">{upload.file_name}</span>
                  </div>
                  <span className="hidden sm:block text-sm text-gray-500">
                    {new Date(upload.created_at).toLocaleDateString()}
                  </span>
                  <div>{getStatusBadge(upload.status)}</div>
                  <div className="text-right">
                    {upload.status === "analyzed" ? (
                      <Link
                        href={`/dashboard/career/history`}
                        className="text-xs text-[#1a3c8f] font-semibold hover:underline"
                      >
                        View →
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Free User Banner */}
      {!isPro && !subLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-2xl p-6 text-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold mb-1">Unlock the Full AI Career Suite</h3>
              <p className="text-blue-200 text-sm">
                Get Interview Pro, Application Letters, LinkedIn Optimizer, and unlimited CV reviews.
              </p>
            </div>
            <Link
              href="/dashboard/career/upgrade"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#0d1b4b] font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all text-sm"
            >
              <Crown className="w-4 h-4" /> Upgrade — from $5/mo
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
