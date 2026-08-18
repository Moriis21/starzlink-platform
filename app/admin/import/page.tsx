"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { Sparkles, Loader2, Save, ChevronLeft, ClipboardPaste, MessageCircle } from "lucide-react";
import { scholarshipsApi, jobsApi, trainingsApi, campusApi, opportunitiesApi } from "@/lib/api";
import { adminFetch } from "@/lib/adminFetch";

// ── Field configuration (mirrors app/api/admin/parse-post + the "new" forms) ──
type FieldType = "text" | "textarea" | "date" | "checkbox";
interface FieldDef { key: string; label: string; type?: FieldType; }

const CATEGORY_LABELS: Record<string, string> = {
  scholarship: "Scholarship",
  job: "Job Lead",
  training: "Training",
  campus_update: "Campus Update",
  internship: "Internship",
  grant: "Grant / Fellowship",
  competition: "Competition",
  volunteer: "Volunteer",
  study_abroad: "Study Abroad",
  research: "Research",
};

const LONG = new Set([
  "description", "benefits", "eligibility", "responsibilities", "requirements",
  "required_documents", "what_you_will_learn",
]);
const DATES = new Set(["deadline", "start_date", "date"]);

const CATEGORY_FIELDS: Record<string, FieldDef[]> = {
  scholarship: [
    { key: "title", label: "Title" }, { key: "provider", label: "Provider" },
    { key: "country", label: "Country" }, { key: "study_level", label: "Study Level" },
    { key: "funding_type", label: "Funding Type" }, { key: "deadline", label: "Deadline" },
    { key: "description", label: "Description" }, { key: "benefits", label: "Benefits" },
    { key: "eligibility", label: "Eligibility" }, { key: "required_documents", label: "Required Documents" },
    { key: "application_link", label: "Application Link" },
  ],
  job: [
    { key: "title", label: "Title" }, { key: "company", label: "Company" },
    { key: "category", label: "Category" }, { key: "location", label: "Location" },
    { key: "job_type", label: "Job Type" }, { key: "salary", label: "Salary" },
    { key: "deadline", label: "Deadline" }, { key: "description", label: "Description" },
    { key: "responsibilities", label: "Responsibilities" }, { key: "requirements", label: "Requirements" },
    { key: "application_link", label: "Application Link" }, { key: "contact_email", label: "Contact Email" },
  ],
  training: [
    { key: "title", label: "Title" }, { key: "provider", label: "Provider" },
    { key: "category", label: "Category" }, { key: "duration", label: "Duration" },
    { key: "fee", label: "Fee" }, { key: "mode", label: "Mode" }, { key: "level", label: "Level" },
    { key: "location", label: "Location" }, { key: "start_date", label: "Start Date" },
    { key: "description", label: "Description" }, { key: "what_you_will_learn", label: "What You Will Learn" },
    { key: "certificate_status", label: "Certificate" }, { key: "instructor", label: "Instructor" },
    { key: "registration_link", label: "Registration Link" },
  ],
  campus_update: [
    { key: "title", label: "Title" }, { key: "institution", label: "Institution" },
    { key: "category", label: "Category" }, { key: "date", label: "Date" },
    { key: "description", label: "Description" },
  ],
  internship: [
    { key: "title", label: "Title" }, { key: "organizer", label: "Organizer" },
    { key: "category", label: "Category" }, { key: "location", label: "Location" },
    { key: "is_remote", label: "Remote / Online", type: "checkbox" }, { key: "deadline", label: "Deadline" },
    { key: "description", label: "Description" }, { key: "eligibility", label: "Eligibility" },
    { key: "benefits", label: "Benefits" }, { key: "application_link", label: "Application Link" },
    { key: "duration", label: "Duration" }, { key: "stipend", label: "Stipend" },
  ],
  grant: [
    { key: "title", label: "Title" }, { key: "organizer", label: "Organizer" },
    { key: "category", label: "Category" }, { key: "location", label: "Location" },
    { key: "is_remote", label: "Remote / Online", type: "checkbox" }, { key: "deadline", label: "Deadline" },
    { key: "description", label: "Description" }, { key: "eligibility", label: "Eligibility" },
    { key: "benefits", label: "Benefits" }, { key: "application_link", label: "Application Link" },
    { key: "amount", label: "Grant Amount" },
  ],
  competition: [
    { key: "title", label: "Title" }, { key: "organizer", label: "Organizer" },
    { key: "category", label: "Category" }, { key: "location", label: "Location" },
    { key: "is_remote", label: "Remote / Online", type: "checkbox" }, { key: "deadline", label: "Deadline" },
    { key: "description", label: "Description" }, { key: "eligibility", label: "Eligibility" },
    { key: "benefits", label: "Benefits" }, { key: "application_link", label: "Application Link" },
    { key: "prize", label: "Prize" }, { key: "team_size", label: "Team Size" },
  ],
  volunteer: [
    { key: "title", label: "Title" }, { key: "organizer", label: "Organizer" },
    { key: "category", label: "Category" }, { key: "location", label: "Location" },
    { key: "is_remote", label: "Remote / Online", type: "checkbox" }, { key: "deadline", label: "Deadline" },
    { key: "description", label: "Description" }, { key: "eligibility", label: "Eligibility" },
    { key: "benefits", label: "Benefits" }, { key: "application_link", label: "Application Link" },
    { key: "commitment_hours", label: "Weekly Commitment" }, { key: "duration", label: "Duration" },
  ],
  study_abroad: [
    { key: "title", label: "Title" }, { key: "organizer", label: "Organizer" },
    { key: "category", label: "Category" }, { key: "location", label: "Location" },
    { key: "is_remote", label: "Remote / Online", type: "checkbox" }, { key: "deadline", label: "Deadline" },
    { key: "description", label: "Description" }, { key: "eligibility", label: "Eligibility" },
    { key: "benefits", label: "Benefits" }, { key: "application_link", label: "Application Link" },
    { key: "destination_country", label: "Destination Country" }, { key: "duration", label: "Duration" },
    { key: "amount", label: "Funding Provided" },
  ],
  research: [
    { key: "title", label: "Title" }, { key: "organizer", label: "Organizer" },
    { key: "category", label: "Category" }, { key: "location", label: "Location" },
    { key: "is_remote", label: "Remote / Online", type: "checkbox" }, { key: "deadline", label: "Deadline" },
    { key: "description", label: "Description" }, { key: "eligibility", label: "Eligibility" },
    { key: "benefits", label: "Benefits" }, { key: "application_link", label: "Application Link" },
    { key: "research_field", label: "Research Field" }, { key: "duration", label: "Duration" },
    { key: "stipend", label: "Stipend" },
  ],
};

const OPP_TYPES = new Set(["internship", "grant", "competition", "volunteer", "study_abroad", "research"]);

function fieldType(def: FieldDef): FieldType {
  if (def.type) return def.type;
  if (DATES.has(def.key)) return "date";
  if (LONG.has(def.key)) return "textarea";
  return "text";
}

export default function ImportPage() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [status, setStatus] = useState("active");

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const handleParse = async () => {
    if (raw.trim().length < 10) { toast.error("Paste the full post first."); return; }
    setParsing(true);
    setConfidence(null);
    try {
      const res = await adminFetch("/api/admin/parse-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Parsing failed."); return; }
      setCategory(data.category);
      setConfidence(data.confidence ?? null);
      // Seed the form with every field for the category so all inputs render.
      const seeded: Record<string, any> = {};
      (CATEGORY_FIELDS[data.category] ?? []).forEach((f) => {
        seeded[f.key] = data.fields?.[f.key] ?? (f.type === "checkbox" ? false : "");
      });
      setForm(seeded);
      toast.success("Parsed! Review the fields below before saving.");
    } catch {
      toast.error("Could not reach the parser.");
    } finally {
      setParsing(false);
    }
  };

  const handleChangeCategory = (next: string) => {
    setCategory(next);
    // Re-seed form fields for the new category, keeping any overlapping values.
    setForm((prev) => {
      const seeded: Record<string, any> = {};
      (CATEGORY_FIELDS[next] ?? []).forEach((f) => {
        seeded[f.key] = prev[f.key] ?? (f.type === "checkbox" ? false : "");
      });
      return seeded;
    });
  };

  const handleSave = async () => {
    if (!category) return;
    if (!form.title || String(form.title).trim() === "") { toast.error("A title is required."); return; }
    setSaving(true);
    try {
      // Build payload: drop empty strings so the DB keeps its defaults.
      const payload: Record<string, any> = { status };
      Object.entries(form).forEach(([k, v]) => {
        if (v === "" || v === undefined || v === null) return;
        payload[k] = v;
      });

      let error: any = null;
      if (category === "scholarship") ({ error } = await scholarshipsApi.create(payload));
      else if (category === "job") ({ error } = await jobsApi.create(payload));
      else if (category === "training") ({ error } = await trainingsApi.create(payload));
      else if (category === "campus_update") ({ error } = await campusApi.create(payload));
      else if (OPP_TYPES.has(category)) ({ error } = await opportunitiesApi.create({ ...payload, opportunity_type: category }));
      else { toast.error("Unknown category."); setSaving(false); return; }

      if (error) { toast.error("Failed to save listing."); return; }
      toast.success(`${CATEGORY_LABELS[category]} published!`);
      // Reset for the next post.
      setRaw(""); setCategory(""); setForm({}); setConfidence(null);
    } catch {
      toast.error("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  const fields = category ? CATEGORY_FIELDS[category] ?? [] : [];

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#25D366]" /> Import from WhatsApp
          </h1>
          <p className="text-gray-500 text-sm">Paste a channel post — AI extracts the details, you review and publish.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Paste box ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardPaste className="w-4 h-4 text-gray-400" />
            <h2 className="font-bold text-gray-900">1 · Paste the post</h2>
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={14}
            placeholder="Copy a post from your WhatsApp channel and paste the full text here…"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none"
          />
          <button
            onClick={handleParse}
            disabled={parsing}
            className="mt-3 w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {parsing ? "Parsing…" : "Parse with AI"}
          </button>
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Tip: include the whole post — deadlines, links and eligibility are picked up automatically. Always double-check before publishing.
          </p>
        </div>

        {/* ── Review + publish ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">2 · Review &amp; publish</h2>

          {!category ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
              Parsed fields will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Type</label>
                  <select
                    value={category}
                    onChange={(e) => handleChangeCategory(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1a3c8f]"
                  >
                    {Object.keys(CATEGORY_FIELDS).map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                {confidence !== null && (
                  <div className="text-right pt-6">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        confidence >= 75 ? "bg-green-50 text-green-700"
                        : confidence >= 50 ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                      }`}
                    >
                      {confidence}% confidence
                    </span>
                  </div>
                )}
              </div>

              {fields.map((f) => {
                const t = fieldType(f);
                if (t === "checkbox") {
                  return (
                    <div key={f.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={f.key}
                        checked={!!form[f.key]}
                        onChange={(e) => set(f.key, e.target.checked)}
                        className="w-4 h-4 accent-[#1a3c8f]"
                      />
                      <label htmlFor={f.key} className="text-sm text-gray-700">{f.label}</label>
                    </div>
                  );
                }
                return (
                  <div key={f.key}>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      {f.label}{f.key === "title" && " *"}
                    </label>
                    {t === "textarea" ? (
                      <textarea
                        value={form[f.key] ?? ""}
                        onChange={(e) => set(f.key, e.target.value)}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none"
                      />
                    ) : (
                      <input
                        type={t === "date" ? "date" : "text"}
                        value={form[f.key] ?? ""}
                        onChange={(e) => set(f.key, e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]"
                      />
                    )}
                  </div>
                );
              })}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Publish status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1a3c8f]"
                >
                  <option value="draft">Save as Draft</option>
                  <option value="active">Publish (Active)</option>
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : `Publish ${CATEGORY_LABELS[category]}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
