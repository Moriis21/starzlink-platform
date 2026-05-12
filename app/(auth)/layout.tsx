import Link from "next/link";
import StarzLinkLogo from "@/components/ui/StarzLinkLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <StarzLinkLogo size="sm" variant="dark" showTagline={true} />
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
