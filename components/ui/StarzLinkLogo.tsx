import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  showTagline?: boolean;
  href?: string;
}

export default function StarzLinkLogo({ size = "md", variant = "dark", showTagline = true, href = "/" }: LogoProps) {
  const iconSize = size === "sm" ? 32 : size === "md" ? 40 : 52;
  const textClass = size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-3xl";
  const starzColor = variant === "light" ? "#ffffff" : "#0d1b4b";
  const linkColor = variant === "light" ? "#93c5fd" : "#1a6fd8";
  const taglineColor = variant === "light" ? "#bfdbfe" : "#1a6fd8";
  const taglineSize = size === "sm" ? "text-[7px]" : size === "md" ? "text-[9px]" : "text-[11px]";

  const logo = (
    <div className="flex items-center gap-2.5">
      {/* Icon */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 80 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Book pages */}
        <path d="M6 12 C6 10 8 8 10 8 L36 8 L40 38 L10 38 C8 38 6 36 6 34 Z" fill="#1a6fd8" opacity="0.9"/>
        <path d="M40 8 L36 8 L40 38 L44 8 Z" fill="#0d1b4b"/>
        <path d="M74 12 C74 10 72 8 70 8 L44 8 L40 38 L70 38 C72 38 74 36 74 34 Z" fill="#0d1b4b" opacity="0.85"/>
        {/* Book spine shine */}
        <path d="M38 8 L42 8 L42 38 L38 38 Z" fill="#1a6fd8" opacity="0.6"/>
        {/* Monitor frame */}
        <rect x="28" y="20" width="44" height="34" rx="3" fill="#0d1b4b"/>
        <rect x="30" y="22" width="40" height="28" rx="2" fill="#f0f4ff"/>
        {/* Monitor screen content - lines */}
        <rect x="33" y="26" width="22" height="2" rx="1" fill="#1a6fd8" opacity="0.7"/>
        <rect x="33" y="30" width="28" height="1.5" rx="0.75" fill="#0d1b4b" opacity="0.3"/>
        <rect x="33" y="33" width="24" height="1.5" rx="0.75" fill="#0d1b4b" opacity="0.3"/>
        <rect x="33" y="36" width="20" height="1.5" rx="0.75" fill="#0d1b4b" opacity="0.3"/>
        {/* Monitor stand */}
        <rect x="46" y="54" width="8" height="5" rx="1" fill="#0d1b4b"/>
        <rect x="40" y="59" width="20" height="3" rx="1.5" fill="#0d1b4b"/>
        {/* Digital pixels top right */}
        <rect x="66" y="4" width="6" height="6" rx="1" fill="#1a6fd8"/>
        <rect x="73" y="4" width="4" height="4" rx="0.8" fill="#0d1b4b"/>
        <rect x="66" y="11" width="4" height="4" rx="0.8" fill="#0d1b4b"/>
        <rect x="71" y="9" width="5" height="5" rx="1" fill="#1a6fd8" opacity="0.6"/>
      </svg>

      {/* Text */}
      <div>
        <div className={`font-black ${textClass} leading-none tracking-tight`}>
          <span style={{ color: starzColor }}>Starz</span>
          <span style={{ color: linkColor }}>Link</span>
        </div>
        {showTagline && (
          <div className={`${taglineSize} font-semibold tracking-[0.15em] mt-0.5 leading-none`} style={{ color: taglineColor }}>
            OPPORTUNITY · IMPACT · INSPIRATION
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }
  return logo;
}
