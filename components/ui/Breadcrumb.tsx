import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
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
  return (
    <nav className={cn("flex items-center gap-1.5 text-xs text-gray-400 mb-4", className)}>
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
    </nav>
  );
}
