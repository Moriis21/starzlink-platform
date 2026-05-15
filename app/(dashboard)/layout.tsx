"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileCompletionGate from "@/components/ui/ProfileCompletionGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileCompletionGate>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>
        <Footer />
      </div>
    </ProfileCompletionGate>
  );
}
