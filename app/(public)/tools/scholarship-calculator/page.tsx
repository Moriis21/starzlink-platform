"use client";

import { useState } from "react";
import { scholarshipsApi } from "@/lib/api";
import { Calculator, Star, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

const FIELDS_OF_STUDY = [
  "Computer Science", "Engineering", "Medicine & Health", "Business & Management",
  "Law", "Education", "Agriculture", "Environmental Science", "Arts & Humanities",
  "Social Sciences", "Mathematics", "Physics", "Chemistry", "Architecture", "Other",
];

interface Profile {
  gpa: string;
  gpaScale: "4.0" | "100";
  academicLevel: string;
  fieldOfStudy: string;
  nationality: "Liberian" | "International";
  financialNeed: boolean;
  leadership: boolean;
  ageRange: string;
}

const SCORE_WEIGHTS = {
  gpa: 30, level: 20, field: 15, nationality: 15, financialNeed: 10, leadership: 10,
};

export default function ScholarshipCalculatorPage() {
  const [profile, setProfile] = useState<Profile>({
    gpa: "", gpaScale: "4.0", academicLevel: "", fieldOfStudy: "", nationality: "Liberian",
    financialNeed: false, leadership: false, ageRange: "",
  });
  const [result, setResult] = useState<null | { score: number; tips: string[]; eligible: string[] }>(null);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof Profile, val: any) => setProfile(p => ({ ...p, [key]: val }));

  const calculate = async () => {
    if (!profile.gpa || !profile.academicLevel || !profile.fieldOfStudy) {
      return;
    }
    setLoading(true);

    // Calculate score
    let score = 0;
    const tips: string[] = [];

    // GPA scoring
    const gpa = parseFloat(profile.gpa);
    const normalizedGpa = profile.gpaScale === "4.0" ? gpa / 4 : gpa / 100;
    if (normalizedGpa >= 0.9) score += 30;
    else if (normalizedGpa >= 0.8) score += 22;
    else if (normalizedGpa >= 0.7) score += 15;
    else { score += 5; tips.push("Improving your GPA to above 3.0/4.0 will significantly increase your eligibility."); }

    // Level
    if (profile.academicLevel === "PhD") score += 20;
    else if (profile.academicLevel === "Masters") score += 16;
    else { score += 12; }

    // Field
    const highDemandFields = ["Computer Science", "Engineering", "Medicine & Health", "Environmental Science"];
    if (highDemandFields.includes(profile.fieldOfStudy)) score += 15;
    else score += 10;

    // Nationality
    if (profile.nationality === "Liberian") score += 15;
    else score += 8;

    // Financial need
    if (profile.financialNeed) score += 10;
    else tips.push("Many scholarships prioritize students with demonstrated financial need.");

    // Leadership
    if (profile.leadership) score += 10;
    else tips.push("Participate in leadership activities — clubs, volunteering, community projects — to boost your profile.");

    // Tips
    if (score < 50) tips.push("Consider applying to smaller, local scholarships while building your profile.");
    if (!profile.leadership) tips.push("Leadership experience can add 10+ points to your scholarship match score.");

    // Eligible scholarship types
    const eligible: string[] = [];
    if (normalizedGpa >= 0.8) eligible.push("Merit-Based Scholarships");
    if (profile.financialNeed) eligible.push("Need-Based Grants");
    if (profile.nationality === "Liberian") eligible.push("Liberia Government Scholarships", "USAID Liberia Programs");
    if (profile.academicLevel === "Masters" || profile.academicLevel === "PhD") eligible.push("Graduate Research Fellowships");
    if (highDemandFields.includes(profile.fieldOfStudy)) eligible.push("STEM Scholarships");
    if (profile.leadership) eligible.push("Leadership & Community Scholarships");
    eligible.push("StarzLink Partner Scholarships");

    setResult({ score: Math.min(100, score), tips, eligible });

    // Fetch matching scholarships from DB
    const res = await scholarshipsApi.getAll({ status: "active", limit: "3" });
    setScholarships(res.data?.data ?? []);
    setLoading(false);
  };

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white";

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-16 px-4 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-2">Scholarship Calculator</h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto">Find out which scholarships you're eligible for based on your profile.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Your Academic Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Academic Level *</label>
                <select value={profile.academicLevel} onChange={e => set("academicLevel", e.target.value)} className={inp}>
                  <option value="">Select your level</option>
                  <option>Undergraduate</option>
                  <option>Masters</option>
                  <option>PhD</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Field of Study *</label>
                <select value={profile.fieldOfStudy} onChange={e => set("fieldOfStudy", e.target.value)} className={inp}>
                  <option value="">Select your field</option>
                  {FIELDS_OF_STUDY.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">GPA / Grade *</label>
                <div className="flex gap-2">
                  <input type="number" step="0.01" value={profile.gpa} onChange={e => set("gpa", e.target.value)}
                    placeholder={profile.gpaScale === "4.0" ? "e.g. 3.7" : "e.g. 87"}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                  <select value={profile.gpaScale} onChange={e => set("gpaScale", e.target.value as any)} className="border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none bg-white">
                    <option value="4.0">/ 4.0</option>
                    <option value="100">/ 100</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Age Range</label>
                <select value={profile.ageRange} onChange={e => set("ageRange", e.target.value)} className={inp}>
                  <option value="">Select age range</option>
                  <option>Under 20</option>
                  <option>20-25</option>
                  <option>26-30</option>
                  <option>Over 30</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Nationality</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Liberian", "International"] as const).map(n => (
                    <button key={n} type="button" onClick={() => set("nationality", n)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-colors border ${profile.nationality === n ? "bg-[#1a3c8f] text-white border-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:border-[#1a3c8f]"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="fn" checked={profile.financialNeed} onChange={e => set("financialNeed", e.target.checked)} className="w-4 h-4 accent-[#1a3c8f]" />
                  <label htmlFor="fn" className="text-sm text-gray-700">I have demonstrated financial need</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="lead" checked={profile.leadership} onChange={e => set("leadership", e.target.checked)} className="w-4 h-4 accent-[#1a3c8f]" />
                  <label htmlFor="lead" className="text-sm text-gray-700">I have leadership / community experience</label>
                </div>
              </div>
            </div>
          </div>

          <button onClick={calculate} disabled={loading || !profile.gpa || !profile.academicLevel || !profile.fieldOfStudy}
            className="w-full bg-[#1a3c8f] text-white font-bold py-4 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
            <Calculator className="w-5 h-5" /> {loading ? "Calculating..." : "Calculate My Match Score"}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-5">
          {result ? (
            <>
              {/* Score */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Your Match Score</h2>
                <div className="relative w-36 h-36 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                      stroke={result.score >= 70 ? "#16a34a" : result.score >= 50 ? "#f59e0b" : "#dc2626"}
                      strokeWidth="3" strokeDasharray={`${result.score}, 100`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-gray-900">{result.score}</span>
                    <span className="text-sm text-gray-500">/ 100</span>
                  </div>
                </div>
                <p className={`font-bold text-lg ${result.score >= 70 ? "text-green-600" : result.score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                  {result.score >= 70 ? "Excellent Match" : result.score >= 50 ? "Good Match" : "Build Your Profile"}
                </p>
              </div>

              {/* Eligible for */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> You May Be Eligible For</h3>
                <ul className="space-y-2">
                  {result.eligible.map(e => (
                    <li key={e} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" /> {e}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
                  <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Tips to Improve</h3>
                  <ul className="space-y-2">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Matching scholarships */}
              {scholarships.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /> Recommended Scholarships</h3>
                  <div className="space-y-3">
                    {scholarships.map(s => (
                      <div key={s.id} className="border border-gray-100 rounded-xl p-3 hover:border-[#1a3c8f] transition-colors">
                        <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                        <p className="text-xs text-gray-500">{s.provider ?? s.organization}</p>
                        {s.deadline && <p className="text-xs text-red-500 mt-1">Deadline: {new Date(s.deadline).toLocaleDateString()}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Calculator className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-gray-700 mb-2">Fill Your Profile</h3>
              <p className="text-gray-400 text-sm">Complete the form on the left and click Calculate to see your scholarship match score.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
