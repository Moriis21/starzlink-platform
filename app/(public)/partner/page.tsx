"use client";

import { useState } from "react";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";
import {
  Building2, CheckCircle2, ChevronRight, Globe, GraduationCap, Handshake,
  Heart, Loader2, Mail, MapPin, Phone, Send, Shield, Star, TrendingUp, Users, X
} from "lucide-react";

const partnerTypes = [
  { value: "university", label: "University / College" },
  { value: "ngo", label: "NGO / Non-Profit" },
  { value: "government", label: "Government Agency" },
  { value: "corporate", label: "Corporate / Company" },
  { value: "media", label: "Media Organization" },
  { value: "other", label: "Other" },
];

const partnershipGoals = [
  "Post job opportunities for our students/graduates",
  "Offer scholarships through StarzLink",
  "Promote training programs and workshops",
  "Share campus news and announcements",
  "Co-host events and career fairs",
  "Increase visibility and brand awareness",
  "Access our talent network",
  "Other",
];

const reachOptions = ["Under 500", "500–2,000", "2,001–10,000", "10,001–50,000", "50,000+"];

const benefits = [
  { icon: Users, title: "50,000+ Active Users", desc: "Reach students, graduates and professionals across Liberia and beyond." },
  { icon: Globe, title: "Wide Digital Reach", desc: "Get featured on our platform, WhatsApp channel, and social media." },
  { icon: TrendingUp, title: "Grow Your Impact", desc: "Connect your programs directly with motivated, talented individuals." },
  { icon: Shield, title: "Trusted Platform", desc: "Associate your brand with a verified, trusted opportunities hub." },
  { icon: Star, title: "Featured Partner Status", desc: "Your logo featured prominently on our website and materials." },
  { icon: Heart, title: "Community Mission", desc: "Join us in empowering youth and building a better future." },
];

interface FormState {
  org_name: string;
  org_type: string;
  website: string;
  country: string;
  city: string;
  contact_name: string;
  contact_title: string;
  contact_email: string;
  contact_phone: string;
  audience_size: string;
  partnership_goals: string[];
  goals_other: string;
  existing_programs: string;
  how_heard: string;
  additional_info: string;
  agreed: boolean;
}

const blank: FormState = {
  org_name: "", org_type: "", website: "", country: "Liberia", city: "",
  contact_name: "", contact_title: "", contact_email: "", contact_phone: "",
  audience_size: "", partnership_goals: [], goals_other: "",
  existing_programs: "", how_heard: "", additional_info: "", agreed: false,
};

export default function PartnerPage() {
  const [form, setForm] = useState<FormState>(blank);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleGoal = (g: string) =>
    set("partnership_goals", form.partnership_goals.includes(g)
      ? form.partnership_goals.filter(x => x !== g)
      : [...form.partnership_goals, g]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed) { toast.error("Please agree to the terms."); return; }
    if (form.partnership_goals.length === 0) { toast.error("Select at least one partnership goal."); return; }

    setSubmitting(true);
    try {
      await insforge.database.from("submissions").insert({
        type: "partnership",
        status: "pending",
        full_name: form.contact_name,
        email: form.contact_email,
        phone: form.contact_phone,
        institution: form.org_name,
        update_title: `Partnership Request: ${form.org_name}`,
        update_description: JSON.stringify({
          org_type: form.org_type,
          website: form.website,
          country: form.country,
          city: form.city,
          contact_title: form.contact_title,
          audience_size: form.audience_size,
          partnership_goals: form.partnership_goals,
          goals_other: form.goals_other,
          existing_programs: form.existing_programs,
          how_heard: form.how_heard,
          additional_info: form.additional_info,
        }),
        submitted_at: new Date().toISOString(),
      });
      setDone(true);
    } catch {
      toast.error("Failed to submit. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-16 px-4 text-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">PARTNERSHIP PROGRAMME</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Partner With<br /><span className="text-blue-300">StarzLink</span>
            </h1>
            <p className="text-blue-200 text-lg mb-6 leading-relaxed">
              Join our growing network of universities, NGOs, companies and institutions empowering students and professionals across Liberia and beyond.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#form" className="flex items-center gap-2 bg-white text-[#0d1b4b] font-bold px-6 py-3 rounded-xl hover:bg-blue-50">
                Apply to Partner <ChevronRight className="w-4 h-4" />
              </a>
              <Link href="/contact" className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25">
                Contact Us First
              </Link>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {benefits.slice(0, 4).map(b => (
              <div key={b.title} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                <b.icon className="w-6 h-6 text-blue-300 mb-2" />
                <p className="font-bold text-sm mb-1">{b.title}</p>
                <p className="text-blue-200 text-xs">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> › <Link href="/about">About</Link> › <span className="text-gray-900">Partner With Us</span>
      </div>

      {/* Benefits strip */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Why Partner With StarzLink?</h2>
            <p className="text-gray-500 text-sm mt-2">Join over 12 institutions already benefiting from our network</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {benefits.map(b => (
              <div key={b.title} className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <b.icon className="w-6 h-6 text-[#1a3c8f]" />
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{b.title}</p>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      {done ? (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Application Received!</h2>
            <p className="text-gray-500 mb-2">
              Thank you, <strong>{form.contact_name}</strong>! Your partnership application from <strong>{form.org_name}</strong> has been received.
            </p>
            <p className="text-gray-500 mb-6">Our team will review your application and reach out within <strong>3–5 business days</strong> to discuss next steps.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/" className="bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900">Back to Home</Link>
              <Link href="/contact" className="border border-gray-200 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-50">Contact Us</Link>
            </div>
          </div>
        </section>
      ) : (
        <section id="form" className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] p-6 text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg">Partnership Application Form</h2>
                  <p className="text-blue-200 text-sm">Fill out the form below and we'll be in touch</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8">

                {/* Section 1: Organisation */}
                <div>
                  <h3 className="font-extrabold text-gray-900 mb-1 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#1a3c8f]" /> Organisation Information</h3>
                  <p className="text-xs text-gray-400 mb-4">Tell us about your institution or company.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Organisation / Institution Name <span className="text-red-500">*</span></label>
                      <input value={form.org_name} onChange={e => set("org_name", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="e.g. University of Liberia" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Organisation Type <span className="text-red-500">*</span></label>
                      <select value={form.org_type} onChange={e => set("org_type", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                        <option value="">Select type</option>
                        {partnerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Website</label>
                      <input type="url" value={form.website} onChange={e => set("website", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Country <span className="text-red-500">*</span></label>
                      <input value={form.country} onChange={e => set("country", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">City / County</label>
                      <input value={form.city} onChange={e => set("city", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="e.g. Monrovia" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Estimated Audience / Reach</label>
                      <select value={form.audience_size} onChange={e => set("audience_size", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                        <option value="">Select range</option>
                        {reachOptions.map(r => <option key={r} value={r}>{r} people</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact */}
                <div>
                  <h3 className="font-extrabold text-gray-900 mb-1 flex items-center gap-2"><Users className="w-4 h-4 text-[#1a3c8f]" /> Primary Contact Person</h3>
                  <p className="text-xs text-gray-400 mb-4">Who should we contact to discuss the partnership?</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input value={form.contact_name} onChange={e => set("contact_name", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="First and last name" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Job Title / Role</label>
                      <input value={form.contact_title} onChange={e => set("contact_title", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="e.g. Director of Partnerships" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="your@email.com" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                      <input type="tel" value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="+231 ..." />
                    </div>
                  </div>
                </div>

                {/* Section 3: Goals */}
                <div>
                  <h3 className="font-extrabold text-gray-900 mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#1a3c8f]" /> Partnership Goals</h3>
                  <p className="text-xs text-gray-400 mb-4">What do you hope to achieve through this partnership? (Select all that apply)</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {partnershipGoals.map(goal => (
                      <label key={goal} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.partnership_goals.includes(goal) ? "bg-blue-50 border-[#1a3c8f]" : "border-gray-200 hover:bg-gray-50"}`}>
                        <input
                          type="checkbox"
                          checked={form.partnership_goals.includes(goal)}
                          onChange={() => toggleGoal(goal)}
                          className="w-4 h-4 mt-0.5 accent-[#1a3c8f] flex-shrink-0"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                  {form.partnership_goals.includes("Other") && (
                    <div className="mt-3">
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Please describe</label>
                      <input value={form.goals_other} onChange={e => set("goals_other", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="Describe your goal…" />
                    </div>
                  )}
                </div>

                {/* Section 4: Programs */}
                <div>
                  <h3 className="font-extrabold text-gray-900 mb-1">Existing Programs or Offerings</h3>
                  <p className="text-xs text-gray-400 mb-3">Do you have scholarships, job programs, or training opportunities you'd like to feature on StarzLink?</p>
                  <div className="flex gap-3 mb-3">
                    {["Yes, we have existing programs", "No, but we plan to create some", "We are still exploring options"].map(opt => (
                      <label key={opt} className={`flex-1 flex items-center gap-2 p-3 border rounded-xl cursor-pointer text-xs transition-colors ${form.existing_programs === opt ? "bg-blue-50 border-[#1a3c8f] font-semibold text-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                        <input type="radio" name="existing" checked={form.existing_programs === opt} onChange={() => set("existing_programs", opt)} className="accent-[#1a3c8f]" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section 5: How heard */}
                <div>
                  <h3 className="font-extrabold text-gray-900 mb-3">How Did You Hear About StarzLink?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Social Media", "Word of Mouth", "Google Search", "Event / Conference", "Partner Referral", "Other"].map(opt => (
                      <label key={opt} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer text-sm transition-colors ${form.how_heard === opt ? "bg-blue-50 border-[#1a3c8f] font-semibold text-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                        <input type="radio" name="how_heard" checked={form.how_heard === opt} onChange={() => set("how_heard", opt)} className="accent-[#1a3c8f]" />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Section 6: Additional info */}
                <div>
                  <h3 className="font-extrabold text-gray-900 mb-3">Anything Else You'd Like Us to Know?</h3>
                  <textarea value={form.additional_info} onChange={e => set("additional_info", e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" placeholder="Any additional information, questions, or special requirements about your partnership…" />
                </div>

                {/* Agreement */}
                <label className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 cursor-pointer">
                  <input type="checkbox" checked={form.agreed} onChange={e => set("agreed", e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#1a3c8f]" />
                  <span className="text-sm text-gray-700">
                    I confirm that the information provided is accurate and I agree to StarzLink's{" "}
                    <Link href="/terms" target="_blank" className="text-[#1a3c8f] font-semibold hover:underline">Terms of Use</Link>{" "}
                    and{" "}
                    <Link href="/privacy" target="_blank" className="text-[#1a3c8f] font-semibold hover:underline">Privacy Policy</Link>.
                    I understand that submitting this form initiates the partnership review process.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || !form.agreed || form.partnership_goals.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-4 rounded-xl hover:bg-blue-900 disabled:opacity-60 transition-colors text-base"
                >
                  {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <><Send className="w-5 h-5" /> Submit Partnership Application</>}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
