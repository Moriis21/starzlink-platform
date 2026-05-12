"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scholarshipsApi, adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronLeft, GraduationCap, Link2, FileText, Star, Globe, BookOpen } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";

const studyLevels = ["Undergraduate", "Postgraduate", "Masters", "PhD", "Professional", "Short Course"];
const fundingTypes = [
  { value: "fully-funded", label: "Fully Funded" },
  { value: "partial", label: "Partial Funding" },
  { value: "tuition-only", label: "Tuition Only" },
  { value: "stipend", label: "Stipend" },
];

export default function NewScholarshipPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    provider: "",
    country: "",
    study_level: "",
    funding_type: "fully-funded",
    deadline: "",
    description: "",
    benefits: "",
    eligibility: "",
    required_documents: "",
    application_link: "",
    image_url: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.deadline) { toast.error("Application deadline is required."); return; }
    setLoading(true);
    try {
      await scholarshipsApi.create(form);
      await adminApi.logAction("create", "scholarships", `Created scholarship: ${form.title}`);
      toast.success("Scholarship published successfully!");
      router.push("/admin/scholarships");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create scholarship.");
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/scholarships"
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Add New Scholarship</h1>
          <p className="text-gray-500 text-sm">Post a scholarship opportunity for students.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="font-bold text-gray-900">Basic Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Scholarship Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  placeholder="e.g. Future Leaders Scholarship 2026"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Provider / Organization <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.provider}
                  onChange={e => set("provider", e.target.value)}
                  placeholder="e.g. Mastercard Foundation"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.country}
                  onChange={e => set("country", e.target.value)}
                  placeholder="e.g. United States"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Study Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.study_level}
                  onChange={e => set("study_level", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white transition-colors"
                  required
                >
                  <option value="">Select study level</option>
                  {studyLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Funding Type</label>
                <select
                  value={form.funding_type}
                  onChange={e => set("funding_type", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white transition-colors"
                >
                  {fundingTypes.map(ft => (
                    <option key={ft.value} value={ft.value}>{ft.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Application Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => set("deadline", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-900">Scholarship Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  rows={5}
                  placeholder="Provide a clear description of this scholarship opportunity..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 resize-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Benefits
                  <span className="ml-1 text-xs text-gray-400 font-normal">(one per line)</span>
                </label>
                <textarea
                  value={form.benefits}
                  onChange={e => set("benefits", e.target.value)}
                  rows={4}
                  placeholder={"Full tuition coverage\nMonthly living stipend\nHealth insurance\nRound-trip airfare"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Eligibility Criteria
                  <span className="ml-1 text-xs text-gray-400 font-normal">(one per line)</span>
                </label>
                <textarea
                  value={form.eligibility}
                  onChange={e => set("eligibility", e.target.value)}
                  rows={4}
                  placeholder={"Must be a citizen of an African country\nMinimum GPA of 3.5\nAge 18–30\nFluent in English"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none transition-colors font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Required Documents
                  <span className="ml-1 text-xs text-gray-400 font-normal">(one per line)</span>
                </label>
                <textarea
                  value={form.required_documents}
                  onChange={e => set("required_documents", e.target.value)}
                  rows={4}
                  placeholder={"Academic transcripts\nTwo reference letters\nPersonal statement\nValid passport copy"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Application Link */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="font-bold text-gray-900">Application Link</h2>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Official Application URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={form.application_link}
                onChange={e => set("application_link", e.target.value)}
                placeholder="https://scholarship.org/apply"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
                required
              />
              <p className="text-xs text-gray-400 mt-1.5">Applicants will be directed to this link to apply.</p>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Image Upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <ImageUploader
              value={form.image_url}
              onChange={url => set("image_url", url)}
              folder="scholarships"
              label="Cover Image"
              hint="Recommended: 1200 × 630 px · PNG or JPG"
            />
          </div>

          {/* Publish Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-gray-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Publish Settings</h3>
            </div>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white"
              >
                <option value="active">Active — Visible to everyone</option>
                <option value="draft">Draft — Hidden from public</option>
                <option value="expired">Expired — Closed</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 mb-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Publish Scholarship
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">Tips for a great listing</p>
            </div>
            <ul className="space-y-1 text-xs text-blue-700">
              <li className="flex items-start gap-1.5"><BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Use a clear, descriptive title</li>
              <li className="flex items-start gap-1.5"><BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />List all benefits clearly</li>
              <li className="flex items-start gap-1.5"><BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Add a high-quality cover image</li>
              <li className="flex items-start gap-1.5"><BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Double-check the deadline date</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
