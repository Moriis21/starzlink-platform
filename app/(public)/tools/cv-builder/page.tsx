"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { pointsApi } from "@/lib/api";
import { ChevronRight, ChevronLeft, Download, User, GraduationCap, Briefcase, Star } from "lucide-react";
import toast from "react-hot-toast";

interface Education { institution: string; degree: string; field: string; year: string; gpa: string; }
interface Experience { company: string; role: string; startDate: string; endDate: string; description: string; }
interface CVData {
  name: string; email: string; phone: string; location: string; objective: string;
  education: Education[];
  experience: Experience[];
  skills: string; languages: string; certifications: string; achievements: string;
}

const defaultCV: CVData = {
  name: "", email: "", phone: "", location: "", objective: "",
  education: [{ institution: "", degree: "", field: "", year: "", gpa: "" }, { institution: "", degree: "", field: "", year: "", gpa: "" }, { institution: "", degree: "", field: "", year: "", gpa: "" }],
  experience: [{ company: "", role: "", startDate: "", endDate: "", description: "" }, { company: "", role: "", startDate: "", endDate: "", description: "" }, { company: "", role: "", startDate: "", endDate: "", description: "" }],
  skills: "", languages: "", certifications: "", achievements: "",
};

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Education", icon: GraduationCap },
  { label: "Experience", icon: Briefcase },
  { label: "Skills & Extras", icon: Star },
];

export default function CVBuilderPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [cv, setCV] = useState<CVData>(defaultCV);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("starzlink_cv");
    if (saved) { try { setCV(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem("starzlink_cv", JSON.stringify(cv));
  }, [cv]);

  const setField = (key: keyof CVData, val: any) => setCV(c => ({ ...c, [key]: val }));
  const setEdu = (i: number, key: keyof Education, val: string) => setCV(c => ({ ...c, education: c.education.map((e, idx) => idx === i ? { ...e, [key]: val } : e) }));
  const setExp = (i: number, key: keyof Experience, val: string) => setCV(c => ({ ...c, experience: c.experience.map((e, idx) => idx === i ? { ...e, [key]: val } : e) }));

  const input = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]";

  const handleDownload = async () => {
    if (user && !pointsAwarded) {
      await pointsApi.addPoints(user.id, "cv_download", 20, "Downloaded CV from CV Builder");
      setPointsAwarded(true);
      toast.success("CV downloaded! You earned 20 points.");
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@media print { body > *:not(#cv-print-target) { display: none !important; } #cv-print-target { display: block !important; } }`}</style>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white text-center">
        <h1 className="text-4xl font-extrabold mb-2">CV Builder</h1>
        <p className="text-white/80 text-lg">Build a professional CV in minutes — free, no sign-up required.</p>
        {user && <p className="text-blue-300 text-sm mt-2">Complete and download to earn 20 points!</p>}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 print:hidden">
        {/* Step indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <button onClick={() => setStep(i)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === step ? "bg-[#1a3c8f] text-white" : i < step ? "bg-green-100 text-green-700" : "bg-white text-gray-500 border border-gray-200"}`}>
                    <Icon className="w-4 h-4" /> {s.label}
                  </button>
                  {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {step === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-xl mb-5">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name *</label><input value={cv.name} onChange={e => setField("name", e.target.value)} placeholder="John Doe" className={input} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Email *</label><input type="email" value={cv.email} onChange={e => setField("email", e.target.value)} placeholder="john@example.com" className={input} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label><input value={cv.phone} onChange={e => setField("phone", e.target.value)} placeholder="+231 77 000 0000" className={input} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1.5">Location</label><input value={cv.location} onChange={e => setField("location", e.target.value)} placeholder="Monrovia, Liberia" className={input} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1.5">Professional Summary / Objective</label><textarea value={cv.objective} onChange={e => setField("objective", e.target.value)} rows={4} placeholder="A motivated professional with..." className={`${input} resize-none`} /></div>
            </div>
          </div>
        )}

        {/* Step 2: Education */}
        {step === 1 && (
          <div className="space-y-4">
            {cv.education.map((edu, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Education #{i + 1}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1.5">Institution</label><input value={edu.institution} onChange={e => setEdu(i, "institution", e.target.value)} placeholder="University of Liberia" className={input} /></div>
                  <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Degree</label><input value={edu.degree} onChange={e => setEdu(i, "degree", e.target.value)} placeholder="Bachelor of Science" className={input} /></div>
                  <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Field of Study</label><input value={edu.field} onChange={e => setEdu(i, "field", e.target.value)} placeholder="Computer Science" className={input} /></div>
                  <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Graduation Year</label><input value={edu.year} onChange={e => setEdu(i, "year", e.target.value)} placeholder="2025" className={input} /></div>
                  <div><label className="text-sm font-medium text-gray-700 block mb-1.5">GPA (optional)</label><input value={edu.gpa} onChange={e => setEdu(i, "gpa", e.target.value)} placeholder="3.8 / 4.0" className={input} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Experience */}
        {step === 2 && (
          <div className="space-y-4">
            {cv.experience.map((exp, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Experience #{i + 1}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Company / Organization</label><input value={exp.company} onChange={e => setExp(i, "company", e.target.value)} placeholder="Company Name" className={input} /></div>
                  <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Role / Title</label><input value={exp.role} onChange={e => setExp(i, "role", e.target.value)} placeholder="Software Developer" className={input} /></div>
                  <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Start Date</label><input value={exp.startDate} onChange={e => setExp(i, "startDate", e.target.value)} placeholder="Jan 2023" className={input} /></div>
                  <div><label className="text-sm font-medium text-gray-700 block mb-1.5">End Date</label><input value={exp.endDate} onChange={e => setExp(i, "endDate", e.target.value)} placeholder="Dec 2023 or Present" className={input} /></div>
                  <div className="sm:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label><textarea value={exp.description} onChange={e => setExp(i, "description", e.target.value)} rows={3} placeholder="Describe your key responsibilities and achievements..." className={`${input} resize-none`} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Skills */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-xl mb-5">Skills & Additional Info</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1.5">Technical Skills (comma-separated)</label><input value={cv.skills} onChange={e => setField("skills", e.target.value)} placeholder="JavaScript, Python, Excel, Canva..." className={input} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Languages</label><input value={cv.languages} onChange={e => setField("languages", e.target.value)} placeholder="English (Fluent), French (Basic)" className={input} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Certifications</label><input value={cv.certifications} onChange={e => setField("certifications", e.target.value)} placeholder="Google Analytics, AWS Cloud..." className={input} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1.5">Achievements / Awards</label><textarea value={cv.achievements} onChange={e => setField("achievements", e.target.value)} rows={3} placeholder="Dean's List 2024, Winner of National Hackathon..." className={`${input} resize-none`} /></div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} className="flex items-center gap-2 px-6 py-3 bg-[#1a3c8f] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" /> Download CV
            </button>
          )}
        </div>

        {/* CV Preview */}
        {step === 3 && (
          <div className="mt-8 bg-white rounded-2xl border-2 border-[#1a3c8f]/20 shadow-sm p-1">
            <div className="text-center mb-2 text-xs text-gray-400 pt-2">CV Preview</div>
            <CVPreview cv={cv} />
          </div>
        )}
      </div>

      {/* Print-only CV */}
      <div id="cv-print-target" className="hidden print:block">
        <CVPreview cv={cv} />
      </div>
    </div>
  );
}

function CVPreview({ cv }: { cv: CVData }) {
  return (
    <div className="max-w-3xl mx-auto p-8 font-serif text-gray-900 bg-white">
      <div className="border-b-4 border-[#1a3c8f] pb-4 mb-6">
        <h1 className="text-3xl font-extrabold text-[#0d1b4b] tracking-tight">{cv.name || "Your Name"}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
          {cv.email && <span>{cv.email}</span>}
          {cv.phone && <span>{cv.phone}</span>}
          {cv.location && <span>{cv.location}</span>}
        </div>
      </div>

      {cv.objective && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-[#1a3c8f] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2">Professional Summary</h2>
          <p className="text-sm leading-relaxed">{cv.objective}</p>
        </section>
      )}

      {cv.education.some(e => e.institution) && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-[#1a3c8f] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2">Education</h2>
          {cv.education.filter(e => e.institution).map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <p className="font-bold">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                <span className="text-sm text-gray-500">{edu.year}</span>
              </div>
              <p className="text-sm text-gray-700">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</p>
            </div>
          ))}
        </section>
      )}

      {cv.experience.some(e => e.company) && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-[#1a3c8f] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2">Experience</h2>
          {cv.experience.filter(e => e.company).map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <p className="font-bold">{exp.role}</p>
                <span className="text-sm text-gray-500">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ""}</span>
              </div>
              <p className="text-sm text-[#1a3c8f] mb-1">{exp.company}</p>
              {exp.description && <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </section>
      )}

      {cv.skills && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-[#1a3c8f] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {cv.skills.split(",").map(s => s.trim()).filter(Boolean).map(skill => (
              <span key={skill} className="text-xs bg-blue-50 text-[#1a3c8f] px-3 py-1 rounded-full border border-blue-100">{skill}</span>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-6">
        {cv.languages && (
          <section>
            <h2 className="text-base font-bold text-[#1a3c8f] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2">Languages</h2>
            <p className="text-sm">{cv.languages}</p>
          </section>
        )}
        {cv.certifications && (
          <section>
            <h2 className="text-base font-bold text-[#1a3c8f] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2">Certifications</h2>
            <p className="text-sm">{cv.certifications}</p>
          </section>
        )}
      </div>

      {cv.achievements && (
        <section className="mt-4">
          <h2 className="text-base font-bold text-[#1a3c8f] uppercase tracking-wide border-b border-gray-200 pb-1 mb-2">Achievements</h2>
          <p className="text-sm">{cv.achievements}</p>
        </section>
      )}
    </div>
  );
}
