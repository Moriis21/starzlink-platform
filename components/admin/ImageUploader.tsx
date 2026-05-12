"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, X, ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { storageApi } from "@/lib/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
  aspectRatio?: "wide" | "square" | "tall";
}

export default function ImageUploader({
  value,
  onChange,
  folder = "general",
  label = "Featured Image",
  hint = "PNG, JPG, WEBP · Max 5 MB",
  aspectRatio = "wide",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewHeight =
    aspectRatio === "square" ? "h-48" : aspectRatio === "tall" ? "h-64" : "h-44";

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed (PNG, JPG, WEBP, GIF).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 5 MB.");
        return;
      }

      setUploading(true);
      try {
        const { url, error } = await storageApi.uploadImage(file, folder);
        if (error) throw error;
        if (url) {
          onChange(url);
          toast.success("Image uploaded successfully!");
        }
      } catch (err: any) {
        toast.error(err?.message || "Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <p className="text-sm font-semibold text-gray-700">{label}</p>

      {/* Preview / Drop zone */}
      {value ? (
        /* ── Uploaded image preview ── */
        <div className={cn("relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group", previewHeight)}>
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />

          {/* overlay controls */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors shadow"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-600 transition-colors shadow"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>

          {/* success badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Uploaded
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none",
            previewHeight,
            dragOver
              ? "border-[#1a3c8f] bg-blue-50 scale-[1.01]"
              : "border-gray-200 bg-gray-50 hover:border-[#1a3c8f] hover:bg-blue-50/50",
            uploading && "pointer-events-none"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
              <p className="text-sm font-medium text-[#1a3c8f]">Uploading…</p>
            </>
          ) : (
            <>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                dragOver ? "bg-[#1a3c8f]/10" : "bg-gray-100"
              )}>
                <UploadCloud className={cn("w-6 h-6", dragOver ? "text-[#1a3c8f]" : "text-gray-400")} />
              </div>

              <div className="text-center px-4">
                <p className="text-sm font-semibold text-gray-700">
                  {dragOver ? "Drop image here" : "Click to browse or drag & drop"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="mt-1 inline-flex items-center gap-1.5 bg-[#1a3c8f] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Choose Image
              </button>
            </>
          )}
        </div>
      )}

      {/* Hidden input — opens system file picker */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleFileInput}
        className="hidden"
        aria-label="Upload image"
      />

      {/* Tip */}
      {!value && !uploading && (
        <p className="text-xs text-gray-400">
          Supported formats: PNG, JPG, WEBP, GIF · Max 5 MB
        </p>
      )}
    </div>
  );
}
