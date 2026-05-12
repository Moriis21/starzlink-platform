import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from InsForge storage and other external sources
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.insforge.app",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Don't fail build if local images are missing (they'll show broken img gracefully)
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
