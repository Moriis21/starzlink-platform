"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { trainingsApi, adminApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronLeft, Loader2, Save, Trash2, BookOpen, Clock, Monitor, MapPin, User, Award } from "lucide-react";
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

export default function EditTrainingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!id) return;
    trainingsApi.getOne(id).then(res => {
      const data = res.data?.data || res.data;
      if (!data) { toast.error("Not found"); router.push("/admin/trainings"); return; }
      setForm(data);
      setFetching(false);
    }).catch(() => { toast.error("Failed to load."); router.push("/admin/trainings"); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await trainingsApi.update(id, form);
      await adminApi.logAction("update", "trainings", `Updated: ${form.title}`);
      toast.success("Training updated!");
      router.push("/admin/trainings");
    } catch { toast.error("Failed to update."); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${form?.title}"? This cannot be undone.`)) return;
    try { await trainingsApi.delete(id); toast.success("Deleted."); router.push("/admin/trainings"); }
    catch { toast.error("Delete failed."); }
  };

  if (fetching) return <div className="p-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /><div className="h-64 bg-gray-100 rounded" /></div>;
  if (!form) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/trainings" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Edit Training</h1>
            <p className="text-gray-500 text-sm truncate max-w-md">{form.title}</p>
          </div>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 text-sm font-medium">
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Training Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4 text-orange-600" /></div>
              <h2 className="font-bold text-gray-900">Training Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Title <span className="text-red-500">*</span></label>
                <input value={form.title || ""} onChange={e => set("title", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Provider <span className="text-red-500">*</span></label>
                <input value={form.provider || ""} onChange={e => set("provider", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Category</label>
                <select value={form.category || ""} onChange={e => set("category", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Level</label>
                <select value={form.level || ""} onChange={e => set("level", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  <option value="">Select level</option>
                  {levels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" /> Duration</label>
                <input value={form.duration || ""} onChange={e => set("duration", e.target.value)} placeholder="e.g. 6 Weeks" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Fee / Price</label>
                <input value={form.fee || ""} onChange={e => set("fee", e.target.value)} placeholder="Free or $99" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><Monitor className="w-3.5 h-3.5 text-gray-400" /> Delivery Mode</label>
                <select value={form.mode || "online"} onChange={e => set("mode", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  {modes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              {(form.mode === "physical" || form.mode === "hybrid") && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Location / Venue</label>
                  <input value={form.location || ""} onChange={e => set("location", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Start Date <span className="text-red-500">*</span></label>
                <input type="date" value={form.start_date ? form.start_date.split("T")[0] : ""} onChange={e => set("start_date", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><User className="w-3.5 h-3.5 text-gray-400" /> Instructor</label>
                <input value={form.instructor || ""} onChange={e => set("instructor", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><Award className="w-3.5 h-3.5 text-gray-400" /> Certificate</label>
                <select value={form.certificate_status || ""} onChange={e => set("certificate_status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  <option value="">Select certificate</option>
                  {certOptions.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea value={form.description || ""} onChange={e => set("description", e.target.value)} rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">What You Will Learn <span className="text-gray-400 font-normal text-xs">(one per line)</span></label>
                <textarea value={form.what_you_will_learn || ""} onChange={e => set("what_you_will_learn", e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none font-mono" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Registration Link <span className="text-red-500">*</span></label>
                <input type="url" value={form.registration_link || ""} onChange={e => set("registration_link", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <ImageUploader value={form.image_url || ""} onChange={url => set("image_url", url)} folder="trainings" label="Cover Image" />
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
            <Link href="/admin/trainings" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 text-sm">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
