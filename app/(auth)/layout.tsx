import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image
              src="/images/logo.jpg"
              alt="StarzLink — Opportunity · Impact · Inspiration"
              width={140}
              height={140}
              style={{ height: "44px", width: "auto" }}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-gray-600 hover:text-[#1a3c8f]">Home</Link>
            <Link href="/opportunities" className="text-gray-600 hover:text-[#1a3c8f]">Opportunities</Link>
            <Link href="/contact" className="text-gray-600 hover:text-[#1a3c8f]">Contact</Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
