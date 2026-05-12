import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MapPin, GraduationCap, ChevronRight, Globe } from "lucide-react";

export const metadata: Metadata = { title: "Our Partners — Universities in Liberia & Beyond" };

interface University {
  id: string;
  name: string;
  abbr: string;
  type: "public" | "private" | "faith" | "technical";
  location: string;
  founded: string;
  website: string;
  description: string;
  color: string;
  bgColor: string;
}

const liberianUniversities: University[] = [
  {
    id: "ul",
    name: "University of Liberia",
    abbr: "UL",
    type: "public",
    location: "Monrovia, Liberia",
    founded: "1862",
    website: "https://www.ul.edu.lr",
    description: "The oldest and largest public university in Liberia, offering undergraduate and graduate programs across multiple disciplines.",
    color: "#1a3c8f",
    bgColor: "#e8f0fe",
  },
  {
    id: "cuttington",
    name: "Cuttington University",
    abbr: "CU",
    type: "faith",
    location: "Suakoko, Bong County",
    founded: "1889",
    website: "https://www.cuttington.org",
    description: "A private Episcopal university founded in 1889, one of the oldest private universities in sub-Saharan Africa.",
    color: "#7c3aed",
    bgColor: "#ede9fe",
  },
  {
    id: "ameu",
    name: "African Methodist Episcopal University",
    abbr: "AMEU",
    type: "faith",
    location: "Monrovia, Liberia",
    founded: "1997",
    website: "https://ameu.edu.lr",
    description: "A private university with a strong focus on liberal arts and professional education across Liberia.",
    color: "#059669",
    bgColor: "#d1fae5",
  },
  {
    id: "umu",
    name: "United Methodist University",
    abbr: "UMU",
    type: "faith",
    location: "Monrovia, Liberia",
    founded: "1996",
    website: "https://www.umu.edu.lr",
    description: "A private university affiliated with the United Methodist Church, providing quality education across various fields.",
    color: "#d97706",
    bgColor: "#fef3c7",
  },
  {
    id: "tubman",
    name: "Tubman University",
    abbr: "TU",
    type: "public",
    location: "Harper, Maryland County",
    founded: "2009",
    website: "https://www.tubmanu.edu.lr",
    description: "A public university serving the south-eastern region of Liberia with degree programs in education, business and sciences.",
    color: "#0891b2",
    bgColor: "#cffafe",
  },
  {
    id: "bwi",
    name: "Booker Washington Institute",
    abbr: "BWI",
    type: "technical",
    location: "Kakata, Margibi County",
    founded: "1929",
    website: "https://www.bwi.edu.lr",
    description: "A technical and vocational institution providing hands-on training in technical trades and agriculture.",
    color: "#16a34a",
    bgColor: "#dcfce7",
  },
  {
    id: "stella",
    name: "Stella Maris Polytechnic",
    abbr: "SMP",
    type: "faith",
    location: "Monrovia, Liberia",
    founded: "1977",
    website: "https://www.stellamarispolytechnic.edu.lr",
    description: "A Catholic polytechnic institution offering technical and professional education programs.",
    color: "#dc2626",
    bgColor: "#fee2e2",
  },
  {
    id: "gktcc",
    name: "Grand Kru Technical Community College",
    abbr: "GKTCC",
    type: "technical",
    location: "Barclayville, Grand Kru County",
    founded: "2011",
    website: "#",
    description: "A technical community college serving the Grand Kru County region with vocational and technical programs.",
    color: "#9333ea",
    bgColor: "#f3e8ff",
  },
  {
    id: "bwtcc",
    name: "Bong Mines Technical Community College",
    abbr: "BMTCC",
    type: "technical",
    location: "Bong Mines, Bong County",
    founded: "2012",
    website: "#",
    description: "Technical community college offering vocational training and associate degree programs in Bong County.",
    color: "#0369a1",
    bgColor: "#e0f2fe",
  },
  {
    id: "motherpatern",
    name: "Mother Patern College of Health Sciences",
    abbr: "MPCHS",
    type: "faith",
    location: "Monrovia, Liberia",
    founded: "1971",
    website: "#",
    description: "A Catholic institution specializing in health sciences, nursing, and public health education.",
    color: "#be185d",
    bgColor: "#fce7f3",
  },
  {
    id: "amezone",
    name: "A.M.E. Zion University College",
    abbr: "AMEZUC",
    type: "faith",
    location: "Monrovia, Liberia",
    founded: "2000",
    website: "#",
    description: "An African Methodist Episcopal Zion university offering undergraduate programs in arts, sciences and education.",
    color: "#b45309",
    bgColor: "#fef3c7",
  },
  {
    id: "rk",
    name: "Riva Kaikia College",
    abbr: "RKC",
    type: "private",
    location: "Monrovia, Liberia",
    founded: "2005",
    website: "#",
    description: "A private college providing programs in business administration, education and information technology.",
    color: "#0f766e",
    bgColor: "#ccfbf1",
  },
];

const typeColors: Record<string, string> = {
  public: "bg-blue-100 text-blue-700",
  private: "bg-purple-100 text-purple-700",
  faith: "bg-orange-100 text-orange-700",
  technical: "bg-green-100 text-green-700",
};

const typeLabels: Record<string, string> = {
  public: "Public University",
  private: "Private University",
  faith: "Faith-Based Institution",
  technical: "Technical / Community College",
};

export default function PartnersPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-16 px-4 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">OUR PARTNER INSTITUTIONS</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Universities & Institutions in Liberia
          </h1>
          <p className="text-blue-200 max-w-2xl mx-auto text-sm sm:text-base mb-6">
            StarzLink partners with leading universities and institutions across Liberia to connect students with opportunities, scholarships, career resources and campus updates.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-300">
            <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /><span><strong className="text-white">{liberianUniversities.length}</strong> Partner Institutions</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span><strong className="text-white">Liberia</strong> — West Africa</span></div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4" /><span>More partners coming soon</span></div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> › <Link href="/about">About</Link> › <span className="text-gray-900">Partners</span>
      </div>

      {/* Filter badges */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {Object.entries(typeLabels).map(([key, label]) => (
            <span key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${typeColors[key]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />{label}
            </span>
          ))}
        </div>
      </div>

      {/* University Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {liberianUniversities.map(uni => (
            <div key={uni.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden">
              {/* Logo area */}
              <div
                className="h-28 flex items-center justify-center relative"
                style={{ background: uni.bgColor }}
              >
                {/* Initials-based logo */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md"
                  style={{ background: uni.color }}
                >
                  {uni.abbr.length <= 3 ? uni.abbr : uni.abbr.slice(0, 2)}
                </div>
                {/* Type badge */}
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[uni.type]}`}>
                  {uni.type === "public" ? "Public" : uni.type === "faith" ? "Faith" : uni.type === "technical" ? "Technical" : "Private"}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 group-hover:text-[#1a3c8f] transition-colors line-clamp-2">
                  {uni.name}
                </h3>
                <p className="text-xs font-bold text-gray-400 mb-2">{uni.abbr} · Est. {uni.founded}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {uni.location}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{uni.description}</p>

                {uni.website !== "#" ? (
                  <a
                    href={uni.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Visit Website
                  </a>
                ) : (
                  <div className="flex items-center justify-center w-full py-2 text-xs text-gray-300 font-medium">
                    Website coming soon
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Partner CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] rounded-2xl p-8 text-white text-center">
          <GraduationCap className="w-10 h-10 text-blue-300 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold mb-2">Is Your Institution Not Listed?</h2>
          <p className="text-blue-200 mb-5 max-w-lg mx-auto text-sm">
            We are actively partnering with more universities, colleges, and institutions across Liberia and West Africa. Reach out to join our growing network.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#1a3c8f] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Partner With StarzLink <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
