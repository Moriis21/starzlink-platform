"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { resourcesApi, adminApi, storageApi } from "@/lib/api";
import toast from "react-hot-toast";
import {
  ChevronLeft, FolderOpen, FileText, UploadCloud, Globe,
  Loader2, X, CheckCircle2, Star, BookOpen
} from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/admin/ImageUploader";

const categories = [
  "Guides & eBooks",
  "CV Templates",
  "Cover Letter Templates",
  "Interview Tips",
  "Scholarship Guides",
  "Study Abroad Guides",
  "Career Tools",
  "Video Tutorials",
  "Downloads",
  "Tips & Articles",
];

export default function NewResourcePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    file_url: "",
    image_url: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { toast.error("File too large. Max 20 MB for documents."); return; }

    setUploadingFile(true);
    try {
      const { url, error } = await storageApi.uploadDocument(file);
      if (error) throw error;
      if (url) {
        set("file_url", url);
        setUploadedFileName(file.name);
        toast.success("File uploaded successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "File upload failed.");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resourcesApi.create(form);
      await adminApi.logAction("create", "resources", `Created resource: ${form.title}`);
      toast.success("Resource published!");
      router.push("/admin/resources");
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish resource.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/resources" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Upload New Resource</h1>
          <p className="text-gray-500 text-sm">Add a guide, template, or downloadable resource.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Info */}
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
                  placeholder="e.g. How to Write a Winning CV (2026 Edition)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors"
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
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
              placeholder="Describe this resource — what it contains, who it's for, and how it helps..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none transition-colors"
              required
            />
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <UploadCloud className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="font-bold text-gray-900">Downloadable File</h2>
            </div>

            {form.file_url ? (
              /* File uploaded */
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-800 truncate">{uploadedFileName}</p>
                  <p className="text-xs text-green-600 mt-0.5">File uploaded and ready for download</p>
                </div>
                <button
                  type="button"
                  onClick={() => { set("file_url", ""); setUploadedFileName(""); }}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-[#1a3c8f] hover:bg-blue-50/30 transition-all"
              >
                {uploadingFile ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
                    <p className="text-sm font-medium text-[#1a3c8f]">Uploading file…</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <UploadCloud className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX, PPTX, XLSX · Max 20 MB</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 bg-[#1a3c8f] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Choose File
                    </button>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.pptx,.ppt,.xlsx,.xls,.csv,.zip"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-2">
              The file will be available for users to download. Supported: PDF, Word, PowerPoint, Excel, ZIP.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <ImageUploader
              value={form.image_url}
              onChange={url => set("image_url", url)}
              folder="resources"
              label="Thumbnail Image"
              hint="Shown as resource preview · PNG or JPG"
              aspectRatio="square"
            />
          </div>

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
                <option value="inactive">Inactive</option>
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
                <><FolderOpen className="w-4 h-4" />Publish Resource</>
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

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-semibold text-blue-800">Resource tips</p>
            </div>
            <ul className="space-y-1 text-xs text-blue-700">
              <li className="flex items-start gap-1.5"><BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Use a clear, searchable title</li>
              <li className="flex items-start gap-1.5"><BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Add a descriptive thumbnail</li>
              <li className="flex items-start gap-1.5"><BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Ensure the file is accessible</li>
              <li className="flex items-start gap-1.5"><BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />Choose the most relevant category</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}
