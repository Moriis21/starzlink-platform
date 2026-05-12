"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { campusApi, adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronLeft, Loader2, Save, Trash2, Megaphone, Building2, Calendar, Tag } from "lucide-react";
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

export default function EditCampusUpdatePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;
    campusApi.getOne(id).then(res => {
      const data = res.data?.data || res.data;
      if (!data) { toast.error("Not found"); router.push("/admin/campus-updates"); return; }
      setForm(data);
      setFetching(false);
    }).catch(() => { toast.error("Failed to load."); router.push("/admin/campus-updates"); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await campusApi.update(id, form);
      await adminApi.logAction("update", "campus_updates", `Updated: ${form.title}`);
      toast.success("Campus update saved!");
      router.push("/admin/campus-updates");
    } catch { toast.error("Failed to update."); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${form?.title}"? This cannot be undone.`)) return;
    try { await campusApi.delete(id); toast.success("Deleted."); router.push("/admin/campus-updates"); }
    catch { toast.error("Delete failed."); }
  };

  if (fetching) return <div className="p-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /><div className="h-64 bg-gray-100 rounded" /></div>;
  if (!form) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/campus-updates" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Edit Campus Update</h1>
            <p className="text-gray-500 text-sm truncate max-w-md">{form.title}</p>
          </div>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 text-sm font-medium">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Update Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><Megaphone className="w-4 h-4 text-green-600" /></div>
              <h2 className="font-bold text-gray-900">Update Details</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Title <span className="text-red-500">*</span></label>
                <input value={form.title || ""} onChange={e => set("title", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-gray-400" /> Institution <span className="text-red-500">*</span></label>
                <input value={form.institution || ""} onChange={e => set("institution", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-gray-400" /> Category</label>
                <select value={form.category || "news"} onChange={e => set("category", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> Date <span className="text-red-500">*</span></label>
                <input type="date" value={form.date ? form.date.split("T")[0] : ""} onChange={e => set("date", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Content</h2>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Description <span className="text-red-500">*</span></label>
              <textarea
                value={form.description || ""}
                onChange={e => set("description", e.target.value)}
                rows={12}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none leading-relaxed"
                required
              />
              <p className="text-xs text-gray-400 mt-1.5">{(form.description || "").length} characters</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <ImageUploader value={form.image_url || ""} onChange={url => set("image_url", url)} folder="campus" label="Featured Image" hint="Optional · PNG or JPG · Max 5 MB" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Publish Settings</h3>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Status</label>
              <select value={form.status || "active"} onChange={e => set("status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                <option value="active">Active — Visible</option>
                <option value="expired">Archived</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60 mb-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
            <Link href="/admin/campus-updates" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
