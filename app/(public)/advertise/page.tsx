"use client";

import { useState } from "react";
import { Megaphone, CheckCircle, TrendingUp, Users, Globe, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

const PLACEMENTS = [
  { value: "homepage_banner", label: "Homepage Banner", reach: "All visitors" },
  { value: "opportunity_sidebar", label: "Opportunity Sidebar", reach: "Active job/scholarship seekers" },
  { value: "detail_page", label: "Detail Page Card", reach: "High-intent viewers" },
  { value: "dashboard_card", label: "Dashboard Card", reach: "Logged-in users" },
  { value: "mobile_banner", label: "Mobile Bottom Banner", reach: "Mobile users" },
];

const BUSINESS_TYPES = ["University / Institution", "NGO / Non-Profit", "Company / Business", "Government Agency", "Individual / Personal"];

export default function AdvertisePage() {
  const [form, setForm] = useState({
    advertiser_name: "", contact_person: "", phone: "", email: "",
    business_type: "", title: "", description: "", link_url: "",
    placement: "homepage_banner", start_date: "", end_date: "", budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const submit = async () => {
    if (!form.advertiser_name || !form.email || !form.title || !form.placement) {
      toast.error("Please fill all required fields."); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setSubmitted(true); toast.success("Ad request submitted!"); }
      else toast.error(data.error || "Submission failed");
    } catch { toast.error("Something went wrong."); }
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Request Submitted!</h2>
        <p className="text-gray-500 mb-4">Our team will review your ad request and contact you within 24 hours to finalize details and payment.</p>
        <a href="/" className="inline-block bg-[#1a3c8f] text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-900">Back to Home</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Megaphone className="w-7 h-7 text-yellow-300" /></div>
          <h1 className="text-3xl font-extrabold mb-3">Advertise on StarzLink</h1>
          <p className="text-blue-200 text-lg">Reach thousands of students, professionals, and job seekers across Liberia and West Africa.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {[{ icon: <Users className="w-4 h-4" />, text: "10,000+ Monthly Users" }, { icon: <TrendingUp className="w-4 h-4" />, text: "High Engagement" }, { icon: <Globe className="w-4 h-4" />, text: "Liberia & West Africa" }].map((s, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm">{s.icon}{s.text}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Ad Placements */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ad Placements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLACEMENTS.map(p => (
              <button key={p.value} onClick={() => update("placement", p.value)}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${form.placement === p.value ? "border-[#1a3c8f] bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                <p className="font-semibold text-gray-800 text-sm">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.reach}</p>
                {form.placement === p.value && <span className="text-xs font-bold text-[#1a3c8f] mt-1 block">✓ Selected</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Advertiser Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Organization / Name *</label>
              <input value={form.advertiser_name} onChange={e => update("advertiser_name", e.target.value)} placeholder="Your organization name"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Contact Person</label>
              <input value={form.contact_person} onChange={e => update("contact_person", e.target.value)} placeholder="Your name"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email *</label>
              <input value={form.email} onChange={e => update("email", e.target.value)} type="email" placeholder="contact@org.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone / WhatsApp</label>
              <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+231 77 000 0000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Business Type</label>
            <select value={form.business_type} onChange={e => update("business_type", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30">
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Ad Title *</label>
            <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Your ad headline"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Ad Description</label>
            <textarea value={form.description} onChange={e => update("description", e.target.value)} rows={3}
              placeholder="Short description of what you're promoting..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30 resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Destination URL</label>
            <input value={form.link_url} onChange={e => update("link_url", e.target.value)} placeholder="https://yourwebsite.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => update("start_date", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">End Date</label>
              <input type="date" value={form.end_date} onChange={e => update("end_date", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Budget (USD)</label>
              <input type="number" value={form.budget} onChange={e => update("budget", e.target.value)} placeholder="50"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
            </div>
          </div>

          <button onClick={submit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 text-base mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? "Submitting..." : "Submit Ad Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
