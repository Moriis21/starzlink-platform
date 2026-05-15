"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sparkles, FileText, Mic, Mail, Link2, ArrowLeft, Cpu, ChevronRight
} from "lucide-react";

const TOOLS = [
  { label: "Career Hub", href: "/dashboard/career", icon: Sparkles, short: "Hub" },
  { label: "CV Builder", href: "/dashboard/career/upload", icon: FileText, short: "CV" },
  { label: "CV History", href: "/dashboard/career/history", icon: FileText, short: "History" },
  { label: "Interview Prep", href: "/dashboard/career/interview", icon: Mic, short: "Interview" },
  { label: "Cover Letter", href: "/dashboard/career/letter", icon: Mail, short: "Letter" },
  { label: "LinkedIn", href: "/dashboard/career/linkedin", icon: Link2, short: "LinkedIn" },
];

const NEXT_STEPS: Record<string, { label: string; href: string; desc: string }[]> = {
  "/dashboard/career/upload": [
    { label: "View Analysis History", href: "/dashboard/career/history", desc: "See all your CV scores" },
    { label: "Generate Cover Letter", href: "/dashboard/career/letter", desc: "Write a tailored letter" },
    { label: "Find Scholarships", href: "/opportunities/scholarships", desc: "Apply for opportunities" },
  ],
  "/dashboard/career/history": [
    { label: "Improve Your CV", href: "/dashboard/career/upload", desc: "Upload a new version" },
    { label: "Practice Interviews", href: "/dashboard/career/interview", desc: "AI mock interviews" },
    { label: "Optimize LinkedIn", href: "/dashboard/career/linkedin", desc: "Boost your profile" },
  ],
  "/dashboard/career/letter": [
    { label: "Analyze Your CV", href: "/dashboard/career/upload", desc: "Get AI feedback" },
    { label: "Browse Job Leads", href: "/opportunities/jobs", desc: "Apply to open positions" },
    { label: "Practice Interviews", href: "/dashboard/career/interview", desc: "Prepare with AI" },
  ],
  "/dashboard/career/interview": [
    { label: "Improve Your CV", href: "/dashboard/career/upload", desc: "Before the interview" },
    { label: "Write Cover Letter", href: "/dashboard/career/letter", desc: "Complete your application" },
    { label: "Browse Opportunities", href: "/opportunities", desc: "Find your next role" },
  ],
  "/dashboard/career/linkedin": [
    { label: "Analyze Your CV", href: "/dashboard/career/upload", desc: "Get AI feedback" },
    { label: "Generate Cover Letter", href: "/dashboard/career/letter", desc: "Write a tailored letter" },
    { label: "Find Scholarships", href: "/opportunities/scholarships", desc: "International opportunities" },
  ],
};

interface Props {
  backHref?: string;
  backLabel?: string;
  /** Current tool label for breadcrumb */
  currentLabel?: string;
}

export function ToolNavBar({ backHref = "/dashboard/career", backLabel = "Career Hub", currentLabel }: Props) {
  const pathname = usePathname();

  // Derive current label from path if not provided
  const label = currentLabel ?? TOOLS.find(t => pathname === t.href || pathname.startsWith(t.href + "/"))?.label ?? "Career Tool";

  return (
    <div className="mb-5 space-y-2">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 flex-wrap">
        <Link href="/dashboard" className="hover:text-[#1a3c8f] font-medium">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <Link href="/dashboard/ai-tools" className="hover:text-[#1a3c8f] font-medium flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5" />AI Tools
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        <span className="text-gray-800 font-semibold">{label}</span>
      </nav>

      {/* Tool bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/dashboard/ai-tools"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3c8f] bg-white border border-gray-200 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0"
        >
          <Cpu className="w-3.5 h-3.5" /> AI Tools
        </Link>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1">
          {TOOLS.map(tool => {
            const active = pathname === tool.href || pathname.startsWith(tool.href + "/");
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0",
                  active
                    ? "bg-[#1a3c8f] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3c8f] hover:text-[#1a3c8f]"
                )}
              >
                <tool.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tool.label}</span>
                <span className="sm:hidden">{tool.short}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function NextSteps() {
  const pathname = usePathname();
  const steps = NEXT_STEPS[pathname];
  if (!steps) return null;

  return (
    <div className="mt-8 bg-gray-50 rounded-2xl p-5 border border-gray-100">
      <p className="text-sm font-bold text-gray-700 mb-3">What to do next</p>
      <div className="grid sm:grid-cols-3 gap-3">
        {steps.map(step => (
          <Link
            key={step.href}
            href={step.href}
            className="bg-white border border-gray-200 rounded-xl p-3.5 hover:border-[#1a3c8f] hover:shadow-sm transition-all group"
          >
            <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1a3c8f]">{step.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
