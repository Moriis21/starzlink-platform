"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { opportunitiesApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";

const TYPES = ["internship", "grant", "competition", "volunteer", "study_abroad", "research"];
const CATEGORIES = ["Technology", "Health", "Education", "Environment", "Arts", "Business", "Social Sciences", "Engineering", "Agriculture", "Law", "Other"];

const TYPE_SPECIFIC_FIELDS: Record<string, { key: string; label: string; placeholder?: string }[]> = {
  internship: [{ key: "duration", label: "Duration", placeholder: "e.g. 3 months" }, { key: "stipend", label: "Stipend", placeholder: "e.g. $500/month" }],
  grant: [{ key: "amount", label: "Grant Amount", placeholder: "e.g. $10,000" }],
  competition: [{ key: "prize", label: "Prize", placeholder: "e.g. $5,000 + Trophy" }, { key: "team_size", label: "Team Size", placeholder: "e.g. 1-3 members" }],
  volunteer: [{ key: "commitment_hours", label: "Weekly Hours", placeholder: "e.g. 10" }, { key: "duration", label: "Duration", placeholder: "e.g. 6 weeks" }],
  study_abroad: [{ key: "destination_country", label: "Destination Country", placeholder: "e.g. United States" }, { key: "duration", label: "Program Duration", placeholder: "e.g. 1 semester" }, { key: "amount", label: "Funding", placeholder: "e.g. Full scholarship" }],
  research: [{ key: "research_field", label: "Research Field", placeholder: "e.g. Biomedical Engineering" }, { key: "duration", label: "Duration", placeholder: "e.g. 12 months" }, { key: "stipend", label: "Stipend", placeholder: "e.g. $1,500/month" }],
};

export default function EditOpportunityPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    opportunitiesApi.getOne(id as string).then(res => {
      const d = res.data?.data;
      if (d) setForm(d);
      setFetching(false);
    });
  }, [id]);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form };
    Object.keys(payload).forEach(k => { if (payload[k] === "") payload[k] = null; });
    const { error } = await opportunitiesApi.update(id as string, payload);
    if (error) { toast.error("Failed to update"); setLoading(false); return; }
    toast.success("Updated successfully!");
    router.push("/admin/opportunities");
    setLoading(false);
  };

  if (fetching) return <div className="animate-pulse p-8"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>;

  const typeFields = TYPE_SPECIFIC_FIELDS[form.opportunity_type] ?? [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/opportunities" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Edit Opportunity</h1>
          <p className="text-gray-500 text-sm truncate max-w-xs">{form.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Opportunity Type</h2>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => (
                <button key={t} type="button" onClick={() => set("opportunity_type", t)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors border ${form.opportunity_type === t ? "bg-[#1a3c8f] text-white border-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:border-[#1a3c8f]"}`}>
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Title *</label>
                <input value={form.title ?? ""} onChange={e => set("title", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Organizer *</label>
                <input value={form.organizer ?? ""} onChange={e => set("organizer", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
                <select value={form.category ?? ""} onChange={e => set("category", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Location</label>
                <input value={form.location ?? ""} onChange={e => set("location", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Deadline</label>
                <input type="date" value={form.deadline?.slice(0, 10) ?? ""} onChange={e => set("deadline", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Application Link</label>
                <input type="url" value={form.application_link ?? ""} onChange={e => set("application_link", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_remote" checked={form.is_remote ?? false} onChange={e => set("is_remote", e.target.checked)} className="w-4 h-4 accent-[#1a3c8f]" />
                <label htmlFor="is_remote" className="text-sm text-gray-700">Remote / Online</label>
              </div>
            </div>
          </div>

          {typeFields.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4">Type-Specific Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {typeFields.map(f => (
                  <div key={f.key}>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">{f.label}</label>
                    <input value={form[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Description *</label>
                <textarea value={form.description ?? ""} onChange={e => set("description", e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Eligibility</label>
                <textarea value={form.eligibility ?? ""} onChange={e => set("eligibility", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Benefits</label>
                <textarea value={form.benefits ?? ""} onChange={e => set("benefits", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Publish Settings</h3>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
              <select value={form.status ?? "active"} onChange={e => set("status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="mb-4">
              <ImageUploader
                value={form.image_url ?? ""}
                onChange={url => set("image_url", url)}
                folder="opportunities"
                label="Cover Image"
                hint="Optional · PNG or JPG · Max 5 MB"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 mb-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
            <button type="button" onClick={() => router.back()} className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
