"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Calendar, Clock, MapPin, User, ExternalLink, Bookmark, Share2, ChevronLeft, CheckCircle } from "lucide-react";
import { trainingsApi } from "@/lib/api";
import { Training } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function TrainingDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Training | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await trainingsApi.getOne(id as string);
        setItem(res.data?.data || res.data);
      } catch { toast.error("Failed to load."); }
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded mb-4 w-3/4" /><div className="h-64 bg-gray-100 rounded mt-6" /></div>;
  if (!item) return <div className="text-center py-20"><h2 className="text-2xl font-bold mb-2">Not found</h2><Link href="/trainings" className="text-[#1a3c8f] hover:underline">← Back to Trainings</Link></div>;

  return (
    <div>
      <div className="bg-gradient-to-r from-[#92400e] to-[#d97706] py-10 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <Link href="/trainings" className="flex items-center gap-1 text-yellow-200 text-sm mb-4 hover:text-white"><ChevronLeft className="w-4 h-4" /> Back to Trainings</Link>
          <div className="flex flex-wrap gap-2 mb-2">
            {item.level && <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{item.level}</span>}
            {item.mode && <span className="bg-orange-400/30 text-orange-200 text-xs px-3 py-1 rounded-full">{item.mode}</span>}
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", item.status === "active" ? "bg-green-400/20 text-green-300" : "bg-red-400/20 text-red-300")}>{item.status?.toUpperCase()}</span>
          </div>
          <h1 className="text-3xl font-extrabold mb-1">{item.title}</h1>
          <p className="text-yellow-200">{item.provider}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center"><Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Duration</p><p className="text-sm font-semibold">{item.duration}</p></div>
              <div className="text-center"><Calendar className="w-5 h-5 text-orange-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Start Date</p><p className="text-sm font-semibold">{formatDate(item.start_date)}</p></div>
              <div className="text-center"><BookOpen className="w-5 h-5 text-orange-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Mode</p><p className="text-sm font-semibold capitalize">{item.mode}</p></div>
              {item.instructor && <div className="text-center"><User className="w-5 h-5 text-orange-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Instructor</p><p className="text-sm font-semibold">{item.instructor}</p></div>}
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Fee / Price</p>
                <p className="font-bold text-orange-800 text-lg">{item.fee === "0" || item.fee === "Free" ? "FREE" : item.fee}</p>
              </div>
              {item.certificate_status && (
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-xl">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.certificate_status}</span>
                </div>
              )}
            </div>

            {item.description && <div className="bg-white rounded-2xl border border-gray-100 p-6"><h2 className="font-bold text-gray-900 text-lg mb-3">About This Training</h2><p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{item.description}</p></div>}
            {item.what_you_will_learn && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-3">What You Will Learn</h2>
                <div className="space-y-2">
                  {item.what_you_will_learn.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <div className="mb-4 p-3 bg-orange-50 rounded-xl text-center">
                <p className="text-orange-700 font-bold text-lg">{item.fee === "0" ? "FREE" : item.fee}</p>
                <p className="text-orange-500 text-xs">Starts {formatDate(item.start_date)}</p>
              </div>
              <a href={item.registration_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 mb-3">
                Register Now <ExternalLink className="w-4 h-4" />
              </a>
              <div className="flex gap-2">
                <button onClick={() => { setSaved(!saved); toast.success(saved ? "Removed" : "Saved!"); }} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 border rounded-xl text-sm font-medium", saved ? "bg-orange-50 border-orange-600 text-orange-700" : "border-gray-200 text-gray-600")}>
                  <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Copied!"); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] rounded-2xl p-4 text-white">
              <p className="font-bold mb-1 text-sm">Get Training Updates on WhatsApp</p>
              <a href="https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white text-[#075E54] font-bold text-sm px-4 py-2 rounded-lg w-full justify-center mt-3">Join Now →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
