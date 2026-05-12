"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { jobsApi, categoriesApi, adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const set = (key: string, val: string) => setForm((f: any) => ({ ...f, [key]: val }));

  useEffect(() => {
    Promise.all([
      jobsApi.getOne(id as string),
      categoriesApi.getAll("job"),
    ]).then(([job, cats]) => {
      setForm(job.data?.data || job.data);
      setCategories((cats.data?.data || []).map((c: any) => c.name));
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobsApi.update(id as string, form);
      await adminApi.logAction("update", "jobs", `Updated job: ${form.title}`);
      toast.success("Job updated successfully!");
      router.push("/admin/jobs");
    } catch { toast.error("Failed to update."); }
    setLoading(false);
  };

  if (fetching) return <div className="p-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /><div className="h-64 bg-gray-100 rounded" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/jobs" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Edit Job</h1>
          <p className="text-gray-500 text-sm">{form?.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1.5">Job Title *</label><input value={form?.title || ""} onChange={e => set("title", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Company *</label><input value={form?.company || ""} onChange={e => set("company", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label><select value={form?.category || ""} onChange={e => set("category", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white"><option value="">Select</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Location</label><input value={form?.location || ""} onChange={e => set("location", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Job Type</label><select value={form?.job_type || "full-time"} onChange={e => set("job_type", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">{["full-time","part-time","contract","internship","remote"].map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Salary</label><input value={form?.salary || ""} onChange={e => set("salary", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Deadline</label><input type="date" value={form?.deadline?.substring(0, 10) || ""} onChange={e => set("deadline", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" /></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Content</h2>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label><textarea value={form?.description || ""} onChange={e => set("description", e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Responsibilities</label><textarea value={form?.responsibilities || ""} onChange={e => set("responsibilities", e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Requirements</label><textarea value={form?.requirements || ""} onChange={e => set("requirements", e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Application Link</label><input type="url" value={form?.application_link || ""} onChange={e => set("application_link", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" /></div>
                <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Contact Email</label><input type="email" value={form?.contact_email || ""} onChange={e => set("contact_email", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Publish</h3>
            <div className="mb-4"><label className="text-sm font-medium text-gray-700 block mb-1.5">Status</label><select value={form?.status || "draft"} onChange={e => set("status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none"><option value="draft">Draft</option><option value="active">Active</option><option value="expired">Expired</option></select></div>
            <button type="submit" disabled={loading} className="w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60 mb-2">{loading ? "Saving..." : "Save Changes"}</button>
            <button type="button" onClick={() => router.back()} className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm">Cancel</button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <ImageUploader value={form?.image_url || ""} onChange={url => set("image_url", url)} folder="jobs" label="Job Image" />
          </div>
        </div>
      </form>
    </div>
  );
}
