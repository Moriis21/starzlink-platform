"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles, FileText, BarChart2, Mic, Mail, Link2,
  PenLine, Calculator, User, Trophy, Target, Zap,
  ArrowRight, CheckCircle, Lock, Crown
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const TOOLS = [
  {
    id: "ai-career",
    label: "AI Career Assistant",
    desc: "Your complete career hub — CV score, analysis history, and career progress at a glance.",
    href: "/dashboard/career",
    icon: Sparkles,
    color: "from-[#1a3c8f] to-blue-600",
    bg: "bg-blue-50",
    text: "text-[#1a3c8f]",
    badge: "Free",
    pro: false,
    status: "active",
  },
  {
    id: "cv-analyzer",
    label: "CV Analyzer",
    desc: "Upload your CV and get instant AI-powered ATS score, feedback, and improvement tips.",
    href: "/dashboard/career/upload",
    icon: FileText,
    color: "from-purple-500 to-purple-700",
    bg: "bg-purple-50",
    text: "text-purple-700",
    badge: "Pro",
    pro: true,
    status: "active",
  },
  {
    id: "cover-letter",
    label: "Cover Letter Builder",
    desc: "Generate tailored, professional cover letters for any job in seconds.",
    href: "/dashboard/career/letter",
    icon: Mail,
    color: "from-green-500 to-emerald-700",
    bg: "bg-green-50",
    text: "text-green-700",
    badge: "Free",
    pro: false,
    status: "active",
  },
  {
    id: "interview",
    label: "Interview Prep",
    desc: "Practice with AI-generated interview questions tailored to your target role.",
    href: "/dashboard/career/interview",
    icon: Mic,
    color: "from-red-500 to-rose-700",
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "Pro",
    pro: true,
    status: "active",
  },
  {
    id: "linkedin",
    label: "LinkedIn Optimizer",
    desc: "Get AI suggestions to improve your LinkedIn profile and increase visibility.",
    href: "/dashboard/career/linkedin",
    icon: Link2,
    color: "from-sky-500 to-sky-700",
    bg: "bg-sky-50",
    text: "text-sky-700",
    badge: "Pro",
    pro: true,
    status: "active",
  },
  {
    id: "essay-helper",
    label: "Essay Helper",
    desc: "Build scholarship essays and personal statements with AI. Generate, improve, or rewrite.",
    href: "/tools/essay-helper",
    icon: PenLine,
    color: "from-indigo-500 to-indigo-700",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    badge: "Pro",
    pro: true,
    status: "active",
  },
  {
    id: "scholarship-calc",
    label: "Scholarship Calculator",
    desc: "Calculate your GPA, assess scholarship eligibility, and compare funding options.",
    href: "/tools/scholarship-calculator",
    icon: Calculator,
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "Free",
    pro: false,
    status: "active",
  },
  {
    id: "portfolio",
    label: "Portfolio Builder",
    desc: "Create a professional public portfolio with projects, certifications, and awards.",
    href: "/tools/portfolio-builder",
    icon: User,
    color: "from-teal-500 to-teal-700",
    bg: "bg-teal-50",
    text: "text-teal-700",
    badge: "Free",
    pro: false,
    status: "active",
  },
  {
    id: "skills",
    label: "Skills Assessment",
    desc: "Take short quizzes to earn verified skill badges shown on your profile.",
    href: "/tools/skills-assessment",
    icon: Trophy,
    color: "from-yellow-500 to-yellow-700",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    badge: "Free",
    pro: false,
    status: "active",
  },
];

export default function AIToolsHubPage() {
  const { user } = useAuth();
  const { isPro } = useSubscription();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] rounded-2xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">AI Tools</h1>
            <p className="text-sm text-gray-500">
              Welcome back, <strong>{user?.full_name?.split(" ")[0]}</strong>. Pick a tool to get started.
            </p>
          </div>
        </div>

        {!isPro && (
          <div className="mt-4 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-300 flex-shrink-0" />
              <div>
                <p className="text-white font-bold text-sm">Unlock Pro AI Tools</p>
                <p className="text-blue-200 text-xs">Get Interview Prep, LinkedIn Optimizer, and unlimited CV analyses.</p>
              </div>
            </div>
            <Link href="/dashboard/career/upgrade"
              className="flex-shrink-0 bg-yellow-400 text-[#0d1b4b] font-extrabold px-4 py-2 rounded-xl text-sm hover:bg-yellow-300 transition-colors">
              Upgrade
            </Link>
          </div>
        )}
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const locked = tool.pro && !isPro;
          return (
            <div key={tool.id}
              className={`bg-white rounded-2xl border-2 transition-all group overflow-hidden ${
                locked ? "border-gray-100 opacity-75" : "border-gray-100 hover:border-[#1a3c8f] hover:shadow-md"
              }`}
            >
              {/* Card top gradient strip */}
              <div className={`h-1.5 bg-gradient-to-r ${tool.color}`} />

              <div className="p-5">
                {/* Icon + badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 ${tool.bg} rounded-xl flex items-center justify-center`}>
                    {locked
                      ? <Lock className={`w-5 h-5 ${tool.text}`} />
                      : <tool.icon className={`w-5 h-5 ${tool.text}`} />
                    }
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    tool.badge === "Pro"
                      ? locked
                        ? "bg-gray-100 text-gray-400"
                        : "bg-yellow-100 text-yellow-700"
                      : "bg-green-50 text-green-700"
                  }`}>
                    {tool.badge}
                  </span>
                </div>

                {/* Title + description */}
                <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-[#1a3c8f] transition-colors">
                  {tool.label}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {tool.desc}
                </p>

                {/* Action */}
                {locked ? (
                  <Link href="/dashboard/career/upgrade"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 border border-gray-200 text-gray-500 font-semibold rounded-xl text-sm hover:bg-gray-100 transition-colors">
                    <Crown className="w-4 h-4 text-yellow-500" /> Upgrade to Pro
                  </Link>
                ) : (
                  <Link href={tool.href}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r ${tool.color} text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity`}>
                    Open Tool <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick stats for user */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tools Available", value: TOOLS.length, icon: <Zap className="w-4 h-4" />, color: "bg-blue-50 text-blue-700" },
          { label: "Free Tools", value: TOOLS.filter(t => !t.pro).length, icon: <CheckCircle className="w-4 h-4" />, color: "bg-green-50 text-green-700" },
          { label: "Pro Tools", value: TOOLS.filter(t => t.pro).length, icon: <Crown className="w-4 h-4" />, color: "bg-yellow-50 text-yellow-700" },
          { label: "Your Status", value: isPro ? "Pro" : "Free", icon: <Target className="w-4 h-4" />, color: isPro ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <div className="font-extrabold text-gray-900 text-lg leading-none">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation tip */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#1a3c8f] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#1a3c8f]">
          <strong>Tip:</strong> Move between tools using the <strong>Back</strong> and <strong>Next</strong> buttons at the top of each tool page.
          Your work is saved automatically — drafts, CV uploads, and essays are never lost when you navigate.
        </div>
      </div>
    </div>
  );
}
