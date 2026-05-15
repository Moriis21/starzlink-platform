"use client";

import { useState } from "react";
import { CheckCircle, Star, Shield, Clock, Upload, Send, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const PACKAGES = [
  { id: "basic_review", label: "Basic Review", price: "$15", duration: "2–3 days", features: ["Application document review", "Grammar & clarity check", "1 round of feedback", "Written report"] },
  { id: "essay_improvement", label: "Essay Improvement", price: "$25", duration: "3–5 days", features: ["Full essay rewrite/improvement", "Tone and impact analysis", "2 rounds of feedback", "Professional polish"] },
  { id: "full_support", label: "Full Application Support", price: "$50", duration: "5–7 days", features: ["Complete application assistance", "Essay writing + review", "Document checklist", "3 rounds of feedback", "Submission guidance"] },
  { id: "interview_prep", label: "Interview Preparation", price: "$35", duration: "2–3 days", features: ["Mock interview session (30 min)", "Common scholarship questions", "Feedback & coaching", "Confidence-building tips"] },
];

export default function ScholarshipAssistancePage() {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState("basic_review");
  const [form, setForm] = useState({ full_name: user?.full_name || "", email: user?.email || "", phone: "", scholarship_name: "", scholarship_url: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const submit = async () => {
    if (!form.full_name || !form.email || !form.scholarship_name) { toast.error("Please fill all required fields."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/scholarship-assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user?.id, package: selectedPackage }),
      });
      const data = await res.json();
      if (data.success) { setSubmitted(true); toast.success("Request submitted! We'll contact you within 24 hours."); }
      else toast.error(data.error || "Submission failed");
    } catch { toast.error("Something went wrong. Try again."); }
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Request Submitted!</h2>
        <p className="text-gray-500 mb-6">Our expert team will review your request and contact you within 24 hours to confirm payment and assignment details.</p>
        <div className="bg-blue-50 rounded-2xl p-4 text-sm text-[#1a3c8f] mb-6">
          📧 Check your email at <strong>{form.email}</strong> for confirmation.
        </div>
        <a href="/dashboard" className="inline-block bg-[#1a3c8f] text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-900">Go to Dashboard</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Star className="w-7 h-7 text-yellow-300" /></div>
          <h1 className="text-3xl font-extrabold mb-3">Scholarship Application Assistance</h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">Get 1-on-1 expert help with your scholarship application. Real experts, real results.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
            {[{ icon: <Shield className="w-4 h-4" />, text: "Verified Experts" }, { icon: <Clock className="w-4 h-4" />, text: "Fast Turnaround" }, { icon: <CheckCircle className="w-4 h-4" />, text: "Satisfaction Guarantee" }].map((b, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">{b.icon}{b.text}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Packages */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Choose a Package</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PACKAGES.map(pkg => (
            <button key={pkg.id} onClick={() => setSelectedPackage(pkg.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${selectedPackage === pkg.id ? "border-[#1a3c8f] bg-blue-50 shadow-md" : "border-gray-100 bg-white hover:border-gray-200"}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-base">{pkg.label}</h3>
                <div className="text-right"><span className="text-[#1a3c8f] font-extrabold text-lg">{pkg.price}</span><p className="text-xs text-gray-400">{pkg.duration}</p></div>
              </div>
              <ul className="space-y-1">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-sm text-gray-600"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
              {selectedPackage === pkg.id && <div className="mt-3 text-xs font-bold text-[#1a3c8f]">✓ Selected</div>}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name *</label>
              <input value={form.full_name} onChange={e => update("full_name", e.target.value)} placeholder="Your full name"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address *</label>
              <input value={form.email} onChange={e => update("email", e.target.value)} type="email" placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone / WhatsApp</label>
            <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+231 77 000 0000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Scholarship / Opportunity Name *</label>
            <input value={form.scholarship_name} onChange={e => update("scholarship_name", e.target.value)} placeholder="e.g. MEXT Scholarship 2026"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Scholarship URL (optional)</label>
            <input value={form.scholarship_url} onChange={e => update("scholarship_url", e.target.value)} placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Additional Notes</label>
            <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3}
              placeholder="Tell us anything important — deadline, specific requirements, what you need help with..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30 resize-none" />
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Payment:</strong> After submitting, our team will contact you via WhatsApp/email with payment instructions. We accept MTN Money, Orange Money, and bank transfer.
            </div>
          </div>

          <button onClick={submit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 text-base">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? "Submitting..." : `Submit Request — ${PACKAGES.find(p => p.id === selectedPackage)?.price}`}
          </button>
        </div>
      </div>
    </div>
  );
}
