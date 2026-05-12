"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "light" | "dark"; // light = white bg panel, dark = dark bg panel
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

/**
 * Displays the StarzLink logo correctly on both light and dark backgrounds.
 * On dark backgrounds (footer, admin sidebar), wraps the logo in a white rounded container.
 */
export default function Logo({ variant = "light", size = "md", href = "/", className = "" }: LogoProps) {
  const heights = { sm: 40, md: 48, lg: 60 };
  const h = heights[size];

  const img = (
    <Image
      src="/images/logo.jpg"
      alt="StarzLink — Opportunity · Impact · Inspiration"
      width={h * 3}
      height={h * 3}
      style={{ height: `${h}px`, width: "auto" }}
      className="object-contain"
      priority
    />
  );

  const content =
    variant === "dark" ? (
      // On dark backgrounds: white rounded pill container
      <div className={`inline-flex items-center bg-white rounded-xl px-3 py-1.5 shadow-sm ${className}`}>
        {img}
      </div>
    ) : (
      // On light backgrounds: just the image
      <div className={`inline-flex items-center ${className}`}>{img}</div>
    );

  return href ? <Link href={href}>{content}</Link> : content;
}
