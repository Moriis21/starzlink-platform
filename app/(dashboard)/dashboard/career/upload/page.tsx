"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Step = "idle" | "reading" | "extracting" | "uploading" | "analyzing" | "done" | "error";

const STEP_LABELS: Record<Step, string> = {
  idle: "",
  reading: "Reading your PDF...",
  extracting: "Extracting text from CV...",
  uploading: "Saving to cloud...",
  analyzing: "AI is analyzing your CV...",
  done: "Analysis complete!",
  error: "Something went wrong",
};

const PROGRESS_MAP: Record<Step, number> = {
  idle: 0, reading: 15, extracting: 35, uploading: 55, analyzing: 80, done: 100, error: 0,
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Client-side PDF text extraction using PDF.js ──────────────────────────────
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Dynamically import pdfjs-dist (browser only)
  const pdfjs = await import("pdfjs-dist");

  // Use CDN worker to avoid bundling issues
  (pdfjs as any).GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = (textContent.items as any[])
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
}

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");

  const progress = PROGRESS_MAP[step];
  const isProcessing = !["idle", "error"].includes(step);

  const handleFile = (f: File) => {
    setError("");
    setStep("idle");
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted. Please upload a .pdf file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB. Please compress or reduce your CV size.");
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!file || !user?.id) return;
    setError("");

    try {
      // Step 1: Read & extract text in the browser
      setStep("reading");
      await new Promise(r => setTimeout(r, 300));

      setStep("extracting");
      let extractedText = "";
      try {
        extractedText = await extractTextFromPDF(file);
      } catch (pdfErr: any) {
        console.error("PDF extraction error:", pdfErr);
        throw new Error(
          "Could not read text from this PDF. Make sure it is a text-based PDF (not a scanned image). Try re-saving your CV as PDF from Word or Google Docs."
        );
      }

      if (!extractedText || extractedText.length < 50) {
        throw new Error(
          "Your CV appears to be a scanned image or contains no readable text. Please export your CV as a proper text-based PDF from Microsoft Word or Google Docs."
        );
      }

      // Step 2: Upload raw PDF file to InsForge storage (best-effort)
      setStep("uploading");
      let fileUrl = "";
      try {
        const timestamp = Date.now();
        const path = `cvs/${user.id}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { data: storageData } = await insforge.storage
          .from("documents")
          .upload(path, file);
        fileUrl = (storageData as any)?.url ?? "";
      } catch (storageErr) {
        console.warn("Storage upload failed (non-fatal):", storageErr);
        // Continue — file storage is optional, analysis still works
      }

      // Step 3: Send extracted text + metadata to API for analysis
      setStep("analyzing");
      const res = await fetch("/api/career/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedText,
          fileName: file.name,
          fileSize: file.size,
          fileUrl,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI analysis failed. Please try again.");
      }

      setStep("done");
      await new Promise(r => setTimeout(r, 800));
      router.push(`/dashboard/career/analysis/${data.analysisId}`);
    } catch (err: any) {
      setStep("error");
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Analyze My CV</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload your CV for a comprehensive AI-powered analysis</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload zone */}
        <div className="lg:col-span-2 space-y-4">
          {!isProcessing ? (
            <>
              {/* Drop zone */}
              <div
                onClick={() => !file && inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  dragOver
                    ? "border-[#1a3c8f] bg-blue-50 scale-[1.01]"
                    : file
                    ? "border-green-400 bg-green-50 cursor-default"
                    : "border-gray-300 hover:border-[#1a3c8f] hover:bg-blue-50/40 cursor-pointer"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {file ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="font-bold text-green-700 text-base">{file.name}</p>
                    <p className="text-green-500 text-sm mt-1">{formatSize(file.size)} · Ready to analyze</p>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null); setError(""); }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Remove file
                    </button>
                  </motion.div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-semibold text-lg">Drop your CV here</p>
                    <p className="text-gray-400 text-sm mt-1">or <span className="text-[#1a3c8f] font-medium">click to browse</span></p>
                    <p className="text-gray-300 text-xs mt-3">PDF only · Max 5 MB · Text-based PDFs only</p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!file}
                className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                <FileText className="w-5 h-5" />
                Analyze My CV with AI
              </button>

              <p className="text-center text-xs text-gray-400">
                Your CV is processed securely. We never share your information.
              </p>
            </>
          ) : (
            /* Processing state */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-100 shadow-xl rounded-2xl p-8 text-center"
            >
              {step === "done" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220 }}>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-extrabold text-gray-900">Analysis Complete!</h3>
                  <p className="text-gray-400 text-sm mt-1">Redirecting to your results...</p>
                </motion.div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {STEP_LABELS[step]}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {step === "analyzing" ? "This takes about 10–20 seconds..." : "Please wait..."}
                  </p>

                  {/* Step pills */}
                  <div className="flex justify-center gap-2 mt-5 mb-6 flex-wrap">
                    {(["reading", "extracting", "uploading", "analyzing"] as Step[]).map((s, i) => {
                      const stepOrder: Record<Step, number> = { idle: 0, reading: 1, extracting: 2, uploading: 3, analyzing: 4, done: 5, error: 0 };
                      const isDone = stepOrder[step] > stepOrder[s];
                      const isCurrent = step === s;
                      return (
                        <span key={s} className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                          isDone ? "bg-green-100 text-green-700" :
                          isCurrent ? "bg-[#1a3c8f] text-white" :
                          "bg-gray-100 text-gray-400"
                        }`}>
                          {isDone ? "✓ " : isCurrent ? "⏳ " : ""}{STEP_LABELS[s].replace("...", "")}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Progress</span><span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Tips sidebar */}
        <div className="bg-gradient-to-b from-white to-blue-50/30 border border-gray-100 shadow-sm rounded-2xl p-5 h-fit space-y-4">
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm">What we analyze</h3>
            <div className="w-8 h-0.5 bg-[#1a3c8f] rounded-full mt-1.5 mb-3" />
            <ul className="space-y-2">
              {["Overall CV quality score (0-100)", "ATS compatibility score", "Grammar & language quality", "Section-by-section review", "Missing keywords & skills", "Career path recommendations"].map(item => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#1a3c8f] rounded-full flex-shrink-0 mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-extrabold text-gray-900 text-sm mb-1.5">⚠️ Requirements</h3>
            <ul className="space-y-1.5">
              {[
                "PDF format only",
                "Text-based PDF (not scanned)",
                "Maximum 5MB file size",
                "Exported from Word/Google Docs"
              ].map(r => (
                <li key={r} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-orange-400 flex-shrink-0">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
