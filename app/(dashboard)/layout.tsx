"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardSidebar from "@/components/ui/DashboardSidebar";
import ProfileCompletionGate from "@/components/ui/ProfileCompletionGate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileCompletionGate>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
          <DashboardSidebar />
          <main className="flex-1 px-4 lg:px-6 py-8 min-w-0">{children}</main>
        </div>
        <Footer />
      </div>
    </ProfileCompletionGate>
  );
}
