"use client";

import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
import Breadcrumb from "@/components/ui/Breadcrumb";
import {
  Sparkles, FileText, BarChart2, Mic, Mail, Link2, Bookmark,
  Users, Bell, User, Crown, Lock, ArrowRight, Grid3x3
} from "lucide-react";

const TOOLS = [
  {
    title: "AI Career Dashboard",
    desc: "Your career hub — view CV scores, history, and career progress at a glance.",
    href: "/dashboard/career",
    icon: Sparkles,
    color: "from-blue-500 to-[#1a3c8f]",
    textColor: "text-blue-600",
    bg: "bg-blue-50",
    pro: false,
    badge: "Free",
  },
  {
    title: "CV Analyzer",
    desc: "Upload your CV and get instant AI-powered feedback, ATS score, and improvement tips.",
    href: "/dashboard/career/upload",
    icon: FileText,
    color: "from-purple-500 to-purple-700",
    textColor: "text-purple-600",
    bg: "bg-purple-50",
    pro: false,
    badge: "5 Free Credits",
  },
  {
    title: "CV Analysis History",
    desc: "Review all your past CV analyses, scores, and improvement recommendations.",
    href: "/dashboard/career/history",
    icon: BarChart2,
    color: "from-green-500 to-emerald-700",
    textColor: "text-green-600",
    bg: "bg-green-50",
    pro: false,
    badge: "Free",
  },
  {
    title: "Interview Pro",
    desc: "Prepare for any job interview with AI-generated questions, tips, and mock sessions.",
    href: "/dashboard/career/interview",
    icon: Mic,
    color: "from-orange-500 to-red-500",
    textColor: "text-orange-600",
    bg: "bg-orange-50",
    pro: true,
    badge: "Pro",
  },
  {
    title: "Application Letter Generator",
    desc: "Generate professional, tailored cover letters for any job or scholarship application.",
    href: "/dashboard/career/letter",
    icon: Mail,
    color: "from-pink-500 to-rose-600",
    textColor: "text-pink-600",
    bg: "bg-pink-50",
    pro: true,
    badge: "Pro",
  },
  {
    title: "LinkedIn Profile Optimizer",
    desc: "Improve your LinkedIn headline, summary, skills, and profile with AI guidance.",
    href: "/dashboard/career/linkedin",
    icon: Link2,
    color: "from-sky-500 to-blue-600",
    textColor: "text-sky-600",
    bg: "bg-sky-50",
    pro: true,
    badge: "Pro",
  },
  {
    title: "Saved Opportunities",
    desc: "Browse all the jobs, scholarships, and trainings you have saved for later.",
    href: "/dashboard/saved",
    icon: Bookmark,
    color: "from-yellow-500 to-amber-600",
    textColor: "text-yellow-600",
    bg: "bg-yellow-50",
    pro: false,
    badge: "Free",
  },
  {
    title: "Referrals",
    desc: "Invite friends and earn rewards. Track your referrals and points balance.",
    href: "/referrals",
    icon: Users,
    color: "from-teal-500 to-cyan-600",
    textColor: "text-teal-600",
    bg: "bg-teal-50",
    pro: false,
    badge: "Free",
  },
  {
    title: "Profile Manager",
    desc: "Update your personal information, location, education, and career goals.",
    href: "/profile",
    icon: User,
    color: "from-indigo-500 to-violet-600",
    textColor: "text-indigo-600",
    bg: "bg-indigo-50",
    pro: false,
    badge: "Free",
  },
];

export default function ToolsHubPage() {
  const { isPro } = useSubscription();

  return (
    <div>
      <Breadcrumb crumbs={[{ label: "Career Tools" }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Grid3x3 className="w-6 h-6 text-[#1a3c8f]" /> Career Tools Hub
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">All your career advancement tools in one place</p>
        </div>
        {!isPro && (
          <Link href="/dashboard/career/upgrade" className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all">
            <Crown className="w-4 h-4" /> Upgrade to Pro
          </Link>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(tool => {
          const isLocked = tool.pro && !isPro;
          return (
            <Link
              key={tool.href}
              href={isLocked ? "/dashboard/career/upgrade" : tool.href}
              className="relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 ${tool.bg} rounded-xl flex items-center justify-center`}>
                  <tool.icon className={`w-5 h-5 ${tool.textColor}`} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  tool.badge === "Pro"
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {tool.badge}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#1a3c8f] transition-colors">
                {tool.title}
                {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400 inline ml-1.5 mb-0.5" />}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{tool.desc}</p>

              <div className="flex items-center text-sm font-semibold text-[#1a3c8f] group-hover:gap-2 gap-1.5 transition-all">
                {isLocked ? "Upgrade to Access" : "Open Tool"}
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
