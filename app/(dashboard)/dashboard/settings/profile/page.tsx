"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import toast from "react-hot-toast";
import { User, Phone, MapPin, GraduationCap, Save, Loader2, CheckCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  "Liberia", "Sierra Leone", "Ghana", "Nigeria", "Kenya", "South Africa",
  "United States", "United Kingdom", "Canada", "Germany", "France",
  "India", "China", "Cameroon", "Côte d'Ivoire", "Senegal", "Ethiopia",
  "Tanzania", "Uganda", "Rwanda", "Other",
];
const LANGUAGES = [
  "English", "French", "Arabic", "Spanish", "Portuguese", "Swahili",
  "Hausa", "Yoruba", "Igbo", "Amharic", "Zulu", "Other",
];
const EDUCATION_LEVELS = [
  "Primary School", "Junior High School", "Senior High School",
  "Vocational / Technical", "Diploma", "Bachelor's Degree",
  "Master's Degree", "PhD / Doctorate", "Other",
];
const USER_TYPES = ["student", "graduate", "professional", "institution", "other"];
const AREAS = [
  "Technology & IT", "Business & Finance", "Health & Medicine",
  "Education & Research", "Engineering", "Agriculture",
  "Arts & Creative", "Law & Policy", "Social Work", "Other",
];

interface ProfileForm {
  full_name: string; email: string; phone: string; whatsapp_number: string;
  country: string; county_state: string; city_community: string;
  current_location: string; address_description: string;
  preferred_language: string; occupation: string; education_level: string;
  institution_workplace: string; area_of_interest: string; career_goal: string;
  user_type: string; bio: string;
}

const EMPTY: ProfileForm = {
  full_name: "", email: "", phone: "", whatsapp_number: "",
  country: "", county_state: "", city_community: "",
  current_location: "", address_description: "",
  preferred_language: "", occupation: "", education_level: "",
  institution_workplace: "", area_of_interest: "", career_goal: "",
  user_type: "student", bio: "",
};

const REQUIRED_FIELDS = ["full_name", "phone", "country", "county_state", "city_community", "current_location", "preferred_language", "occupation", "user_type"];

const inputClass = (hasError: boolean) => cn(
  "w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20 transition-colors",
  hasError ? "border-red-400" : "border-gray-200"
);
const selectClass = (hasError: boolean) => cn(
  "w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white transition-colors",
  hasError ? "border-red-400" : "border-gray-200"
);

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const { data } = await insforge.database.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (data) {
          const p = data as any;
          setForm({
            full_name: p.full_name || user.full_name || "",
            email: p.email || user.email || "",
            phone: p.phone || "",
            whatsapp_number: p.whatsapp_number || "",
            country: p.country || "",
            county_state: p.county_state || "",
            city_community: p.city_community || "",
            current_location: p.current_location || "",
            address_description: p.address_description || "",
            preferred_language: p.preferred_language || "",
            occupation: p.occupation || "",
            education_level: p.education_level || "",
            institution_workplace: p.institution_workplace || "",
            area_of_interest: p.area_of_interest || "",
            career_goal: p.career_goal || "",
            user_type: p.user_type || "student",
            bio: p.bio || "",
          });
          setProfileCompleted(!!p.profile_completed);
        } else {
          setForm(f => ({ ...f, full_name: user.full_name || "", email: user.email || "" }));
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const handleChange = (field: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(err => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof ProfileForm, string>> = {};
    for (const f of REQUIRED_FIELDS) {
      if (!form[f as keyof ProfileForm]?.trim()) newErrors[f as keyof ProfileForm] = "Required";
    }
    if (form.phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error("Please fill in all required fields."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user!.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setProfileCompleted(data.profile_completed);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile.");
    }
    setSaving(false);
  };

  const lbl = (text: string, req?: boolean) => (
    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
      {text} {req && <span className="text-red-500">*</span>}
    </label>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#1a3c8f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Locked state — profile already completed ──────────────────────────────
  if (profileCompleted) {
    return (
      <div className="max-w-3xl">
        <Breadcrumb crumbs={[{ label: "Settings" }, { label: "Profile" }]} />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Profile Settings</h1>
            <p className="text-gray-500 text-sm mt-0.5">Your profile information.</p>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-4 h-4" /> Profile Complete
          </span>
        </div>

        {/* Read-only view of saved data */}
        <div className="space-y-4">
          {[
            { title: "Personal Information", rows: [["Full Name", form.full_name], ["Email", form.email], ["Phone", form.phone], ["WhatsApp", form.whatsapp_number], ["User Type", form.user_type], ["Bio", form.bio]] },
            { title: "Location", rows: [["Country", form.country], ["County / State", form.county_state], ["City / Community", form.city_community], ["Current Location", form.current_location], ["Address", form.address_description]] },
            { title: "Language & Occupation", rows: [["Preferred Language", form.preferred_language], ["Occupation", form.occupation], ["Institution", form.institution_workplace]] },
            { title: "Education & Career", rows: [["Education Level", form.education_level], ["Area of Interest", form.area_of_interest], ["Career Goal", form.career_goal]] },
          ].map(section => (
            <div key={section.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-500">{section.title}</h2>
              <div className="space-y-2">
                {section.rows.filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-400 w-40 flex-shrink-0">{label}</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumb crumbs={[{ label: "Settings" }, { label: "Profile" }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Complete your profile to unlock full platform access.</p>
        </div>
      </div>

      <div className="space-y-5">

        {/* ── Personal Information ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#1a3c8f]" /> Personal Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              {lbl("Full Name", true)}
              <input value={form.full_name} onChange={handleChange("full_name")}
                placeholder="Your full name" className={inputClass(!!errors.full_name)} />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
            </div>

            {/* Email (read-only) */}
            <div>
              {lbl("Email Address")}
              <input value={form.email} disabled
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
            </div>

            {/* Phone */}
            <div>
              {lbl("Phone Number", true)}
              <input type="tel" value={form.phone} onChange={handleChange("phone")}
                placeholder="+231 77 000 0000" className={inputClass(!!errors.phone)} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* WhatsApp */}
            <div>
              {lbl("WhatsApp Number")}
              <input type="tel" value={form.whatsapp_number} onChange={handleChange("whatsapp_number")}
                placeholder="+231 77 000 0000 (optional)" className={inputClass(false)} />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4">
            {lbl("Bio")}
            <textarea value={form.bio} onChange={handleChange("bio")} rows={3}
              placeholder="A short description about yourself..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" />
          </div>

          {/* User type */}
          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              I am a <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {USER_TYPES.map(t => (
                <button key={t} type="button"
                  onClick={() => { setForm(f => ({ ...f, user_type: t })); setErrors(e => ({ ...e, user_type: undefined })); }}
                  className={cn("px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-colors",
                    form.user_type === t ? "bg-[#1a3c8f] text-white border-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:border-[#1a3c8f]"
                  )}>
                  {t}
                </button>
              ))}
            </div>
            {errors.user_type && <p className="text-xs text-red-500 mt-1">{errors.user_type}</p>}
          </div>
        </div>

        {/* ── Location ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1a3c8f]" /> Location Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Country */}
            <div>
              {lbl("Country", true)}
              <select value={form.country} onChange={handleChange("country")} className={selectClass(!!errors.country)}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
            </div>

            {/* County/State */}
            <div>
              {lbl("County / State", true)}
              <input value={form.county_state} onChange={handleChange("county_state")}
                placeholder="e.g. Montserrado, Lagos" className={inputClass(!!errors.county_state)} />
              {errors.county_state && <p className="text-xs text-red-500 mt-1">{errors.county_state}</p>}
            </div>

            {/* City */}
            <div>
              {lbl("City / Community", true)}
              <input value={form.city_community} onChange={handleChange("city_community")}
                placeholder="e.g. Monrovia, Ikeja" className={inputClass(!!errors.city_community)} />
              {errors.city_community && <p className="text-xs text-red-500 mt-1">{errors.city_community}</p>}
            </div>

            {/* Current Location */}
            <div>
              {lbl("Current Location", true)}
              <input value={form.current_location} onChange={handleChange("current_location")}
                placeholder="e.g. Sinkor, Monrovia" className={inputClass(!!errors.current_location)} />
              {errors.current_location && <p className="text-xs text-red-500 mt-1">{errors.current_location}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="mt-4">
            {lbl("Address Description", true)}
            <textarea value={form.address_description} onChange={handleChange("address_description")} rows={2}
              placeholder="e.g. Behind the church on 14th Street, Sinkor"
              className={cn("w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none",
                errors.address_description ? "border-red-400" : "border-gray-200")} />
            {errors.address_description && <p className="text-xs text-red-500 mt-1">{errors.address_description}</p>}
          </div>
        </div>

        {/* ── Language & Occupation ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#1a3c8f]" /> Language & Occupation
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Language */}
            <div>
              {lbl("Preferred Language", true)}
              <select value={form.preferred_language} onChange={handleChange("preferred_language")} className={selectClass(!!errors.preferred_language)}>
                <option value="">Select language</option>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              {errors.preferred_language && <p className="text-xs text-red-500 mt-1">{errors.preferred_language}</p>}
            </div>

            {/* Occupation */}
            <div>
              {lbl("Occupation / Job Title", true)}
              <input value={form.occupation} onChange={handleChange("occupation")}
                placeholder="e.g. Software Engineer, Teacher" className={inputClass(!!errors.occupation)} />
              {errors.occupation && <p className="text-xs text-red-500 mt-1">{errors.occupation}</p>}
            </div>

            {/* Institution */}
            <div>
              {lbl("Institution / Workplace")}
              <input value={form.institution_workplace} onChange={handleChange("institution_workplace")}
                placeholder="e.g. University of Liberia" className={inputClass(false)} />
            </div>
          </div>
        </div>

        {/* ── Education & Career ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1a3c8f]" /> Education & Career
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Education level */}
            <div>
              {lbl("Education Level")}
              <select value={form.education_level} onChange={handleChange("education_level")} className={selectClass(false)}>
                <option value="">Select education level</option>
                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Area of interest */}
            <div>
              {lbl("Area of Interest")}
              <select value={form.area_of_interest} onChange={handleChange("area_of_interest")} className={selectClass(false)}>
                <option value="">Select area</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Career goal */}
          <div className="mt-4">
            {lbl("Career Goal")}
            <textarea value={form.career_goal} onChange={handleChange("career_goal")} rows={2}
              placeholder="What do you want to achieve in your career?"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" />
          </div>
        </div>

        {/* ── Save ── */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-400">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60 transition-colors text-sm">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save Changes</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
