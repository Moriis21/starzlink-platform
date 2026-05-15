import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StarzLink – Opportunity • Impact • Inspiration",
    short_name: "StarzLink",
    description: "Discover scholarships, jobs, trainings, grants, and career tools. Liberia's #1 opportunity platform.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d1b4b",
    orientation: "portrait-primary",
    categories: ["education", "productivity", "business"],
    lang: "en",
    icons: [
      { src: "/icons/icon-72.png",  sizes: "72x72",   type: "image/png" },
      { src: "/icons/icon-96.png",  sizes: "96x96",   type: "image/png" },
      { src: "/icons/icon-128.png", sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-144.png", sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/images/hero-students.jpg",
        sizes: "1280x720",
        type: "image/jpeg",
        // @ts-ignore — form_factor is valid but may not be in older TS types
        form_factor: "wide",
        label: "StarzLink Opportunities",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Go to your personal dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Scholarships",
        short_name: "Scholarships",
        description: "Browse available scholarships",
        url: "/opportunities/scholarships",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Jobs",
        short_name: "Jobs",
        description: "Find job opportunities",
        url: "/opportunities/jobs",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "CV Builder",
        short_name: "CV Builder",
        description: "Build and improve your CV",
        url: "/dashboard/career/upload",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Saved Items",
        short_name: "Saved",
        description: "View your saved opportunities",
        url: "/dashboard/saved",
        icons: [{ src: "/icons/icon-96.png", sizes: "96x96" }],
      },
    ],
  };
}
