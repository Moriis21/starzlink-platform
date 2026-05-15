"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/ui/Logo";
import toast from "react-hot-toast";
import { User, Phone, MapPin, GraduationCap, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfessionSearch from "@/components/ui/ProfessionSearch";
import { COUNTRY_NAMES, getStatesForCountry, getCitiesForState } from "@/lib/location-data";

const STEPS = [
  { id: 1, title: "Personal Info", icon: User, desc: "Your name and contact" },
  { id: 2, title: "Location", icon: MapPin, desc: "Where you are based" },
  { id: 3, title: "Education & Career", icon: GraduationCap, desc: "Your background" },
  { id: 4, title: "Review", icon: CheckCircle, desc: "Confirm and submit" },
];

const EDUCATION_LEVELS = [
  "Primary School", "Junior High School", "Senior High School",
  "Vocational / Technical", "Diploma", "Bachelor's Degree",
  "Master's Degree", "PhD / Doctorate", "Other"
];

const USER_TYPES = ["student", "graduate", "professional", "institution", "other"];

const AREAS_OF_INTEREST = [
  "Technology & IT", "Business & Finance", "Health & Medicine",
  "Education & Research", "Engineering", "Agriculture",
  "Arts & Creative", "Law & Policy", "Social Work", "Other"
];

interface FormData {
  full_name: string;
  gender: string;
  phone: string;
  country: string;
  county_state: string;
  city_community: string;
  address_description: string;
  user_type: string;
  education_level: string;
  institution_workplace: string;
  occupation: string;
  area_of_interest: string;
  career_goal: string;
}

export default function CompleteProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    full_name: "",
    gender: "",
    phone: "",
    country: "",
    county_state: "",
    city_community: "",
    address_description: "",
    user_type: "student",
    education_level: "",
    institution_workplace: "",
    occupation: "",
    area_of_interest: "",
    career_goal: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (user) {
      setForm(f => ({
        ...f,
        full_name: (user as any).full_name || "",
      }));
    }
  }, [user, loading]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(err => ({ ...err, [field]: undefined }));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Partial<FormData> = {};
    if (s === 1) {
      if (!form.full_name.trim()) newErrors.full_name = "Full name is required";
      if (!form.gender) newErrors.gender = "Please select your gender";
      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!/^[\d\s\+\-\(\)]{7,20}$/.test(form.phone.trim())) newErrors.phone = "Enter a valid phone number";
    }
    if (s === 2) {
      if (!form.country) newErrors.country = "Country is required";
      if (!form.county_state.trim()) newErrors.county_state = "County / State is required";
      if (!form.city_community.trim()) newErrors.city_community = "City / Community is required";
      if (!form.address_description.trim()) newErrors.address_description = "Exact location is required";
    }
    if (s === 3) {
      if (!form.user_type) newErrors.user_type = "User type is required";
      if (!form.education_level) newErrors.education_level = "Education level is required";
      if (!form.occupation) newErrors.occupation = "Occupation is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep(3)) { setStep(3); return; }
    setSaving(true);
    try {
      // Use server-side API (bypasses RLS, handles missing columns gracefully)
      const res = await fetch("/api/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user!.id,
          full_name: form.full_name.trim(),
          email: user!.email,
          gender: form.gender,
          phone: form.phone.trim(),
          country: form.country,
          county_state: form.county_state.trim(),
          city_community: form.city_community.trim(),
          address_description: form.address_description.trim(),
          user_type: form.user_type,
          education_level: form.education_level,
          occupation: form.occupation,
          institution_workplace: form.institution_workplace.trim(),
          area_of_interest: form.area_of_interest,
          career_goal: form.career_goal.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to save profile. Please try again.");
        setSaving(false);
        return;
      }

      // Store completion flag in sessionStorage so gate doesn't re-check this session
      try { sessionStorage.setItem("profileCompleted_" + user!.id, "1"); } catch {}

      toast.success("Profile completed! Welcome to StarzLink 🎉");
      // Small delay so the toast is visible before redirect
      setTimeout(() => router.replace("/dashboard"), 600);
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    }
    setSaving(false);
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1a3c8f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b4b] via-[#1a3c8f] to-[#0d1b4b] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] px-8 py-6 text-white">
          <div className="flex justify-center mb-4">
            <Logo variant="dark" size="sm" href="/" />
          </div>
          <h1 className="text-xl font-extrabold text-center mb-1">Complete Your Profile</h1>
          <p className="text-blue-200 text-sm text-center">Fill in your details to access all StarzLink features</p>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between mb-2">
              {STEPS.map(s => (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    step > s.id ? "bg-green-400 text-white" :
                    step === s.id ? "bg-white text-[#1a3c8f]" :
                    "bg-white/20 text-white/60"
                  )}>
                    {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                  </div>
                  <span className="text-[10px] text-blue-200 hidden sm:block">{s.title}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form body */}
        <div className="p-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-1 flex items-center gap-2">
            {(() => { const S = STEPS[step - 1]; return <><S.icon className="w-5 h-5 text-[#1a3c8f]" />{S.title}</> })()}
          </h2>
          <p className="text-sm text-gray-400 mb-6">{STEPS[step - 1].desc}</p>

          {/* STEP 1 — Personal */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name *</label>
                <input value={form.full_name} onChange={set("full_name")} placeholder="Enter your full name"
                  className={cn("w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]", errors.full_name ? "border-red-400" : "border-gray-200")} />
                {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
              </div>
              {/* Gender */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Gender *</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Male", "Female", "Prefer not to say", "Other"].map(g => (
                    <button key={g} type="button"
                      onClick={() => { setForm(f => ({ ...f, gender: g })); setErrors(e => ({ ...e, gender: undefined })); }}
                      className={cn("py-2.5 rounded-xl text-sm font-medium border transition-colors text-center",
                        form.gender === g ? "bg-[#1a3c8f] text-white border-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:border-[#1a3c8f]"
                      )}>
                      {g}
                    </button>
                  ))}
                </div>
                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address</label>
                <input value={user?.email || ""} disabled className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Your registered email address (cannot be changed here)</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone Number *</label>
                <input value={form.phone} onChange={set("phone")} placeholder="+231 77 000 0000" type="tel"
                  className={cn("w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]", errors.phone ? "border-red-400" : "border-gray-200")} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* STEP 2 — Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Country *</label>
                <select value={form.country} onChange={e => { setForm(f => ({ ...f, country: e.target.value, county_state: "", city_community: "" })); setErrors(er => ({ ...er, country: undefined })); }}
                  className={cn("w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white", errors.country ? "border-red-400" : "border-gray-200")}>
                  <option value="">Select your country</option>
                  {COUNTRY_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
              </div>
              {/* County/State - dynamic based on country */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">County / State *</label>
                {form.country && getStatesForCountry(form.country).length > 0 ? (
                  <select value={form.county_state}
                    onChange={e => { setForm(f => ({ ...f, county_state: e.target.value })); setErrors(er => ({ ...er, county_state: undefined })); }}
                    className={cn("w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white",
                      errors.county_state ? "border-red-400" : "border-gray-200")}>
                    <option value="">Select county / state</option>
                    {getStatesForCountry(form.country).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input value={form.county_state}
                    onChange={e => { setForm(f => ({ ...f, county_state: e.target.value })); setErrors(er => ({ ...er, county_state: undefined })); }}
                    placeholder="Enter your county or state"
                    className={cn("w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]",
                      errors.county_state ? "border-red-400" : "border-gray-200")} />
                )}
                {errors.county_state && <p className="text-xs text-red-500 mt-1">{errors.county_state}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">City / Community *</label>
                <input value={form.city_community} onChange={set("city_community")} placeholder="e.g. Monrovia, Ikeja, Accra Central"
                  className={cn("w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]", errors.city_community ? "border-red-400" : "border-gray-200")} />
                {errors.city_community && <p className="text-xs text-red-500 mt-1">{errors.city_community}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Exact Location / Address *</label>
                <textarea value={form.address_description} onChange={set("address_description")} rows={2} placeholder="e.g. Sinkor, 14th Street near the church"
                  className={cn("w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none", errors.address_description ? "border-red-400" : "border-gray-200")} />
                {errors.address_description && <p className="text-xs text-red-500 mt-1">{errors.address_description}</p>}
              </div>
            </div>
          )}

          {/* STEP 3 — Education & Career */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">I am a *</label>
                <div className="grid grid-cols-3 gap-2">
                  {USER_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => { setForm(f => ({ ...f, user_type: t })); setErrors(e => ({ ...e, user_type: undefined })); }}
                      className={cn("py-2 rounded-xl text-xs font-semibold capitalize border transition-colors",
                        form.user_type === t ? "bg-[#1a3c8f] text-white border-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:border-[#1a3c8f]"
                      )}>{t}</button>
                  ))}
                </div>
                {errors.user_type && <p className="text-xs text-red-500 mt-1">{errors.user_type}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Education Level *</label>
                <select value={form.education_level} onChange={set("education_level")}
                  className={cn("w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white", errors.education_level ? "border-red-400" : "border-gray-200")}>
                  <option value="">Select education level</option>
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.education_level && <p className="text-xs text-red-500 mt-1">{errors.education_level}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Occupation / Profession *</label>
                <ProfessionSearch
                  value={form.occupation}
                  onChange={val => { setForm(f => ({ ...f, occupation: val })); setErrors(e => ({ ...e, occupation: undefined })); }}
                  error={errors.occupation}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Institution / Workplace</label>
                <input value={form.institution_workplace} onChange={set("institution_workplace")} placeholder="e.g. University of Liberia, Tigo Liberia"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Area of Interest</label>
                <select value={form.area_of_interest} onChange={set("area_of_interest")}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white">
                  <option value="">Select area of interest</option>
                  {AREAS_OF_INTEREST.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Career Goal</label>
                <textarea value={form.career_goal} onChange={set("career_goal")} rows={2} placeholder="What do you want to achieve in your career?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" />
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Personal Information</h3>
                {[
                  { label: "Full Name", value: form.full_name },
                  { label: "Gender", value: form.gender },
                  { label: "Email", value: user?.email },
                  { label: "Phone", value: form.phone },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%] break-all">{r.value || "—"}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Location</h3>
                {[
                  { label: "Country", value: form.country },
                  { label: "County / State", value: form.county_state },
                  { label: "City / Community", value: form.city_community },
                  { label: "Address", value: form.address_description },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%] break-words">{r.value || "—"}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Education & Career</h3>
                {[
                  { label: "User Type", value: form.user_type },
                  { label: "Education Level", value: form.education_level },
                  { label: "Institution", value: form.institution_workplace },
                  { label: "Area of Interest", value: form.area_of_interest },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400">{r.label}</span>
                    <span className="font-medium text-gray-900 capitalize">{r.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={back} className="flex items-center gap-1.5 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < 4 ? (
              <button onClick={next} className="flex-1 flex items-center justify-center gap-1.5 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors text-sm">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors text-sm disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle className="w-4 h-4" /> Complete Profile</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
