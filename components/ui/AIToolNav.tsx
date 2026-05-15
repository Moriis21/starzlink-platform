"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutDashboard, Cpu, Home } from "lucide-react";

// Ordered tool flow for back/forward navigation
export const AI_TOOL_FLOW = [
  { label: "AI Tools Hub",         href: "/dashboard/ai-tools" },
  { label: "AI Career Assistant",  href: "/dashboard/career" },
  { label: "CV Analyzer",          href: "/dashboard/career/upload" },
  { label: "Cover Letter",         href: "/dashboard/career/letter" },
  { label: "Interview Prep",       href: "/dashboard/career/interview" },
  { label: "LinkedIn Optimizer",   href: "/dashboard/career/linkedin" },
  { label: "Essay Helper",         href: "/tools/essay-helper" },
  { label: "Scholarship Calculator", href: "/tools/scholarship-calculator" },
  { label: "Portfolio Builder",    href: "/tools/portfolio-builder" },
  { label: "Skills Assessment",    href: "/tools/skills-assessment" },
];

interface AIToolNavProps {
  /** Current page label — must match an entry in AI_TOOL_FLOW */
  currentLabel: string;
  /** Breadcrumb trail: [{ label, href }] — the last item is the current page (no link) */
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AIToolNav({ currentLabel, breadcrumbs }: AIToolNavProps) {
  const router = useRouter();
  const currentIndex = AI_TOOL_FLOW.findIndex(t => t.label === currentLabel);
  const prev = currentIndex > 0 ? AI_TOOL_FLOW[currentIndex - 1] : null;
  const next = currentIndex < AI_TOOL_FLOW.length - 1 ? AI_TOOL_FLOW[currentIndex + 1] : null;

  const defaultBreadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "AI Tools", href: "/dashboard/ai-tools" },
    { label: currentLabel },
  ];
  const crumbs = breadcrumbs ?? defaultBreadcrumbs;

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 flex-wrap mb-4">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">›</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-[#1a3c8f] transition-colors font-medium">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-semibold">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Back / Forward bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {prev && (
          <Link
            href={prev.href}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{prev.label}</span>
            <span className="sm:hidden">Prev</span>
          </Link>
        )}

        {next && (
          <Link
            href={next.href}
            className="flex items-center gap-1.5 text-sm font-medium text-[#1a3c8f] bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all"
          >
            <span className="hidden sm:inline">{next.label}</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/dashboard/ai-tools"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-all"
          >
            <Cpu className="w-3.5 h-3.5" /> AI Tools
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>
      </div>

      {/* Step indicator */}
      {currentIndex >= 0 && (
        <div className="flex items-center gap-1 mt-3">
          {AI_TOOL_FLOW.map((t, i) => (
            <Link key={t.href} href={t.href} title={t.label}>
              <div className={`h-1.5 rounded-full transition-all ${
                i === currentIndex
                  ? "w-6 bg-[#1a3c8f]"
                  : i < currentIndex
                  ? "w-3 bg-blue-200"
                  : "w-3 bg-gray-200"
              }`} />
            </Link>
          ))}
          <span className="text-xs text-gray-400 ml-2">
            {currentIndex + 1} / {AI_TOOL_FLOW.length}
          </span>
        </div>
      )}
    </div>
  );
}
