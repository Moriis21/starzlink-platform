"use client";

import { useState, useEffect } from "react";
import { Search, Megaphone, Calendar, Building2, Bookmark, LayoutList, Newspaper, PartyPopper, BellRing, GraduationCap, ClipboardList, X, Loader2, CheckCircle2, Send, User, Phone, Mail, IdCard, BookOpen, Shield, ChevronDown } from "lucide-react";
import { campusApi, newsletterApi } from "@/lib/api";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CampusUpdate } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import Pagination from "@/components/ui/Pagination";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";
import toast from "react-hot-toast";

// ── Submission Modal ───────────────────────────────────────────────────────────
const liberianUniversities = [
  "University of Liberia (UL)",
  "Cuttington University (CU)",
  "African Methodist Episcopal University (AMEU)",
  "United Methodist University (UMU)",
  "Tubman University (TU)",
  "Booker Washington Institute (BWI)",
  "Stella Maris Polytechnic (SMP)",
  "Grand Kru Technical Community College (GKTCC)",
  "Bong Mines Technical Community College (BMTCC)",
  "Mother Patern College of Health Sciences (MPCHS)",
  "A.M.E. Zion University College (AMEZUC)",
  "Riva Kaikia College (RKC)",
  "Other (please specify)",
];

const studyLevels = ["Freshman / Year 1", "Sophomore / Year 2", "Junior / Year 3", "Senior / Year 4", "Graduate Student", "Alumni / Graduate", "Staff / Faculty", "Other"];

interface SubmissionForm {
  full_name: string;
  email: string;
  phone: string;
  is_student: boolean;
  institution: string;
  institution_other: string;
  student_id: string;
  study_level: string;
  connection_desc: string;
  update_title: string;
  update_category: string;
  update_description: string;
  update_date: string;
  source_url: string;
  is_authentic: boolean;
  agreed_terms: boolean;
}

const blankForm = (): SubmissionForm => ({
  full_name: "",
  email: "",
  phone: "",
  is_student: true,
  institution: "",
  institution_other: "",
  student_id: "",
  study_level: "",
  connection_desc: "",
  update_title: "",
  update_category: "news",
  update_description: "",
  update_date: "",
  source_url: "",
  is_authentic: false,
  agreed_terms: false,
});

function SubmitUpdateModal({ onClose, prefill }: { onClose: () => void; prefill?: { full_name: string; email: string; phone?: string } }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<SubmissionForm>({
    ...blankForm(),
    full_name: prefill?.full_name || "",
    email: prefill?.email || "",
    phone: prefill?.phone || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof SubmissionForm, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.is_authentic || !form.agreed_terms) {
      toast.error("Please confirm authenticity and agree to terms.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        type: "campus_update",
        status: "pending",
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        is_student: form.is_student,
        institution: form.institution === "Other (please specify)" ? form.institution_other : form.institution,
        student_id: form.student_id,
        study_level: form.study_level,
        connection_desc: form.connection_desc,
        update_title: form.update_title,
        update_category: form.update_category,
        update_description: form.update_description,
        update_date: form.update_date,
        source_url: form.source_url,
        submitted_at: new Date().toISOString(),
      };
      await insforge.database.from("submissions").insert(payload);
      setDone(true);
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] p-5 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-5 h-5 text-yellow-400" />
              <h2 className="font-extrabold text-lg">Submit a Campus Update</h2>
            </div>
            <p className="text-blue-200 text-xs">Share news, events or announcements from your campus.</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        {!done && (
          <div className="flex border-b border-gray-100">
            {[
              { n: 1, label: "Your Info" },
              { n: 2, label: "Institution" },
              { n: 3, label: "The Update" },
              { n: 4, label: "Confirm" },
            ].map(s => (
              <button
                key={s.n}
                type="button"
                onClick={() => step > s.n && setStep(s.n)}
                className={cn("flex-1 py-3 text-xs font-semibold transition-colors",
                  step === s.n ? "text-[#1a3c8f] border-b-2 border-[#1a3c8f] bg-blue-50" :
                  step > s.n ? "text-green-600 cursor-pointer hover:bg-gray-50" : "text-gray-400")}
              >
                <span className={cn("inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mr-1",
                  step > s.n ? "bg-green-100 text-green-700" : step === s.n ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-400")}>{step > s.n ? "✓" : s.n}</span>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {done ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Submitted Successfully!</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Thank you, <strong>{form.full_name}</strong>! Your campus update has been received and will be reviewed by our team. If approved, it will be published on StarzLink.
            </p>
            <button onClick={onClose} className="bg-[#1a3c8f] text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-900 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={step < 4 ? (e) => { e.preventDefault(); setStep(s => s + 1); } : handleSubmit} className="p-6 space-y-4">

            {/* Step 1: Personal info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-[#1a3c8f]" />
                  <h3 className="font-bold text-gray-900">Your Information</h3>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input value={form.full_name} onChange={e => set("full_name", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="+231 ..." />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Are you a student?</label>
                  <div className="flex gap-3">
                    {[{ v: true, label: "Yes, I am a student" }, { v: false, label: "No, I am staff / other" }].map(opt => (
                      <button key={String(opt.v)} type="button" onClick={() => set("is_student", opt.v)}
                        className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors",
                          form.is_student === opt.v ? "bg-[#1a3c8f] text-white border-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Institution */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-[#1a3c8f]" />
                  <h3 className="font-bold text-gray-900">Your Institution</h3>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Institution <span className="text-red-500">*</span></label>
                  <select value={form.institution} onChange={e => set("institution", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                    <option value="">Select your institution</option>
                    {liberianUniversities.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {form.institution === "Other (please specify)" && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Specify Institution <span className="text-red-500">*</span></label>
                    <input value={form.institution_other} onChange={e => set("institution_other", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="Institution name" />
                  </div>
                )}
                {form.is_student && (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><IdCard className="w-3.5 h-3.5 text-gray-400" /> Student ID</label>
                      <input value={form.student_id} onChange={e => set("student_id", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="Your student ID number" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-gray-400" /> Academic Level</label>
                      <select value={form.study_level} onChange={e => set("study_level", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                        <option value="">Select your level</option>
                        {studyLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">How are you connected to this update? <span className="text-red-500">*</span></label>
                  <textarea value={form.connection_desc} onChange={e => set("connection_desc", e.target.value)} required rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" placeholder="e.g. I am a student at this institution and witnessed this event directly…" />
                </div>
              </div>
            )}

            {/* Step 3: The update */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper className="w-4 h-4 text-[#1a3c8f]" />
                  <h3 className="font-bold text-gray-900">The Campus Update</h3>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Title / Headline <span className="text-red-500">*</span></label>
                  <input value={form.update_title} onChange={e => set("update_title", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="e.g. UL Announces New Engineering Department" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Category</label>
                  <select value={form.update_category} onChange={e => set("update_category", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                    <option value="news">News</option>
                    <option value="events">Event</option>
                    <option value="announcements">Announcement</option>
                    <option value="scholarships">Scholarship Alert</option>
                    <option value="exams">Exam Notice</option>
                    <option value="results">Results Notice</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Date of Update <span className="text-red-500">*</span></label>
                  <input type="date" value={form.update_date} onChange={e => set("update_date", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea value={form.update_description} onChange={e => set("update_description", e.target.value)} required rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" placeholder="Provide as much detail as possible about the update…" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Source / Reference URL <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                  <input type="url" value={form.source_url} onChange={e => set("source_url", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="https://..." />
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#1a3c8f]" />
                  <h3 className="font-bold text-gray-900">Confirmation & Terms</h3>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 border border-gray-100">
                  <p><span className="font-semibold text-gray-600">Name:</span> <span className="text-gray-900">{form.full_name}</span></p>
                  <p><span className="font-semibold text-gray-600">Email:</span> <span className="text-gray-900">{form.email}</span></p>
                  <p><span className="font-semibold text-gray-600">Institution:</span> <span className="text-gray-900">{form.institution === "Other (please specify)" ? form.institution_other : form.institution}</span></p>
                  <p><span className="font-semibold text-gray-600">Update:</span> <span className="text-gray-900">{form.update_title}</span></p>
                  <p><span className="font-semibold text-gray-600">Category:</span> <span className="text-gray-900 capitalize">{form.update_category}</span></p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <input type="checkbox" checked={form.is_authentic} onChange={e => set("is_authentic", e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-700">
                    <strong>I confirm this information is authentic.</strong> The campus update I am submitting is accurate, truthful, and genuinely related to the institution I have identified. I understand that submitting false information may result in the removal of my submission and possible account restrictions.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <input type="checkbox" checked={form.agreed_terms} onChange={e => set("agreed_terms", e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-700">
                    I agree to StarzLink&apos;s{" "}
                    <Link href="/terms" target="_blank" className="text-[#1a3c8f] font-semibold hover:underline">Terms of Use</Link>
                    {" "}and{" "}
                    <Link href="/privacy" target="_blank" className="text-[#1a3c8f] font-semibold hover:underline">Privacy Policy</Link>.
                    I understand my submission will be reviewed before being published.
                  </span>
                </label>

                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 flex items-start gap-2">
                  <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                  Your personal information is protected and will only be used for verification purposes. It will not be published publicly.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  ← Back
                </button>
              )}
              <button
                type="submit"
                disabled={step === 4 && (!form.is_authentic || !form.agreed_terms || submitting)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-2.5 rounded-xl hover:bg-blue-900 disabled:opacity-50 transition-colors"
              >
                {step < 4 ? (
                  <>Continue <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></>
                ) : submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Update</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const categories = [
  { id: "all", label: "All Updates", count: 256, icon: LayoutList },
  { id: "news", label: "News", count: 89, icon: Newspaper },
  { id: "events", label: "Events", count: 73, icon: PartyPopper },
  { id: "announcements", label: "Announcements", count: 64, icon: BellRing },
  { id: "scholarships", label: "Scholarships", count: 21, icon: GraduationCap },
  { id: "exams", label: "Exams & Results", count: 10, icon: ClipboardList },
];

const catColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700",
  events: "bg-purple-100 text-purple-700",
  announcements: "bg-yellow-100 text-yellow-700",
  scholarships: "bg-green-100 text-green-700",
  exams: "bg-red-100 text-red-700",
  results: "bg-orange-100 text-orange-700",
};

export default function CampusUpdatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState<CampusUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [institution, setInstitution] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newsEmail, setNewsEmail] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const openSubmitForm = () => {
    if (!user) {
      toast("Please log in to submit a campus update.", { icon: "🔒" });
      router.push("/login?next=/campus-updates");
      return;
    }
    setShowSubmitModal(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "10", sort: sortBy };
      if (category !== "all") params.category = category;
      if (institution) params.institution = institution;
      if (dateFilter !== "all") params.date_filter = dateFilter;
      const res = await campusApi.getAll(params);
      setUpdates(res.data?.data || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, sortBy, category]);

  const handleNewsSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await newsletterApi.subscribe(newsEmail);
      toast.success("Subscribed to campus updates!");
      setNewsEmail("");
    } catch { toast.error("Failed to subscribe."); }
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-12 px-4 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-2">Stay Informed. Stay Ahead.</h1>
            <p className="text-blue-200">Get the latest campus news, events, announcements and important updates — all in one place.</p>
          </div>
          <div className="hidden lg:block bg-white/10 border border-white/20 rounded-2xl p-5 w-72">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-sm">Have an Update to Share?</span>
            </div>
            <p className="text-xs text-blue-200 mb-3">Submit news or events happening on your campus.</p>
            <button
              onClick={openSubmitForm}
              className="block w-full text-center bg-white text-[#1a3c8f] font-bold text-sm py-2 rounded-xl hover:bg-blue-50 transition-colors"
            >Submit Update</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> › <span className="text-gray-900">Campus Updates</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setPage(1); }}
                    className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors", category === cat.id ? "bg-[#1a3c8f] text-white" : "text-gray-600 hover:bg-gray-50")}
                  >
                    <span className="flex items-center gap-2">
                      <CatIcon className="w-4 h-4" />
                      {cat.label}
                    </span>
                    <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", category === cat.id ? "bg-white/20" : "bg-gray-100")}>{cat.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Filter by Institution</h3>
            <select value={institution} onChange={e => setInstitution(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none">
              <option value="">All Institutions</option>
              <option>University of Lagos</option>
              <option>Covenant University</option>
              <option>University of Ibadan</option>
              <option>Babcock University</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Filter by Date</h3>
            {["all", "today", "week", "month"].map(d => (
              <label key={d} className="flex items-center gap-2 py-1 cursor-pointer">
                <input type="radio" name="date" checked={dateFilter === d} onChange={() => setDateFilter(d)} className="accent-[#1a3c8f]" />
                <span className="text-sm text-gray-600 capitalize">{d === "all" ? "All Time" : d === "week" ? "This Week" : d === "month" ? "This Month" : "Today"}</span>
              </label>
            ))}
          </div>

          {/* Stay Updated */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <h4 className="font-bold text-gray-900 text-sm mb-2">Stay Updated!</h4>
            <p className="text-xs text-gray-500 mb-3">Subscribe for campus news alerts.</p>
            <form onSubmit={handleNewsSubscribe}>
              <input value={newsEmail} onChange={e => setNewsEmail(e.target.value)} type="email" placeholder="Enter your email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none" />
              <button type="submit" className="w-full bg-[#1a3c8f] text-white text-sm font-bold py-2 rounded-lg hover:bg-blue-900">Subscribe</button>
            </form>
          </div>

          {/* WhatsApp */}
          <div className="bg-gradient-to-b from-[#075E54] to-[#128C7E] rounded-2xl p-4 text-white">
            <p className="font-bold text-sm mb-1">Join Our WhatsApp Channel!</p>
            <p className="text-xs text-green-200 mb-3">Get real-time campus updates, announcements and alerts.</p>
            <a href="https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white text-[#075E54] font-bold text-sm px-3 py-2 rounded-lg w-full justify-center">Join Now →</a>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-xl">Latest Campus Updates</h2>
              <p className="text-sm text-gray-500">Showing {updates.length} updates</p>
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-40" />)}</div>
          ) : updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex gap-4 p-5">
                  {update.image_url ? (
                    <img src={update.image_url} alt={update.title} className="w-28 h-24 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-28 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full uppercase", catColors[update.category] || "bg-gray-100 text-gray-600")}>{update.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                        <span>{formatDate(update.date)}</span>
                        <button className="p-1 hover:text-[#1a3c8f] rounded"><Bookmark className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a3c8f] transition-colors mb-1 line-clamp-2">{update.title}</h3>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{update.institution}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{update.description}</p>
                    <Link href={`/campus-updates/${update.id}`} className="text-sm font-semibold text-[#1a3c8f] hover:underline">View Details →</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No updates found</h3>
              <p className="text-gray-500">Check back later for the latest campus news.</p>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <WhatsAppBanner />

      {/* Mobile: floating submit button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={openSubmitForm}
          className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-5 py-3 rounded-2xl shadow-xl hover:bg-blue-900 transition-colors"
        >
          <Megaphone className="w-4 h-4" /> Submit Update
        </button>
      </div>

      {showSubmitModal && (
        <SubmitUpdateModal
          onClose={() => setShowSubmitModal(false)}
          prefill={user ? { full_name: user.full_name, email: user.email, phone: user.phone } : undefined}
        />
      )}
    </div>
  );
}

