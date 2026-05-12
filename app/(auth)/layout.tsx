import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b border-gray-100 px-4 py-2 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo variant="light" size="sm" href="/" />
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-600 hover:text-[#1a3c8f] transition-colors font-medium">Home</Link>
            <Link href="/opportunities" className="text-gray-600 hover:text-[#1a3c8f] transition-colors font-medium">Opportunities</Link>
            <Link href="/contact" className="text-gray-600 hover:text-[#1a3c8f] transition-colors font-medium">Contact</Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
