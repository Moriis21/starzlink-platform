"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Building2, Bookmark, Share2, ChevronLeft } from "lucide-react";
import { campusApi } from "@/lib/api";
import { CampusUpdate } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import AuthGate from "@/components/ui/AuthGate";

const catColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-700", events: "bg-purple-100 text-purple-700",
  announcements: "bg-yellow-100 text-yellow-700", scholarships: "bg-green-100 text-green-700",
  exams: "bg-red-100 text-red-700", results: "bg-orange-100 text-orange-700",
};

export default function CampusUpdateDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<CampusUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await campusApi.getOne(id as string);
        setItem(res.data?.data || res.data);
      } catch { toast.error("Failed to load."); }
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded mb-4 w-3/4" /><div className="h-64 bg-gray-100 rounded mt-6" /></div>;
  if (!item) return <div className="text-center py-20"><h2 className="text-2xl font-bold mb-2">Not found</h2><Link href="/campus-updates" className="text-[#1a3c8f] hover:underline">← Back</Link></div>;

  const heroPreview = (
    <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-10 px-4 text-white">
      <div className="max-w-3xl mx-auto">
        <Link href="/campus-updates" className="flex items-center gap-1 text-blue-300 text-sm mb-4 hover:text-white"><ChevronLeft className="w-4 h-4" /> Back to Campus Updates</Link>
        <h1 className="text-2xl font-extrabold">{item.title}</h1>
        <p className="text-blue-200">{item.institution}</p>
      </div>
    </div>
  );

  return (
    <AuthGate preview={heroPreview}>
    <div>
      {item.image_url && <div className="h-72 overflow-hidden"><img src={item.image_url} alt={item.title} className="w-full h-full object-cover" /></div>}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-10 px-4 text-white">
        <div className="max-w-3xl mx-auto">
          <Link href="/campus-updates" className="flex items-center gap-1 text-blue-300 text-sm mb-4 hover:text-white"><ChevronLeft className="w-4 h-4" /> Back to Campus Updates</Link>
          <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block", catColors[item.category] || "bg-gray-100 text-gray-600")}>{item.category}</span>
          <h1 className="text-3xl font-extrabold mb-2">{item.title}</h1>
          <div className="flex items-center gap-4 text-blue-200 text-sm">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{item.institution}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(item.date)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setSaved(!saved); toast.success(saved ? "Removed" : "Saved!"); }} className={cn("flex items-center gap-1.5 px-4 py-2 border rounded-xl text-sm font-medium", saved ? "bg-blue-50 border-[#1a3c8f] text-[#1a3c8f]" : "border-gray-200 text-gray-600")}>
            <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
          </button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Copied!"); }} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-[#075E54] to-[#128C7E] rounded-2xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="font-bold mb-1">Join Our WhatsApp Channel</p>
            <p className="text-green-200 text-sm">Get real-time campus updates directly on WhatsApp.</p>
          </div>
          <a href="https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17" target="_blank" rel="noopener noreferrer" className="bg-white text-[#075E54] font-bold px-5 py-2.5 rounded-xl hover:bg-green-50 whitespace-nowrap">Join Now →</a>
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
