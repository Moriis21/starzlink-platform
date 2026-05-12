"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { resourcesApi, adminApi } from "@/lib/api";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";
import {
  ChevronLeft, FolderOpen, FileText, UploadCloud, Globe,
  Loader2, X, CheckCircle2, Star, BookOpen, DollarSign,
  Link2, Lock, Unlock, Eye, Save, Trash2
} from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";
import { motion } from "framer-motion";

const CATEGORIES = [
  "Guides & eBooks", "CV Templates", "Cover Letter Templates",
  "Interview Tips", "Scholarship Guides", "Study Abroad Guides",
  "Career Tools", "Video Tutorials", "Downloads", "Tips & Articles",
];

export default function EditResourcePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    file_url: "",
    image_url: "",
    access_url: "",   // URL/link shown to buyers after purchase (or to everyone if free)
    is_paid: false,
    price: 0,
    currency: "USD",
    status: "active",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Load existing resource
  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await resourcesApi.getOne(id);
        const r = res.data?.data || res.data;
        if (!r) { toast.error("Resource not found."); router.push("/admin/resources"); return; }
        setForm({
          title: r.title || "",
          category: r.category || "",
          description: r.description || "",
          file_url: r.file_url || "",
          image_url: r.image_url || "",
          access_url: (r as any).access_url || r.file_url || "",
          is_paid: r.is_paid ?? false,
          price: r.price ?? 0,
          currency: r.currency || "USD",
          status: r.status || "active",
        });
        if (r.file_url) setUploadedFileName(r.file_url.split("/").pop() || "Existing file");
      } catch { toast.error("Failed to load resource."); router.push("/admin/resources"); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  // Handle document file upload to InsForge storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) { toast.error("File too large. Max 30 MB."); return; }
    setUploadingFile(true);
    try {
      const path = `resources/${Date.now()}-${file.name}`;
      const { data, error } = await insforge.storage.from("documents").upload(path, file);
      if (error) throw error;
      if (data?.url) {
        set("file_url", data.url);
        set("access_url", data.url);
        setUploadedFileName(file.name);
        toast.success("File uploaded!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed.");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await resourcesApi.update(id, form);
      await adminApi.logAction("update", "resources", `Updated resource: ${form.title}`);
      toast.success("Resource updated successfully!");
      router.push("/admin/resources");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    try {
      await resourcesApi.delete(id);
      toast.success("Resource deleted.");
      router.push("/admin/resources");
    } catch { toast.error("Delete failed."); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/resources" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Edit Resource</h1>
            <p className="text-gray-500 text-sm">Update this resource listing.</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" /> Delete Resource
        </button>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-3 gap-6">
        {/* ── Main column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-900">Resource Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  placeholder="e.g. Professional CV Template Pack"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={e => set("category", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => set("status", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white"
                >
                  <option value="active">Active — Visible</option>
                  <option value="inactive">Inactive — Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="font-bold text-gray-900">Description</h2>
            </div>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={5}
              placeholder="Describe what this resource contains and who it's for..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1.5">{form.description.length} chars · Shown in preview card and purchase modal</p>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="font-bold text-gray-900">Pricing</h2>
            </div>

            {/* Free / Paid toggle */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => set("is_paid", false)}
                className={`flex items-center gap-2 p-3.5 rounded-xl border-2 transition-all ${
                  !form.is_paid ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!form.is_paid ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <Unlock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${!form.is_paid ? "text-green-700" : "text-gray-600"}`}>Free</p>
                  <p className="text-xs text-gray-400">Available to all users</p>
                </div>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => set("is_paid", true)}
                className={`flex items-center gap-2 p-3.5 rounded-xl border-2 transition-all ${
                  form.is_paid ? "border-[#1a3c8f] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.is_paid ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-500"}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${form.is_paid ? "text-[#1a3c8f]" : "text-gray-600"}`}>Paid</p>
                  <p className="text-xs text-gray-400">Requires purchase</p>
                </div>
              </motion.button>
            </div>

            {form.is_paid && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</span>
                    <input
                      type="number"
                      min="0.99"
                      step="0.01"
                      value={form.price}
                      onChange={e => set("price", parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f]"
                      required={form.is_paid}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Currency</label>
                  <select value={form.currency} onChange={e => set("currency", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="LRD">LRD (L$)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Access Link (what buyers get) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  {form.is_paid ? "Resource Access Link (shown after purchase)" : "Download / Access Link"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {form.is_paid
                    ? "The URL or download link shown to users AFTER they complete payment."
                    : "The URL or file link users will access directly."}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Access URL / Link
                {!form.file_url && <span className="text-gray-400 font-normal text-xs ml-1">(or upload a file below)</span>}
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={form.access_url || form.file_url}
                  onChange={e => { set("access_url", e.target.value); set("file_url", e.target.value); }}
                  placeholder="https://drive.google.com/file/... or Dropbox/OneDrive link"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                💡 You can paste a Google Drive, Dropbox, OneDrive, or any direct download link here.
              </p>
            </div>

            <div className="mt-4 border-t border-gray-50 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Or upload the file directly:</p>
              {form.file_url && uploadedFileName ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800 truncate">{uploadedFileName}</p>
                    <p className="text-xs text-green-600">File uploaded to InsForge storage</p>
                  </div>
                  <button type="button" onClick={() => { set("file_url", ""); set("access_url", ""); setUploadedFileName(""); }} className="p-1 text-red-400 hover:text-red-600 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <motion.div
                  whileHover={{ borderColor: "#1a3c8f" }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-5 cursor-pointer hover:bg-blue-50/50 transition-all"
                >
                  {uploadingFile ? (
                    <><Loader2 className="w-6 h-6 text-[#1a3c8f] animate-spin" /><p className="text-sm text-[#1a3c8f]">Uploading…</p></>
                  ) : (
                    <><UploadCloud className="w-7 h-7 text-gray-300" /><p className="text-sm font-medium text-gray-600">Click to upload PDF, DOCX, PPTX, ZIP</p><p className="text-xs text-gray-400">Max 30 MB</p></>
                  )}
                </motion.div>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.pptx,.ppt,.xlsx,.xls,.zip" onChange={handleFileUpload} className="hidden" />
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Thumbnail */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <ImageUploader
              value={form.image_url}
              onChange={url => set("image_url", url)}
              folder="resources"
              label="Thumbnail Image"
              hint="Shown as preview card · Recommended 800 × 600 px"
              aspectRatio="square"
            />
            {!form.image_url && (
              <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700 flex items-start gap-1.5">
                <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                All paid resources should have a professional thumbnail so users can see what they're buying.
              </div>
            )}
          </div>

          {/* Save button */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-gray-500" />
              <h3 className="font-bold text-gray-900 text-sm">Save Changes</h3>
            </div>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 mb-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
              ) : (
                <><Save className="w-4 h-4" />Save Resource</>
              )}
            </motion.button>
            <Link href="/admin/resources" className="flex items-center justify-center w-full border border-gray-200 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors">
              Cancel
            </Link>
          </div>

          {/* Preview tips */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">Checklist</p>
            </div>
            <ul className="space-y-1.5 text-xs text-blue-700">
              {[
                { label: "Professional thumbnail image", done: !!form.image_url },
                { label: "Clear title & description", done: !!(form.title && form.description) },
                { label: "Access link or uploaded file", done: !!(form.file_url || form.access_url) },
                { label: "Correct price (if paid)", done: !form.is_paid || form.price > 0 },
                { label: "Category selected", done: !!form.category },
              ].map(({ label, done }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${done ? "text-green-500" : "text-blue-300"}`} />
                  <span className={done ? "text-blue-800 font-medium" : "text-blue-500"}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
