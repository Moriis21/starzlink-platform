"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { opportunitiesApi, analyticsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AuthGate from "@/components/ui/AuthGate";
import Link from "next/link";
import { MapPin, Calendar, Clock, ExternalLink, ChevronLeft, Heart } from "lucide-react";

export default function VolunteerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    opportunitiesApi.getOne(id as string).then(res => {
      setItem(res.data?.data ?? null);
      setLoading(false);
      analyticsApi.track("view", "volunteer", id as string, user?.id);
    });
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded mb-4 w-2/3" /><div className="h-48 bg-gray-100 rounded-2xl mt-6" /></div>;
  if (!item) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold text-gray-700">Volunteer opportunity not found</h2><Link href="/opportunities/volunteer" className="mt-4 inline-block text-[#1a3c8f] font-medium hover:underline">Back to Volunteer</Link></div>;

  const HeroContent = () => (
    <div className="bg-gradient-to-r from-[#064e3b] to-[#16a34a] py-12 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <Link href="/opportunities/volunteer" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 w-fit"><ChevronLeft className="w-4 h-4" /> Back to Volunteer</Link>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0"><Heart className="w-7 h-7 text-white" /></div>
          <div>
            <h1 className="text-3xl font-extrabold mb-1">{item.title}</h1>
            <p className="text-white/80 text-lg">{item.organizer}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-6">
          {item.location && <span className="flex items-center gap-1.5 text-sm text-white/80"><MapPin className="w-4 h-4" />{item.location}</span>}
          {item.deadline && <span className="flex items-center gap-1.5 text-sm text-white/80"><Calendar className="w-4 h-4" />Until: {new Date(item.deadline).toLocaleDateString()}</span>}
          {item.commitment_hours && <span className="flex items-center gap-1.5 text-sm text-white/80"><Clock className="w-4 h-4" />{item.commitment_hours} hrs/week</span>}
          {item.is_remote && <span className="text-xs bg-green-400/20 border border-green-400/30 text-green-200 px-3 py-1 rounded-full">Remote</span>}
        </div>
      </div>
    </div>
  );

  const preview = <div><HeroContent /><div className="max-w-4xl mx-auto px-4 py-6"><p className="text-gray-700 text-base leading-relaxed">{item.description?.slice(0, 300)}...</p></div></div>;

  return (
    <AuthGate preview={preview}>
      <div>
        <HeroContent />
        <div className="max-w-4xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"><h2 className="font-bold text-gray-900 mb-3 text-lg">About This Opportunity</h2><p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p></div>
            {item.eligibility && <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"><h2 className="font-bold text-gray-900 mb-3">Who Can Apply</h2><p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.eligibility}</p></div>}
            {item.benefits && <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"><h2 className="font-bold text-gray-900 mb-3">What You Gain</h2><p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.benefits}</p></div>}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Details</h3>
              <dl className="space-y-3 text-sm">
                {item.commitment_hours && <><dt className="text-gray-500">Time Commitment</dt><dd className="font-medium">{item.commitment_hours} hrs/week</dd></>}
                {item.duration && <><dt className="text-gray-500">Duration</dt><dd className="font-medium">{item.duration}</dd></>}
                {item.category && <><dt className="text-gray-500">Category</dt><dd className="font-medium">{item.category}</dd></>}
                {item.deadline && <><dt className="text-gray-500">Apply By</dt><dd className="font-medium text-red-600">{new Date(item.deadline).toLocaleDateString()}</dd></>}
              </dl>
            </div>
            {item.application_link && (
              <a href={item.application_link} target="_blank" rel="noopener noreferrer"
                onClick={() => analyticsApi.track("apply_click", "volunteer", item.id, user?.id)}
                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors">
                Volunteer Now <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
