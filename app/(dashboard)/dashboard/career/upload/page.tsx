"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "idle" | "uploading" | "extracting" | "analyzing" | "done" | "error";

const STEPS: { key: Step; label: string }[] = [
  { key: "uploading", label: "Uploading PDF..." },
  { key: "extracting", label: "Extracting text..." },
  { key: "analyzing", label: "AI analyzing your CV..." },
  { key: "done", label: "Finalizing results..." },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFile = (f: File) => {
    setError("");
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const handleSubmit = async () => {
    if (!file || !user?.id) return;

    setError("");
    setStep("uploading");
    setProgress(10);

    // Simulate progress
    const tick = setInterval(() => {
      setProgress(prev => {
        if (prev >= 60) { clearInterval(tick); return 60; }
        return prev + 10;
      });
    }, 300);

    try {
      setTimeout(() => setStep("extracting"), 800);
      setTimeout(() => { setStep("analyzing"); setProgress(70); }, 1800);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.id);

      const res = await fetch("/api/career/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(tick);

      if (!res.ok) {
        const { error: apiError } = await res.json();
        throw new Error(apiError || "Analysis failed");
      }

      setProgress(90);
      setStep("done");

      const { analysisId } = await res.json();

      setTimeout(() => {
        setProgress(100);
        router.push(`/dashboard/career/analysis/${analysisId}`);
      }, 800);
    } catch (err: any) {
      clearInterval(tick);
      setStep("error");
      setProgress(0);
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Analyze My CV</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload your CV for a comprehensive AI-powered analysis</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-4">
          {step === "idle" || step === "error" ? (
            <>
              <div
                onClick={() => inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-[#1a3c8f] bg-blue-50"
                    : file
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-[#1a3c8f] hover:bg-blue-50/50"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {file ? (
                  <div>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="font-bold text-green-700 text-lg">{file.name}</p>
                    <p className="text-green-600 text-sm">{formatSize(file.size)}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setError(""); }}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold text-lg">Drop your CV here or click to browse</p>
                    <p className="text-gray-400 text-sm mt-1">PDF files only · Max 5MB</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!file}
                className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Loader2 className={`w-4 h-4 ${!file ? "hidden" : "hidden"}`} />
                Analyze My CV
              </button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-8 text-center"
            >
              {step === "done" ? (
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-extrabold text-gray-900">Analysis Complete!</h3>
                  <p className="text-gray-500 text-sm mt-1">Redirecting to your results...</p>
                </div>
              ) : (
                <div>
                  <Loader2 className="w-12 h-12 text-[#1a3c8f] mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {STEPS.find(s => s.key === step)?.label ?? "Processing..."}
                  </h3>

                  {/* Step indicators */}
                  <div className="flex justify-center gap-2 mt-4 mb-6">
                    {STEPS.map((s, i) => (
                      <div
                        key={s.key}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i <= currentStepIndex ? "bg-[#1a3c8f] w-8" : "bg-gray-200 w-4"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tips Sidebar */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl p-5 h-fit">
          <h3 className="font-extrabold text-gray-900 mb-1">What makes a great CV?</h3>
          <div className="w-8 h-1 bg-[#1a3c8f] rounded-full mb-4" />
          <ul className="space-y-3">
            {[
              { tip: "Use strong action verbs", detail: "Started with 'Led', 'Built', 'Increased' instead of passive language" },
              { tip: "Quantify achievements", detail: "Include numbers: 'Increased sales by 40%' not 'Improved sales'" },
              { tip: "Match job keywords", detail: "Mirror language from the job description for ATS compatibility" },
              { tip: "Keep it concise", detail: "1-2 pages max. Hiring managers spend ~7 seconds on first review" },
              { tip: "Professional formatting", detail: "Clean sections, consistent fonts, adequate white space" },
            ].map(({ tip, detail }) => (
              <li key={tip} className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-[#1a3c8f] rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{tip}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
