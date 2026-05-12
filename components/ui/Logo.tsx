"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** "light" = white/light background · "dark" = dark background (footer, sidebar) */
  variant?: "light" | "dark";
  size?: "xs" | "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const heights: Record<string, number> = { xs: 32, sm: 44, md: 52, lg: 64 };

export default function Logo({ variant = "light", size = "sm", href = "/", className = "" }: LogoProps) {
  const h = heights[size];

  const img = (
    <Image
      src="/images/logo.jpg"
      alt="StarzLink — Opportunity · Impact · Inspiration"
      width={h * 3}     // square source image
      height={h * 3}
      style={{ height: `${h}px`, width: "auto", display: "block" }}
      className="object-contain"
      priority
      unoptimized={false}
    />
  );

  const content =
    variant === "dark" ? (
      /* ── Dark background: logo sits inside a crisp white card ── */
      <div className={cn(
        "inline-flex items-center justify-center bg-white rounded-xl shadow-md",
        size === "xs" ? "px-2 py-1" : size === "sm" ? "px-3 py-2" : "px-4 py-2.5",
        className
      )}>
        {img}
      </div>
    ) : (
      /* ── Light background: logo displayed directly ── */
      <div className={cn("inline-flex items-center", className)}>
        {img}
      </div>
    );

  if (!href) return content;
  return (
    <Link href={href} className="flex-shrink-0">
      {content}
    </Link>
  );
}
