"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import {
  FileText,
  Loader2,
  AlertCircle,
  BarChart2,
  CheckCircle,
  ExternalLink,
  Upload,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ToolNavBar, NextSteps } from "@/components/ui/ToolNav";
import toast from "react-hot-toast";

export default function HistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchHistory = async () => {
      try {
        // Fetch uploads with their analyses
        const { data: uploads } = await insforge.database
          .from("cv_uploads")
          .select("id, file_name, file_size, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!uploads) { setLoading(false); return; }

        // Fetch analyses for each upload
        const { data: analyses } = await insforge.database
          .from("cv_analysis")
          .select("id, upload_id, overall_score, ats_score, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        const analysesMap: Record<string, any> = {};
        (analyses ?? []).forEach((a: any) => {
          analysesMap[a.upload_id] = a;
        });

        const combined = (uploads as any[]).map(u => ({
          ...u,
          analysis: analysesMap[u.id] ?? null,
        }));

        setRecords(combined);
      } catch (err) {
        console.error("History fetch error:", err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user?.id]);

  const handleDeleteCV = async (upload: any) => {
    try {
      setDeletingId(upload.id);
      const res = await fetch("/api/career/cv/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: upload.id, userId: user?.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("CV and analysis history deleted.");
      setRecords((prev: any[]) => prev.filter((u: any) => u.id !== upload.id));
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to delete CV.");
    }
    setDeletingId(null);
  };

  const scoreColor = (s: number) =>
    s >= 70 ? "text-green-600 bg-green-100" : s >= 50 ? "text-orange-600 bg-orange-100" : "text-red-600 bg-red-100";

  const formatBytes = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb crumbs={[{ label: "Career Tools", href: "/dashboard/tools" }, { label: "AI Career Assistant", href: "/dashboard/career" }, { label: "Analysis History" }]} />
      <ToolNavBar />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-[#1a3c8f]" /> CV Analysis History
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">All your CV uploads and analysis results</p>
        </div>
        <Link
          href="/dashboard/career/upload"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm"
        >
          <Upload className="w-4 h-4" /> Upload New CV
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-16 text-center">
          <FileText className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">No CV uploads yet</h3>
          <p className="text-gray-400 text-sm mb-5">Upload your first CV to see your analysis history here</p>
          <Link
            href="/dashboard/career/upload"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
          >
            <Upload className="w-4 h-4" /> Analyze Your First CV
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl p-5"
            >
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 truncate">{record.file_name}</h3>
                    {record.status === "analyzed" ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Analyzed
                      </span>
                    ) : record.status === "failed" ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(record.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    {record.file_size ? ` · ${formatBytes(record.file_size)}` : ""}
                  </p>
                </div>

                {record.analysis && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-center">
                      <span className={`inline-block text-sm font-extrabold px-2.5 py-1 rounded-lg ${scoreColor(record.analysis.overall_score)}`}>
                        {record.analysis.overall_score}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">CV Score</p>
                    </div>
                    <div className="text-center">
                      <span className={`inline-block text-sm font-extrabold px-2.5 py-1 rounded-lg ${scoreColor(record.analysis.ats_score)}`}>
                        {record.analysis.ats_score}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">ATS Score</p>
                    </div>
                    <Link
                      href={`/dashboard/career/analysis/${record.analysis.id}`}
                      className="flex items-center gap-1.5 text-sm text-[#1a3c8f] font-semibold hover:underline"
                    >
                      View <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setConfirmDelete(record)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete CV"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {!record.analysis && record.status !== "analyzed" && (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/dashboard/career/upload"
                      className="text-sm text-gray-400 hover:text-[#1a3c8f] font-medium"
                    >
                      Re-analyze →
                    </Link>
                    <button
                      onClick={() => setConfirmDelete(record)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete CV"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <NextSteps />

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900 text-center mb-2">Delete CV?</h2>
            <p className="text-sm text-gray-500 text-center mb-1">
              <strong>{confirmDelete.file_name}</strong>
            </p>
            <p className="text-xs text-gray-400 text-center mb-5">
              This will permanently delete this CV and all its analysis history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={() => handleDeleteCV(confirmDelete)} disabled={deletingId === confirmDelete.id}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:opacity-60 text-sm">
                {deletingId === confirmDelete.id ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
