"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { scholarshipsApi, adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronLeft, Loader2, Save, Trash2, GraduationCap } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";

const studyLevels = ["Undergraduate", "Postgraduate", "Masters", "PhD", "Professional", "Short Course"];
const fundingTypes = [
  { value: "fully-funded", label: "Fully Funded" },
  { value: "partial", label: "Partial Funding" },
  { value: "tuition-only", label: "Tuition Only" },
  { value: "stipend", label: "Stipend" },
];

export default function EditScholarshipPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;
    scholarshipsApi.getOne(id).then(res => {
      const data = res.data?.data || res.data;
      if (!data) { toast.error("Not found"); router.push("/admin/scholarships"); return; }
      setForm(data);
      setFetching(false);
    }).catch(() => { toast.error("Failed to load."); router.push("/admin/scholarships"); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await scholarshipsApi.update(id, form);
      await adminApi.logAction("update", "scholarships", `Updated: ${form.title}`);
      toast.success("Scholarship updated!");
      router.push("/admin/scholarships");
    } catch { toast.error("Failed to update."); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${form?.title}"? This cannot be undone.`)) return;
    try {
      await scholarshipsApi.delete(id);
      toast.success("Deleted.");
      router.push("/admin/scholarships");
    } catch { toast.error("Delete failed."); }
  };

  if (fetching) return <div className="p-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /><div className="h-64 bg-gray-100 rounded" /></div>;
  if (!form) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/scholarships" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Edit Scholarship</h1>
            <p className="text-gray-500 text-sm truncate max-w-md">{form.title}</p>
          </div>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><GraduationCap className="w-4 h-4 text-purple-600" /></div>
              <h2 className="font-bold text-gray-900">Basic Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Title <span className="text-red-500">*</span></label>
                <input value={form.title || ""} onChange={e => set("title", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Provider <span className="text-red-500">*</span></label>
                <input value={form.provider || ""} onChange={e => set("provider", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Country <span className="text-red-500">*</span></label>
                <input value={form.country || ""} onChange={e => set("country", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Study Level</label>
                <select value={form.study_level || ""} onChange={e => set("study_level", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  <option value="">Select level</option>
                  {studyLevels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Funding Type</label>
                <select value={form.funding_type || "fully-funded"} onChange={e => set("funding_type", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  {fundingTypes.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Application Deadline <span className="text-red-500">*</span></label>
                <input type="date" value={form.deadline ? form.deadline.split("T")[0] : ""} onChange={e => set("deadline", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Benefits <span className="text-gray-400 font-normal text-xs">(one per line)</span></label>
                <textarea value={form.benefits || ""} onChange={e => set("benefits", e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none font-mono" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Eligibility <span className="text-gray-400 font-normal text-xs">(one per line)</span></label>
                <textarea value={form.eligibility || ""} onChange={e => set("eligibility", e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none font-mono" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Required Documents <span className="text-gray-400 font-normal text-xs">(one per line)</span></label>
                <textarea value={form.required_documents || ""} onChange={e => set("required_documents", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none font-mono" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Application Link <span className="text-red-500">*</span></label>
                <input type="url" value={form.application_link || ""} onChange={e => set("application_link", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <ImageUploader value={form.image_url || ""} onChange={url => set("image_url", url)} folder="scholarships" label="Cover Image" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Publish Settings</h3>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Status</label>
              <select value={form.status || "active"} onChange={e => set("status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                <option value="active">Active — Visible</option>
                <option value="expired">Expired — Hidden</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60 mb-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
            <Link href="/admin/scholarships" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
