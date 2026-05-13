import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import ChatBot from "@/components/ui/ChatBot";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StarzLink – Opportunity • Impact • Inspiration",
    template: "%s | StarzLink",
  },
  description:
    "Discover scholarships, job leads, trainings, and campus updates all in one place. StarzLink connects students and professionals to verified opportunities.",
  keywords: ["scholarships", "jobs", "trainings", "campus updates", "opportunities", "StarzLink"],
  openGraph: {
    type: "website",
    siteName: "StarzLink",
    title: "StarzLink – Your Pathway to Opportunities",
    description: "Discover scholarships, job leads, trainings, and campus updates all in one place.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ChatBot />
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
