"use client";

interface BrandImageProps {
  src: string;
  alt?: string;
  className?: string;
  /** Extra classes applied to the wrapper div when the image is missing */
  fallbackClassName?: string;
}

/**
 * Renders a brand image that silently hides itself if the file is missing,
 * so the parent's CSS gradient/background shows through cleanly.
 */
export default function BrandImage({ src, alt = "", className = "", fallbackClassName = "" }: BrandImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={!alt}
      className={className}
      onError={e => {
        const el = e.target as HTMLImageElement;
        el.style.display = "none";
      }}
    />
  );
}
