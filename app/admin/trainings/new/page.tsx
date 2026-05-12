"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trainingsApi, adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  ChevronLeft, BookOpen, Clock, MapPin, Monitor, User,
  Link2, FileText, Globe, Star, Award
} from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";

const categories = ["IT & Software", "Business", "Design", "Data Science", "Marketing", "Language", "Health & Safety", "Personal Development", "Engineering", "Finance"];
const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const modes = [
  { value: "online", label: "Online (Live)" },
  { value: "self-paced", label: "Online (Self-Paced)" },
  { value: "physical", label: "In-Person / Physical" },
  { value: "hybrid", label: "Hybrid" },
];
const certOptions = ["Certificate of Completion", "Professional Certificate", "Accredited Diploma", "No Certificate"];

export default function NewTrainingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    provider: "",
    category: "",
    duration: "",
    fee: "Free",
    mode: "online",
    level: "",
    location: "",
    start_date: "",
    description: "",
    what_you_will_learn: "",
    certificate_status: "",
    instructor: "",
    registration_link: "",
    image_url: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: created } = await trainingsApi.create(form);
      await adminApi.logAction("create", "trainings", `Created training: ${form.title}`);
      adminApi.sendAutoNotification({
        type: "training",
        title: form.title,
        description: form.description,
        organization: form.provider,
        deadline: form.start_date,
        link: `${typeof window !== "undefined" ? window.location.origin : ""}/trainings/${(created as any)?.id || ""}`,
      }).catch(() => {});
      toast.success("Training published! Notifications sent to all users.");
      router.push("/admin/trainings");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create training.");
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/trainings" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Add New Training</h1>
          <p className="text-gray-500 text-sm">Post a professional training program or course.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="font-bold text-gray-900">Training Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Training Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  placeholder="e.g. Advanced Python for Data Science"
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
                  placeholder="e.g. Coursera, AWS Academy"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => set("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Level</label>
                <select
                  value={form.level}
                  onChange={e => set("level", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white"
                >
                  <option value="">Select level</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Duration
                </label>
                <input
                  value={form.duration}
                  onChange={e => set("duration", e.target.value)}
                  placeholder="e.g. 6 Weeks, 3 Days, 40 Hours"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Fee / Price
                </label>
                <input
                  value={form.fee}
                  onChange={e => set("fee", e.target.value)}
                  placeholder="Free  or  $99  or  ₦15,000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-gray-400" /> Delivery Mode
                </label>
                <select
                  value={form.mode}
                  onChange={e => set("mode", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white"
                >
                  {modes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              {(form.mode === "physical" || form.mode === "hybrid") && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> Location / Venue
                  </label>
                  <input
                    value={form.location}
                    onChange={e => set("location", e.target.value)}
                    placeholder="e.g. Victoria Island, Lagos"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => set("start_date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" /> Instructor / Facilitator
                </label>
                <input
                  value={form.instructor}
                  onChange={e => set("instructor", e.target.value)}
                  placeholder="e.g. Dr. Amara Okonkwo"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-gray-400" /> Certificate Awarded
                </label>
                <select
                  value={form.certificate_status}
                  onChange={e => set("certificate_status", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white"
                >
                  <option value="">Select certificate type</option>
                  {certOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-900">Content & Description</h2>
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
                  placeholder="Describe what this training covers, who it's for, and why participants should enroll..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  What You Will Learn
                  <span className="ml-1 text-xs text-gray-400 font-normal">(one outcome per line)</span>
                </label>
                <textarea
                  value={form.what_you_will_learn}
                  onChange={e => set("what_you_will_learn", e.target.value)}
                  rows={5}
                  placeholder={"How to build machine learning models\nData wrangling with Pandas\nData visualization with Matplotlib\nModel deployment to production"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Registration */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="font-bold text-gray-900">Registration Link</h2>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Registration URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={form.registration_link}
                onChange={e => set("registration_link", e.target.value)}
                placeholder="https://training-platform.com/enroll"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
                required
              />
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
              folder="trainings"
              label="Cover Image"
              hint="Recommended: 1200 × 630 px · PNG or JPG"
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
                <option value="expired">Expired — Registration closed</option>
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
                <><BookOpen className="w-4 h-4" />Publish Training</>
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
          <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold text-orange-800">Best practices</p>
            </div>
            <ul className="space-y-1 text-xs text-orange-700">
              <li className="flex items-start gap-1.5"><BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Be specific about learning outcomes</li>
              <li className="flex items-start gap-1.5"><Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />State duration and time commitment</li>
              <li className="flex items-start gap-1.5"><Award className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Mention certificate details</li>
              <li className="flex items-start gap-1.5"><Monitor className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Confirm the delivery mode</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
