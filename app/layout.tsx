import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import ChatBot from "@/components/ui/ChatBot";
import PWARegister from "@/components/ui/PWARegister";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0d1b4b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "StarzLink – Opportunity • Impact • Inspiration",
    template: "%s | StarzLink",
  },
  description:
    "Discover scholarships, job leads, trainings, and campus updates all in one place. StarzLink connects students and professionals to verified opportunities.",
  keywords: ["scholarships", "jobs", "trainings", "campus updates", "opportunities", "StarzLink", "Liberia", "West Africa"],
  applicationName: "StarzLink",
  manifest: "/manifest.webmanifest",

  // Open Graph
  openGraph: {
    type: "website",
    siteName: "StarzLink",
    title: "StarzLink – Your Pathway to Opportunities",
    description: "Discover scholarships, job leads, trainings, and campus updates all in one place.",
  },

  // PWA / Apple
  appleWebApp: {
    capable: true,
    title: "StarzLink",
    statusBarStyle: "black-translucent",
  },

  // Icons
  icons: {
    icon: [
      { url: "/icons/icon-16.png",  sizes: "16x16",  type: "image/png" },
      { url: "/icons/icon-32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icons/icon-96.png",  sizes: "96x96",  type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-167.png", sizes: "167x167", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/icon-512-maskable.png" },
    ],
  },

  // Twitter / X
  twitter: {
    card: "summary",
    title: "StarzLink – Your Pathway to Opportunities",
    description: "Discover scholarships, job leads, trainings, and campus updates all in one place.",
  },

  // Windows
  other: {
    "msapplication-TileColor": "#0d1b4b",
    "msapplication-TileImage": "/icons/icon-144.png",
    "msapplication-config": "none",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://8qn72bza.us-east.insforge.app" />
        {/* Apple splash screens */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="StarzLink" />
        {/* Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Windows */}
        <meta name="msapplication-TileColor" content="#0d1b4b" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ChatBot />
          <PWARegister />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
              success: { style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" } },
              error: { style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
