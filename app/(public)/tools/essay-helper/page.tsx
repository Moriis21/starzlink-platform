"use client";

import { useState, useRef } from "react";
import { Sparkles, Download, Save, RefreshCw, Sliders, FileText, ChevronDown, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import AIToolNav from "@/components/ui/AIToolNav";

const ESSAY_TYPES = [
  { value: "scholarship_essay", label: "Scholarship Essay" },
  { value: "personal_statement", label: "Personal Statement" },
  { value: "motivation_letter", label: "Motivation Letter" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "statement_of_purpose", label: "Statement of Purpose" },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "personal_warm", label: "Personal & Warm" },
  { value: "academic", label: "Academic" },
  { value: "inspiring", label: "Inspiring" },
];

export default function EssayHelperPage() {
  const { user } = useAuth();
  const [essayType, setEssayType] = useState("scholarship_essay");
  const [scholarship, setScholarship] = useState("");
  const [background, setBackground] = useState("");
  const [goals, setGoals] = useState("");
  const [tone, setTone] = useState("professional");
  const [targetWords, setTargetWords] = useState(500);
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"generate" | "improve" | "rewrite">("generate");
  const [activeTab, setActiveTab] = useState<"form" | "editor">("form");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generate = async (act: "generate" | "improve" | "rewrite") => {
    if (act !== "generate" && !essay.trim()) { toast.error("Paste your essay first to improve or rewrite it."); return; }
    if (act === "generate" && !background.trim() && !goals.trim()) { toast.error("Please fill in your background or goals."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/essay-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act, essayType, scholarship, background, goals, tone, targetWords, existingText: essay, userId: user?.id }),
      });
      const data = await res.json();
      if (data.essay) {
        setEssay(data.essay);
        setActiveTab("editor");
        toast.success(`Essay ${act === "generate" ? "generated" : act === "improve" ? "improved" : "rewritten"} — ${data.wordCount} words`);
      } else { toast.error(data.error || "Failed to generate essay"); }
    } catch { toast.error("Something went wrong. Try again."); }
    setLoading(false);
  };

  const downloadTxt = () => {
    const blob = new Blob([essay], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${essayType}_starzlink.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <AIToolNav currentLabel="Essay Helper" />
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-yellow-300" />
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Essay & Personal Statement Helper</h1>
          <p className="text-blue-200 max-w-xl mx-auto">AI-powered scholarship essay writer. Generate, improve, or rewrite your essays in seconds.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          {[{ key: "form", label: "📝 Setup" }, { key: "editor", label: "✍️ Editor" }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key ? "bg-[#1a3c8f] text-white shadow" : "text-gray-500 hover:text-gray-800"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "form" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-800">Essay Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Essay Type</label>
                <select value={essayType} onChange={e => setEssayType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30">
                  {ESSAY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Tone</label>
                <select value={tone} onChange={e => setTone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30">
                  {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Scholarship / Opportunity Name</label>
              <input type="text" value={scholarship} onChange={e => setScholarship(e.target.value)} placeholder="e.g. MEXT Scholarship Japan, Mastercard Foundation..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Your Background <span className="text-gray-400">(education, experience, achievements)</span></label>
              <textarea value={background} onChange={e => setBackground(e.target.value)} rows={4}
                placeholder="e.g. I am a final year student at the University of Liberia studying Computer Science. I have worked as a volunteer teacher for 2 years..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30 resize-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Your Goals <span className="text-gray-400">(career goals, why this opportunity)</span></label>
              <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={4}
                placeholder="e.g. I want to become a data scientist to help address food insecurity in West Africa. This scholarship will allow me to pursue a Master's degree in..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30 resize-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Target Word Count: <span className="font-bold text-[#1a3c8f]">{targetWords}</span></label>
              <input type="range" min={200} max={1200} step={50} value={targetWords} onChange={e => setTargetWords(Number(e.target.value))}
                className="w-full accent-[#1a3c8f]" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>200</span><span>700</span><span>1200</span></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={() => generate("generate")} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Generating..." : "Generate Essay"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "editor" && (
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-2">
              <button onClick={() => generate("improve")} disabled={loading}
                className="flex items-center gap-1.5 bg-blue-50 text-[#1a3c8f] font-semibold px-4 py-2 rounded-xl text-sm hover:bg-blue-100 transition-colors disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />} Improve
              </button>
              <button onClick={() => generate("rewrite")} disabled={loading}
                className="flex items-center gap-1.5 bg-purple-50 text-purple-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-purple-100 transition-colors disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Rewrite
              </button>
              <button onClick={() => generate("generate")} disabled={loading}
                className="flex items-center gap-1.5 bg-green-50 text-green-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-green-100 transition-colors disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} New Essay
              </button>
              <div className="ml-auto flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${wordCount < 200 ? "bg-red-50 text-red-600" : wordCount > targetWords + 100 ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}>
                  {wordCount} / {targetWords} words
                </span>
                <button onClick={downloadTxt} disabled={!essay}
                  className="flex items-center gap-1.5 bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:bg-gray-900 transition-colors disabled:opacity-40">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>

            {/* Essay textarea */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {!essay ? (
                <div className="text-center py-16 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Go to Setup and click <strong>Generate Essay</strong> to get started, or paste your existing essay here to improve it.</p>
                  <button onClick={() => setActiveTab("form")} className="mt-4 text-[#1a3c8f] text-sm font-semibold hover:underline">← Back to Setup</button>
                </div>
              ) : (
                <textarea ref={textareaRef} value={essay} onChange={e => setEssay(e.target.value)} rows={25}
                  className="w-full text-gray-800 text-sm leading-7 focus:outline-none resize-none font-serif"
                  placeholder="Your essay will appear here. You can also type or paste your existing essay to improve or rewrite it." />
              )}
            </div>

            {!user && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#1a3c8f] flex-shrink-0" />
                <p className="text-sm text-[#1a3c8f]">
                  <strong>Sign in</strong> to automatically save your essay drafts.{" "}
                  <a href="/login" className="underline font-semibold">Sign in</a>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">✅ Tips for a Great Essay</h3>
          <ul className="space-y-1.5 text-sm text-gray-600">
            <li>• Be specific — mention real projects, real impact, real numbers</li>
            <li>• Tell your story — why YOU, not just what you want</li>
            <li>• Show how this opportunity fits your long-term vision</li>
            <li>• Edit after generating — AI gives the draft, you add the soul</li>
            <li>• Always proofread before submitting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
