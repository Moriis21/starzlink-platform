import Link from "next/link";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
  className?: string;
}

export default function Breadcrumb({ crumbs, className }: Props) {
  // Mobile: show "← Back to X" (second-to-last crumb)
  const backCrumb = crumbs.length >= 2 ? crumbs[crumbs.length - 2] : { label: "Dashboard", href: "/dashboard" };
  const backLabel = backCrumb.label;
  const backHref = backCrumb.href || "/dashboard";

  return (
    <nav className={cn("mb-4", className)}>
      {/* Mobile: ← Back button */}
      <div className="sm:hidden">
        <Link href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a3c8f] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
      </div>
      {/* Desktop: full breadcrumb trail */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/dashboard" className="hover:text-[#1a3c8f] transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Dashboard
        </Link>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            {crumb.href && i < crumbs.length - 1 ? (
              <Link href={crumb.href} className="hover:text-[#1a3c8f] transition-colors">{crumb.label}</Link>
            ) : (
              <span className="text-gray-700 font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
