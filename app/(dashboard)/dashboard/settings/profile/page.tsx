"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import toast from "react-hot-toast";
import { User, Phone, MapPin, GraduationCap, Save, Loader2, CheckCircle } from "lucide-react";
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

const required = ["full_name", "phone", "country", "county_state", "city_community", "current_location", "preferred_language", "occupation", "user_type"];

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileForm>>({});

  // Load current profile from DB
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

  const set = (field: keyof ProfileForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(err => ({ ...err, [field]: undefined }));
  };

  const validate = () => {
    const newErrors: Partial<ProfileForm> = {};
    for (const f of required) {
      if (!form[f as keyof ProfileForm]?.trim()) {
        newErrors[f as keyof ProfileForm] = "This field is required";
      }
    }
    if (form.phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }
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

  const Field = ({ label, field, type = "text", placeholder = "", req = false, className = "" }: any) => (
    <div className={className}>
      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
        {label} {req && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[field as keyof ProfileForm]}
        onChange={set(field)}
        placeholder={placeholder}
        className={cn(
          "w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]/20",
          errors[field as keyof ProfileForm] ? "border-red-400" : "border-gray-200"
        )}
      />
      {errors[field as keyof ProfileForm] && (
        <p className="text-xs text-red-500 mt-1">{errors[field as keyof ProfileForm]}</p>
      )}
    </div>
  );

  const Select = ({ label, field, options, req = false, className = "" }: any) => (
    <div className={className}>
      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
        {label} {req && <span className="text-red-500">*</span>}
      </label>
      <select
        value={form[field as keyof ProfileForm]}
        onChange={set(field)}
        className={cn(
          "w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white",
          errors[field as keyof ProfileForm] ? "border-red-400" : "border-gray-200"
        )}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
      {errors[field as keyof ProfileForm] && (
        <p className="text-xs text-red-500 mt-1">{errors[field as keyof ProfileForm]}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#1a3c8f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumb crumbs={[{ label: "Settings" }, { label: "Profile" }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Update your personal information and preferences.</p>
        </div>
        {profileCompleted && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <CheckCircle className="w-4 h-4" /> Profile Complete
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#1a3c8f]" /> Personal Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" field="full_name" placeholder="Your full name" req className="sm:col-span-2" />
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address</label>
              <input value={form.email} disabled
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
            </div>
            <Field label="User Type" field="user_type" req className="" />
            <Field label="Phone Number" field="phone" placeholder="+231 77 000 0000" type="tel" req />
            <Field label="WhatsApp Number" field="whatsapp_number" placeholder="+231 77 000 0000 (optional)" type="tel" />
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Bio <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={form.bio} onChange={set("bio")} rows={3}
              placeholder="A short description about yourself..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none"
            />
          </div>
          {/* User type selector */}
          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">I am a <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {USER_TYPES.map(t => (
                <button key={t} type="button" onClick={() => { setForm(f => ({ ...f, user_type: t })); setErrors(e => ({ ...e, user_type: undefined })); }}
                  className={cn("px-4 py-2 rounded-xl text-sm font-semibold capitalize border transition-colors",
                    form.user_type === t ? "bg-[#1a3c8f] text-white border-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:border-[#1a3c8f]"
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1a3c8f]" /> Location Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Country" field="country" options={COUNTRIES} req />
            <Field label="County / State" field="county_state" placeholder="e.g. Montserrado, Lagos" req />
            <Field label="City / Community" field="city_community" placeholder="e.g. Monrovia, Ikeja" req />
            <Field label="Current Location" field="current_location" placeholder="e.g. Sinkor, Monrovia" req />
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">
              Address Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.address_description} onChange={set("address_description")} rows={2}
              placeholder="e.g. Behind the church on 14th Street, Sinkor"
              className={cn("w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none",
                errors.address_description ? "border-red-400" : "border-gray-200")}
            />
          </div>
        </div>

        {/* Language & Occupation */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#1a3c8f]" /> Language & Occupation
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Preferred Language" field="preferred_language" options={LANGUAGES} req />
            <Field label="Occupation / Job Title" field="occupation" placeholder="e.g. Software Engineer, Teacher" req />
            <Field label="Institution / Workplace" field="institution_workplace" placeholder="e.g. University of Liberia" />
          </div>
        </div>

        {/* Education & Career */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1a3c8f]" /> Education & Career
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Education Level" field="education_level" options={EDUCATION_LEVELS} />
            <Select label="Area of Interest" field="area_of_interest" options={AREAS} />
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Career Goal</label>
            <textarea
              value={form.career_goal} onChange={set("career_goal")} rows={2}
              placeholder="What do you want to achieve in your career?"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-sm text-gray-400">Fields marked with <span className="text-red-500">*</span> are required</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60 transition-colors text-sm"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
