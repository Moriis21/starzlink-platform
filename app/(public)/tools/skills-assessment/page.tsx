"use client";

import { useState, useEffect, useRef } from "react";
import { Trophy, CheckCircle, XCircle, Clock, Star, Loader2, ChevronRight, Award, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

type Assessment = { id: string; skill_name: string; category: string; description: string; pass_mark: number; time_limit_minutes: number };
type Question = { id: string; question: string; options: string[]; sort_order: number; explanation?: string };
type Result = { assessment_id: string; score: number; passed: boolean; created_at: string };

export default function SkillsAssessmentPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [filterCat, setFilterCat] = useState("All");

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/skills-assessment?${user ? `userId=${user.id}` : ""}`);
      const data = await res.json();
      setAssessments(data.assessments || []);
      setVerifiedSkills(data.verifiedSkills || []);
      setResults(data.results || []);
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    if (timeLeft <= 0) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current!); submitQuiz(); return 0; } return t - 1; }), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft > 0 && !submitted]);

  const startAssessment = async (a: Assessment) => {
    if (!user) { toast.error("Please sign in to take assessments."); return; }
    setQuizLoading(true);
    const res = await fetch(`/api/skills-assessment?id=${a.id}&userId=${user?.id}`);
    const data = await res.json();
    setActiveAssessment(a);
    setQuestions(data.questions || []);
    setAnswers({});
    setSubmitted(false);
    setQuizResult(null);
    const seconds = (a.time_limit_minutes || 10) * 60;
    setTimeLeft(seconds);
    setStartTime(Date.now());
    setQuizLoading(false);
  };

  const submitQuiz = async () => {
    if (!activeAssessment || !user) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizLoading(true);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const answersArr = questions.map(q => ({ questionId: q.id, answer: answers[q.id] ?? -1 }));
    try {
      const res = await fetch("/api/skills-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, assessmentId: activeAssessment.id, answers: answersArr, timeTaken }),
      });
      const data = await res.json();
      setQuizResult(data);
      setSubmitted(true);
      if (data.passed) {
        setVerifiedSkills(prev => [...prev.filter(s => s !== data.skillName), data.skillName]);
        toast.success(`🎉 Skill verified! You earned "${data.skillName}" badge.`);
      }
    } catch { toast.error("Failed to submit quiz."); }
    setQuizLoading(false);
  };

  const categories = ["All", ...Array.from(new Set(assessments.map(a => a.category)))];
  const filtered = filterCat === "All" ? assessments : assessments.filter(a => a.category === filterCat);
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#1a3c8f]" /></div>;

  // Quiz view
  if (activeAssessment && !submitted) return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] px-4 py-6 text-white">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div><h2 className="font-extrabold text-lg">{activeAssessment.skill_name} Assessment</h2><p className="text-blue-200 text-sm">{questions.length} questions · Pass: {activeAssessment.pass_mark}%</p></div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-xl ${timeLeft < 60 ? "bg-red-500" : "bg-white/10"}`}>
            <Clock className="w-5 h-5" />{formatTime(timeLeft)}
          </div>
        </div>
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-1.5 bg-white/20 rounded-full">
            <div className="h-1.5 bg-yellow-400 rounded-full transition-all" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} />
          </div>
          <p className="text-xs text-blue-200 mt-1">{Object.keys(answers).length} / {questions.length} answered</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="font-semibold text-gray-800 mb-4">{qi + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${answers[q.id] === oi ? "border-[#1a3c8f] bg-blue-50 font-semibold text-[#1a3c8f]" : "border-gray-100 hover:border-gray-200 text-gray-700"}`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span> {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={submitQuiz} disabled={quizLoading || Object.keys(answers).length < questions.length}
          className="w-full bg-[#1a3c8f] text-white font-bold py-4 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base">
          {quizLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
          {quizLoading ? "Submitting..." : Object.keys(answers).length < questions.length ? `Answer all questions (${Object.keys(answers).length}/${questions.length})` : "Submit Answers"}
        </button>
      </div>
    </div>
  );

  // Result view
  if (submitted && quizResult) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${quizResult.passed ? "bg-green-100" : "bg-red-50"}`}>
          {quizResult.passed ? <Trophy className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-400" />}
        </div>
        <h2 className="text-2xl font-extrabold mb-1">{quizResult.passed ? "🎉 Skill Verified!" : "Not Passed"}</h2>
        <p className="text-gray-500 mb-4">{quizResult.passed ? `You've earned the "${quizResult.skillName}" verified badge!` : `You scored ${quizResult.score}%. Required: ${activeAssessment?.pass_mark}%.`}</p>
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <div className="text-4xl font-black text-[#1a3c8f] mb-1">{quizResult.score}%</div>
          <p className="text-sm text-gray-500">{quizResult.correct} of {quizResult.total} correct</p>
        </div>
        {quizResult.passed && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Award className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div className="text-left"><p className="font-bold text-green-800">{quizResult.skillName}</p><p className="text-xs text-green-600">Verified Badge — visible on your profile</p></div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button onClick={() => { setActiveAssessment(null); setSubmitted(false); setQuizResult(null); }}
            className="w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900">Back to Assessments</button>
          {!quizResult.passed && (
            <button onClick={() => startAssessment(activeAssessment!)}
              className="w-full flex items-center justify-center gap-2 border-2 border-[#1a3c8f] text-[#1a3c8f] font-bold py-3 rounded-xl hover:bg-blue-50">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-12 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trophy className="w-7 h-7 text-yellow-300" /></div>
          <h1 className="text-3xl font-extrabold mb-2">Skills Assessment</h1>
          <p className="text-blue-200">Take short quizzes to verify your skills and earn badges for your profile.</p>
          {verifiedSkills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {verifiedSkills.map(s => (
                <span key={s} className="flex items-center gap-1 bg-green-500/20 border border-green-400/30 text-green-200 px-3 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified: {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterCat === c ? "bg-[#1a3c8f] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#1a3c8f]"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(a => {
            const isVerified = verifiedSkills.includes(a.skill_name);
            const userResult = results.find(r => r.assessment_id === a.id);
            return (
              <div key={a.id} className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-all ${isVerified ? "border-green-200" : "border-gray-100"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{a.skill_name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1 inline-block">{a.category}</span>
                  </div>
                  {isVerified && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{a.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{a.time_limit_minutes} min</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />Pass: {a.pass_mark}%</span>
                  {userResult && <span className="text-[#1a3c8f] font-medium">Best: {userResult.score}%</span>}
                </div>
                <button onClick={() => startAssessment(a)} disabled={quizLoading}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${isVerified ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-[#1a3c8f] text-white hover:bg-blue-900"}`}>
                  {quizLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isVerified ? <><RotateCcw className="w-4 h-4" /> Retake</> : <><ChevronRight className="w-4 h-4" /> Start Assessment</>}
                </button>
              </div>
            );
          })}
        </div>

        {!user && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
            <p className="text-[#1a3c8f] font-medium">Sign in to take assessments and earn verified skill badges on your profile.</p>
            <a href="/login" className="inline-block mt-3 bg-[#1a3c8f] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-900 text-sm">Sign In</a>
          </div>
        )}
      </div>
    </div>
  );
}
