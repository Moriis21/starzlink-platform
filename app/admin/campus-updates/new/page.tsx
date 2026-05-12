"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { campusApi, adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronLeft, Megaphone, Building2, Calendar, FileText, Globe, Tag, Star, Info } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";

const categories = [
  { value: "news", label: "News" },
  { value: "events", label: "Event" },
  { value: "announcements", label: "Announcement" },
  { value: "scholarships", label: "Scholarship Alert" },
  { value: "exams", label: "Exam Notice" },
  { value: "results", label: "Results Notice" },
];

export default function NewCampusUpdatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    institution: "",
    category: "news",
    date: "",
    description: "",
    image_url: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await campusApi.create(form);
      await adminApi.logAction("create", "campus_updates", `Created update: ${form.title}`);
      toast.success("Campus update published!");
      router.push("/admin/campus-updates");
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish update.");
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/campus-updates" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Post Campus Update</h1>
          <p className="text-gray-500 text-sm">Share news, events, and announcements from institutions.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Core Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="font-bold text-gray-900">Update Details</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  placeholder="e.g. Annual Career Fair 2026 Announced"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  Institution <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.institution}
                  onChange={e => set("institution", e.target.value)}
                  placeholder="e.g. University of Lagos"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-gray-400" /> Category
                </label>
                <select
                  value={form.category}
                  onChange={e => set("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set("date", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-900">Content</h2>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Full Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                rows={10}
                placeholder="Write the full content of this update. Include all relevant details, dates, requirements, and instructions for students..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 resize-none transition-colors leading-relaxed"
                required
              />
              <p className="text-xs text-gray-400 mt-1.5">
                {form.description.length} characters · Minimum 50 recommended
              </p>
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
              folder="campus"
              label="Featured Image"
              hint="Optional · PNG or JPG · Max 5 MB"
            />
          </div>

          {/* Publish */}
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
                <option value="expired">Archived</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 mb-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Publishing…</>
              ) : (
                <><Megaphone className="w-4 h-4" />Post Update</>
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

          {/* Info */}
          <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="w-4 h-4 text-green-600" />
              <p className="text-sm font-semibold text-green-800">Category guide</p>
            </div>
            <ul className="space-y-1.5 text-xs text-green-700">
              {categories.map(c => (
                <li key={c.value} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  <strong>{c.label}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
