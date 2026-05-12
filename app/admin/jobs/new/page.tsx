"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jobsApi, categoriesApi, adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", company: "", category: "", location: "", job_type: "full-time", salary: "",
    deadline: "", description: "", responsibilities: "", requirements: "",
    application_link: "", contact_email: "", status: "active", image_url: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    categoriesApi.getAll("job").then(res => {
      setCategories((res.data?.data || []).map((c: any) => c.name));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobsApi.create(form);
      await adminApi.logAction("create", "jobs", `Created job: ${form.title}`);
      toast.success("Job posted successfully!");
      router.push("/admin/jobs");
    } catch { toast.error("Failed to create job."); }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/jobs" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Add New Job</h1>
          <p className="text-gray-500 text-sm">Fill in the details to post a new job opportunity.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Job Title *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Software Engineer" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Company *</label>
                <input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Company name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Category *</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white" required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Location *</label>
                <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Lagos, Nigeria" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Job Type</label>
                <select value={form.job_type} onChange={e => set("job_type", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white">
                  {["full-time", "part-time", "contract", "internship", "remote"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Salary (Optional)</label>
                <input value={form.salary} onChange={e => set("salary", e.target.value)} placeholder="e.g. $50,000 - $70,000" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Application Deadline *</label>
                <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Description *</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} placeholder="Describe the job role and organization..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Responsibilities (one per line)</label>
                <textarea value={form.responsibilities} onChange={e => set("responsibilities", e.target.value)} rows={4} placeholder="List the job responsibilities..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Requirements (one per line)</label>
                <textarea value={form.requirements} onChange={e => set("requirements", e.target.value)} rows={4} placeholder="List the job requirements..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Application Link *</label>
                  <input type="url" value={form.application_link} onChange={e => set("application_link", e.target.value)} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Contact Email</label>
                  <input type="email" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} placeholder="hr@company.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Publish Settings</h3>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                <option value="draft">Save as Draft</option>
                <option value="active">Publish (Active)</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 mb-2">
              {loading ? "Publishing..." : form.status === "draft" ? "Save Draft" : "Publish Job"}
            </button>
            <button type="button" onClick={() => router.back()} className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 text-sm">
              Cancel
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <ImageUploader
              value={form.image_url}
              onChange={url => set("image_url", url)}
              folder="jobs"
              label="Job / Company Image"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
