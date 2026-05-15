"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import { useAuth } from "@/context/AuthContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${user ? "pb-16 lg:pb-0" : ""}`}>{children}</main>
      <Footer />
      {user && <MobileBottomNav />}
    </div>
  );
}
