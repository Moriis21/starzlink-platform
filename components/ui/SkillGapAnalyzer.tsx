"use client";

import { useState } from "react";
import { Zap, BookOpen, PlayCircle, ExternalLink, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  opportunityId: string;
  opportunityType: string;
  opportunityTitle: string;
  requirements?: string;
  description?: string;
}

type Recommendation = { skill: string; resource: string; url: string; type: string };

export default function SkillGapAnalyzer({ opportunityId, opportunityType, opportunityTitle, requirements, description }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ required_skills: string[]; missing_skills: string[]; match_percentage: number; recommendations: Recommendation[] } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true); setError(""); setExpanded(true);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId, opportunityType, opportunityTitle,
          requirements: requirements || description || "",
          userSkills: [], // Could be fetched from profile
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.analysis) setResult(data.analysis);
      else setError("Could not analyze. Try again.");
    } catch { setError("Analysis failed. Check your connection."); }
    setLoading(false);
  };

  const matchColor = !result ? "" : result.match_percentage >= 80 ? "text-green-600" : result.match_percentage >= 60 ? "text-yellow-600" : "text-red-500";
  const matchBg = !result ? "" : result.match_percentage >= 80 ? "bg-green-50 border-green-200" : result.match_percentage >= 60 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => result ? setExpanded(!expanded) : analyze()}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><Zap className="w-5 h-5 text-[#1a3c8f]" /></div>
          <div className="text-left">
            <p className="font-bold text-gray-800 text-sm">Skill Match Analysis</p>
            <p className="text-xs text-gray-500">{result ? `${result.match_percentage}% match · ${result.missing_skills.length} skills to learn` : "Check how well you match this opportunity"}</p>
          </div>
        </div>
        {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#1a3c8f]" />
          : result ? (expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />)
          : <span className="text-xs font-bold text-[#1a3c8f] bg-blue-50 px-3 py-1 rounded-full">Analyze</span>}
      </button>

      {error && <div className="px-5 pb-4 flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{error}</div>}

      {result && expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          {/* Match score */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${matchBg}`}>
            <div>
              <p className="text-sm font-semibold text-gray-700">Your Match Score</p>
              <p className="text-xs text-gray-500 mt-0.5">{result.match_percentage >= 80 ? "Strong match — you're well suited!" : result.match_percentage >= 60 ? "Good match — a few skills to build" : "Low match — focus on building key skills"}</p>
            </div>
            <div className={`text-3xl font-extrabold ${matchColor}`}>{result.match_percentage}%</div>
          </div>

          {/* Required skills */}
          {result.required_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {result.required_skills.map(skill => {
                  const isMissing = result.missing_skills.includes(skill);
                  return (
                    <span key={skill} className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${isMissing ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                      {isMissing ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}{skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Missing skills + recommendations */}
          {result.missing_skills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Skills to Learn ({result.missing_skills.length})</p>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      {rec.type === "youtube" ? <PlayCircle className="w-4 h-4 text-red-500 flex-shrink-0" /> : <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{rec.skill}</p>
                        <p className="text-xs text-gray-500">{rec.resource}</p>
                      </div>
                    </div>
                    <a href={rec.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-[#1a3c8f] bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 whitespace-nowrap flex-shrink-0">
                      Learn Now <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.missing_skills.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl p-3">
              <CheckCircle className="w-4 h-4" /> You meet all the required skills for this opportunity!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
