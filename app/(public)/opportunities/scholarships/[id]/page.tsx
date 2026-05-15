"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, GraduationCap, ExternalLink, Bookmark, ChevronLeft, CheckCircle, FileText } from "lucide-react";
import { scholarshipsApi } from "@/lib/api";
import { Scholarship } from "@/types";
import { formatDate, getDaysLeft, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import AuthGate from "@/components/ui/AuthGate";
import ShareButtons from "@/components/ui/ShareButtons";

export default function ScholarshipDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await scholarshipsApi.getOne(id as string);
        setItem(res.data?.data || res.data);
      } catch { toast.error("Failed to load."); }
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded mb-4 w-3/4" /><div className="h-64 bg-gray-100 rounded mt-6" /></div>;
  if (!item) return <div className="text-center py-20"><h2 className="text-2xl font-bold mb-2">Not found</h2><Link href="/opportunities/scholarships" className="text-[#1a3c8f] hover:underline">← Back to Scholarships</Link></div>;

  const daysLeft = getDaysLeft(item.deadline);

  const heroPreview = (
    <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-10 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <Link href="/opportunities/scholarships" className="flex items-center gap-1 text-blue-300 text-sm mb-4 hover:text-white"><ChevronLeft className="w-4 h-4" /> Back to Scholarships</Link>
        <h1 className="text-2xl font-extrabold">{item.title}</h1>
        <p className="text-blue-200">{item.provider} · {item.country}</p>
      </div>
    </div>
  );

  return (
    <AuthGate preview={heroPreview}>
    <div>
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-10 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <Link href="/opportunities/scholarships" className="flex items-center gap-1 text-blue-300 text-sm mb-4 hover:text-white"><ChevronLeft className="w-4 h-4" /> Back to Scholarships</Link>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{item.funding_type}</span>
            <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full">{item.study_level}</span>
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", item.status === "active" ? "bg-green-400/20 text-green-300" : "bg-red-400/20 text-red-300")}>{item.status?.toUpperCase()}</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-1">{item.title}</h1>
          <p className="text-blue-200">{item.provider}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center"><MapPin className="w-5 h-5 text-[#1a3c8f] mx-auto mb-1" /><p className="text-xs text-gray-500">Country</p><p className="text-sm font-semibold">{item.country}</p></div>
              <div className="text-center"><GraduationCap className="w-5 h-5 text-[#1a3c8f] mx-auto mb-1" /><p className="text-xs text-gray-500">Study Level</p><p className="text-sm font-semibold">{item.study_level}</p></div>
              <div className="text-center"><Calendar className="w-5 h-5 text-[#1a3c8f] mx-auto mb-1" /><p className="text-xs text-gray-500">Deadline</p><p className="text-sm font-semibold">{formatDate(item.deadline)}</p></div>
            </div>

            {item.description && <div className="bg-white rounded-2xl border border-gray-100 p-6"><h2 className="font-bold text-gray-900 text-lg mb-3">About This Scholarship</h2><p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{item.description}</p></div>}
            {item.benefits && <div className="bg-white rounded-2xl border border-gray-100 p-6"><h2 className="font-bold text-gray-900 text-lg mb-3">Benefits</h2><div className="space-y-2">{item.benefits.split("\n").filter(Boolean).map((b, i) => <div key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{b}</div>)}</div></div>}
            {item.eligibility && <div className="bg-white rounded-2xl border border-gray-100 p-6"><h2 className="font-bold text-gray-900 text-lg mb-3">Eligibility Requirements</h2><div className="space-y-2">{item.eligibility.split("\n").filter(Boolean).map((e, i) => <div key={i} className="flex items-start gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 rounded-full bg-[#1a3c8f] flex-shrink-0 mt-2" />{e}</div>)}</div></div>}
            {item.required_documents && <div className="bg-white rounded-2xl border border-gray-100 p-6"><h2 className="font-bold text-gray-900 text-lg mb-3">Required Documents</h2><div className="space-y-2">{item.required_documents.split("\n").filter(Boolean).map((d, i) => <div key={i} className="flex items-start gap-2 text-sm text-gray-600"><FileText className="w-4 h-4 text-[#1a3c8f] flex-shrink-0 mt-0.5" />{d}</div>)}</div></div>}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              {daysLeft > 0 ? (
                <div className={cn("text-center mb-4 p-3 rounded-xl", daysLeft <= 7 ? "bg-red-50" : "bg-blue-50")}>
                  <p className={cn("text-2xl font-extrabold", daysLeft <= 7 ? "text-red-700" : "text-[#1a3c8f]")}>{daysLeft} days left</p>
                  <p className={cn("text-xs", daysLeft <= 7 ? "text-red-500" : "text-blue-500")}>Deadline: {formatDate(item.deadline)}</p>
                </div>
              ) : (
                <div className="text-center mb-4 p-3 bg-red-50 rounded-xl"><p className="text-red-700 font-bold">Applications Closed</p></div>
              )}
              <div className="mb-3">
                <ShareButtons title={item.title} description={item.description} />
              </div>
              {item.application_link && (
                <Link
                  href={`/viewer?url=${encodeURIComponent(item.application_link)}&title=${encodeURIComponent(item.title)}&back=${encodeURIComponent(`/opportunities/scholarships/${item.id}`)}&type=scholarship`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#1a3c8f] text-white font-bold rounded-xl hover:bg-blue-900 mb-3">
                  Apply Now <ExternalLink className="w-4 h-4" />
                </Link>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setSaved(!saved); toast.success(saved ? "Removed" : "Saved!"); }} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 border rounded-xl text-sm font-medium", saved ? "bg-blue-50 border-[#1a3c8f] text-[#1a3c8f]" : "border-gray-200 text-gray-600")}>
                  <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] rounded-2xl p-4 text-white">
              <p className="font-bold mb-1 text-sm">Get More Scholarships on WhatsApp</p>
              <a href="https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white text-[#075E54] font-bold text-sm px-4 py-2 rounded-lg w-full justify-center mt-3">Join Now →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
