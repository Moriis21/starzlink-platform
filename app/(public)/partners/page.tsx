"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, GraduationCap, ChevronRight, Globe, Search, Loader2 } from "lucide-react";
import { insforge } from "@/lib/insforge";

interface Partner {
  id: string;
  name: string;
  abbreviation: string;
  type: "university" | "organization" | "ngo" | "government" | "corporate";
  scope: "local" | "international";
  location: string;
  country: string;
  founded: string;
  website?: string;
  description: string;
  logo_url?: string;
  color: string;
  is_active: boolean;
}

const typeColors: Record<string, string> = {
  university: "bg-blue-100 text-blue-700",
  organization: "bg-purple-100 text-purple-700",
  ngo: "bg-green-100 text-green-700",
  government: "bg-orange-100 text-orange-700",
  corporate: "bg-gray-100 text-gray-700",
};

const typeLabels: Record<string, string> = {
  university: "University",
  organization: "Organization",
  ngo: "NGO",
  government: "Government",
  corporate: "Corporate",
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"local" | "international">("local");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await insforge.database
        .from("partners")
        .select("*")
        .eq("is_active", true)
        .order("founded", { ascending: true });
      setPartners((data as any) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = partners.filter(p =>
    p.scope === tab &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.abbreviation.toLowerCase().includes(search.toLowerCase()))
  );

  const localCount = partners.filter(p => p.scope === "local").length;
  const intlCount = partners.filter(p => p.scope === "international").length;

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-16 px-4 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">OUR PARTNER INSTITUTIONS</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Universities & Institutions
          </h1>
          <p className="text-blue-200 max-w-2xl mx-auto text-sm sm:text-base mb-6">
            StarzLink partners with leading universities and institutions to connect students with opportunities, scholarships, career resources and campus updates.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-300">
            <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /><span><strong className="text-white">{partners.length}</strong> Partner Institutions</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>Liberia — West Africa</span></div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4" /><span>More partners coming soon</span></div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> › <Link href="/about">About</Link> › <span className="text-gray-900">Partners</span>
      </div>

      {/* Tabs + Search */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {([
              { id: "local", label: "🇱🇷 Local Partners", count: localCount },
              { id: "international", label: "🌍 International Partners", count: intlCount },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors text-left ${tab === t.id ? "text-[#1a3c8f] border-b-2 border-[#1a3c8f] bg-blue-50/50" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {t.label} <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-normal">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search institutions…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a3c8f]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#1a3c8f] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {search ? `No results for "${search}"` : `No ${tab} partners yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(partner => (
              <div key={partner.id} className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:-translate-y-1 transition-all text-center flex flex-col items-center">
                {/* Logo */}
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-14 h-14 object-contain rounded-xl mb-2 group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-extrabold text-white text-sm shadow-sm mb-2 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: partner.color }}
                  >
                    {partner.abbreviation.slice(0, 3)}
                  </div>
                )}
                <p className="text-xs font-semibold text-gray-700 leading-tight line-clamp-2">{partner.name}</p>
                <p className="text-[10px] text-gray-400 mt-1">{partner.founded ? `Est. ${partner.founded}` : partner.location}</p>
                <span className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[partner.type]}`}>
                  {typeLabels[partner.type]}
                </span>
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#1a3c8f] transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" /> Website
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Partner CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-2xl p-8 text-white text-center">
          <GraduationCap className="w-10 h-10 text-blue-300 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold mb-2">Is Your Institution Not Listed?</h2>
          <p className="text-blue-200 mb-5 max-w-lg mx-auto text-sm">
            We are actively partnering with more universities, colleges, and institutions across Liberia and West Africa. Reach out to join our growing network.
          </p>
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 bg-white text-[#1a3c8f] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Partner With StarzLink <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
