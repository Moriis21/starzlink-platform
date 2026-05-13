"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Step = "idle" | "reading" | "extracting" | "uploading" | "analyzing" | "done" | "error";

const STEP_LABELS: Partial<Record<Step, string>> = {
  reading: "Reading your PDF…",
  extracting: "Extracting CV text…",
  uploading: "Saving to cloud…",
  analyzing: "AI is analyzing your CV…",
  done: "Analysis complete!",
};

const STEP_ORDER: Step[] = ["reading", "extracting", "uploading", "analyzing", "done"];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── PDF text extraction using PDF.js (browser-only) ───────────────────────────
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Sanity-check: is this actually a PDF?
  const magic = new Uint8Array(arrayBuffer, 0, 5);
  const header = String.fromCharCode(...magic);
  if (!header.startsWith("%PDF")) {
    throw new Error("This file does not appear to be a valid PDF. Please upload a real PDF file.");
  }

  // Dynamic import — only in browser
  const pdfjs = await import("pdfjs-dist");

  // Use a hardcoded unpkg URL for the worker (v4.4.168 confirmed on unpkg)
  pdfjs.GlobalWorkerOptions.workerSrc =
    "https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";

  let pdf: any;
  try {
    pdf = await pdfjs.getDocument({ data: arrayBuffer, verbosity: 0 }).promise;
  } catch (loadErr: any) {
    throw new Error(
      `Could not open PDF: ${loadErr?.message ?? "unknown error"}. ` +
      "Please ensure the file is not password-protected or corrupted."
    );
  }

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = (textContent.items as any[])
        .filter((item: any) => typeof item.str === "string")
        .map((item: any) => item.str)
        .join(" ");
      pageTexts.push(pageText);
      page.cleanup();
    } catch {
      // Skip pages that fail — continue with others
    }
  }

  try { await pdf.destroy(); } catch {}

  const result = pageTexts.join("\n").replace(/[ \t]{2,}/g, " ").trim();

  if (!result || result.length < 30) {
    throw new Error(
      "No readable text was found in your PDF. This usually means your CV is a scanned image. " +
      "Please re-export it as a text-based PDF from Microsoft Word or Google Docs."
    );
  }

  return result;
}

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");

  const isProcessing = !["idle", "error"].includes(step);
  const currentStepIdx = STEP_ORDER.indexOf(step);

  const handleFile = (f: File) => {
    setError("");
    setStep("idle");
    if (!f.name.toLowerCase().endsWith(".pdf") && f.type !== "application/pdf") {
      setError("Only PDF files are accepted. Please upload a .pdf file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File size must be under 5 MB. Try compressing your CV first.");
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

    // ── Step 1: read file ────────────────────────────────────────────────────
    setStep("reading");
    let extractedText = "";
    try {
      setStep("extracting");
      extractedText = await extractTextFromPDF(file);
    } catch (pdfErr: any) {
      setStep("error");
      setError(pdfErr?.message ?? "Failed to read your PDF. Please try again.");
      return;
    }

    // ── Step 2: upload PDF to InsForge storage ──────────────────────────────
    setStep("uploading");
    let fileUrl = "";
    try {
      const ts = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `cvs/${user.id}/${ts}_${safeName}`;
      const { data: sd } = await insforge.storage.from("documents").upload(path, file);
      fileUrl = (sd as any)?.url ?? "";
    } catch {
      // Storage failure is non-fatal — we still have the text
    }

    // ── Step 3: send to API for AI analysis ─────────────────────────────────
    setStep("analyzing");
    try {
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

      // Parse response — handle non-JSON server errors gracefully
      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(
          `Server returned an unexpected response (HTTP ${res.status}). Please try again.`
        );
      }

      if (!res.ok) {
        throw new Error(data?.error ?? `Analysis failed (HTTP ${res.status}). Please try again.`);
      }

      if (!data?.analysisId) {
        throw new Error("Analysis completed but result ID is missing. Please retry.");
      }

      setStep("done");
      setTimeout(() => {
        router.push(`/dashboard/career/analysis/${data.analysisId}`);
      }, 800);
    } catch (apiErr: any) {
      setStep("error");
      setError(apiErr?.message ?? "Analysis failed. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Analyze My CV</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload your CV for a comprehensive AI-powered analysis</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: upload + progress */}
        <div className="lg:col-span-2 space-y-4">
          {!isProcessing ? (
            <>
              {/* Drop zone */}
              <div
                onClick={() => !file && inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  dragOver
                    ? "border-[#1a3c8f] bg-blue-50 scale-[1.01]"
                    : file
                    ? "border-green-400 bg-green-50"
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
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7 text-green-600" />
                    </div>
                    <p className="font-bold text-green-700">{file.name}</p>
                    <p className="text-green-500 text-sm mt-1">{formatSize(file.size)} · Ready to analyze</p>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null); setError(""); }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </motion.div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-semibold text-lg">Drop your CV here</p>
                    <p className="text-gray-400 text-sm mt-1">
                      or <span className="text-[#1a3c8f] font-medium">click to browse</span>
                    </p>
                    <p className="text-gray-300 text-xs mt-3">PDF only · Max 5 MB</p>
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
                className="w-full bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Analyze My CV with AI
              </button>

              <p className="text-center text-xs text-gray-400">
                Secure · Private · Never shared
              </p>
            </>
          ) : (
            /* Processing */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-100 shadow-lg rounded-2xl p-8 text-center"
            >
              {step === "done" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220 }}>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-extrabold text-gray-900">Analysis Complete!</h3>
                  <p className="text-gray-400 text-sm mt-1">Redirecting to your results…</p>
                </motion.div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {STEP_LABELS[step] ?? "Processing…"}
                  </h3>
                  {step === "analyzing" && (
                    <p className="text-gray-400 text-sm">This takes 10–20 seconds…</p>
                  )}

                  {/* Step pills */}
                  <div className="flex flex-wrap justify-center gap-2 mt-5 mb-4">
                    {(["reading", "extracting", "uploading", "analyzing"] as Step[]).map(s => {
                      const sDone = currentStepIdx > STEP_ORDER.indexOf(s);
                      const sCurrent = step === s;
                      return (
                        <span key={s} className={`text-xs px-3 py-1 rounded-full font-medium ${
                          sDone ? "bg-green-100 text-green-700" :
                          sCurrent ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-400"
                        }`}>
                          {sDone ? "✓ " : sCurrent ? "⏳ " : ""}
                          {(STEP_LABELS[s] ?? s).replace("…", "")}
                        </span>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-1.5 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-full"
                    initial={{ width: "5%" }}
                    animate={{ width: step === "done" ? "100%" : `${(currentStepIdx + 1) * 22}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: sidebar tips */}
        <div className="bg-gradient-to-b from-white to-blue-50/30 border border-gray-100 rounded-2xl p-5 h-fit space-y-5">
          <div>
            <h3 className="font-extrabold text-gray-900 text-sm">What we analyze</h3>
            <div className="w-8 h-0.5 bg-[#1a3c8f] rounded-full mt-1.5 mb-3" />
            <ul className="space-y-2">
              {[
                "CV quality score (0–100)",
                "ATS compatibility score",
                "Grammar & language check",
                "Section-by-section review",
                "Missing keywords & skills",
                "Recommended job titles",
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="w-1.5 h-1.5 bg-[#1a3c8f] rounded-full flex-shrink-0 mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-bold text-gray-900 text-xs mb-2">⚠️ Requirements</h3>
            <ul className="space-y-1.5 text-xs text-gray-500">
              {["PDF format only", "Text-based PDF (not scanned)", "Under 5 MB", "From Word or Google Docs"].map(r => (
                <li key={r} className="flex items-start gap-1.5">
                  <span className="text-orange-400 flex-shrink-0">•</span> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">💡 Tip</p>
            <p>Open your CV in Word or Google Docs, then use <strong>File → Download / Export as PDF</strong> to create a text-based PDF.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
