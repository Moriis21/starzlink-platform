"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { opportunitiesApi, analyticsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AuthGate from "@/components/ui/AuthGate";
import Link from "next/link";
import { FlaskConical, Calendar, Clock, ExternalLink, ChevronLeft, MapPin } from "lucide-react";

export default function ResearchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    opportunitiesApi.getOne(id as string).then(res => {
      setItem(res.data?.data ?? null);
      setLoading(false);
      analyticsApi.track("view", "research", id as string, user?.id);
    });
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded mb-4 w-2/3" /><div className="h-48 bg-gray-100 rounded-2xl mt-6" /></div>;
  if (!item) return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold text-gray-700">Research opportunity not found</h2><Link href="/opportunities/research" className="mt-4 inline-block text-[#1a3c8f] font-medium hover:underline">Back to Research</Link></div>;

  const HeroContent = () => (
    <div className="bg-gradient-to-r from-[#3b1f6b] to-[#7c3aed] py-12 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <Link href="/opportunities/research" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 w-fit"><ChevronLeft className="w-4 h-4" /> Back to Research</Link>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0"><FlaskConical className="w-7 h-7 text-white" /></div>
          <div>
            <h1 className="text-3xl font-extrabold mb-1">{item.title}</h1>
            <p className="text-white/80 text-lg">{item.organizer}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-6">
          {item.research_field && <span className="text-xs bg-purple-400/20 border border-purple-400/30 px-3 py-1 rounded-full">{item.research_field}</span>}
          {item.location && <span className="flex items-center gap-1.5 text-sm text-white/80"><MapPin className="w-4 h-4" />{item.location}</span>}
          {item.deadline && <span className="flex items-center gap-1.5 text-sm text-white/80"><Calendar className="w-4 h-4" />Deadline: {new Date(item.deadline).toLocaleDateString()}</span>}
          {item.duration && <span className="flex items-center gap-1.5 text-sm text-white/80"><Clock className="w-4 h-4" />{item.duration}</span>}
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
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"><h2 className="font-bold text-gray-900 mb-3 text-lg">Research Overview</h2><p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p></div>
            {item.eligibility && <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"><h2 className="font-bold text-gray-900 mb-3">Eligibility & Requirements</h2><p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.eligibility}</p></div>}
            {item.benefits && <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"><h2 className="font-bold text-gray-900 mb-3">Benefits & Compensation</h2><p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.benefits}</p></div>}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Research Details</h3>
              <dl className="space-y-3 text-sm">
                {item.research_field && <><dt className="text-gray-500">Research Field</dt><dd className="font-medium text-purple-700">{item.research_field}</dd></>}
                {item.duration && <><dt className="text-gray-500">Duration</dt><dd className="font-medium">{item.duration}</dd></>}
                {item.stipend && <><dt className="text-gray-500">Stipend</dt><dd className="font-medium text-green-700">{item.stipend}</dd></>}
                {item.deadline && <><dt className="text-gray-500">Application Deadline</dt><dd className="font-medium text-red-600">{new Date(item.deadline).toLocaleDateString()}</dd></>}
              </dl>
            </div>
            {item.application_link && (
              <a href={item.application_link} target="_blank" rel="noopener noreferrer"
                onClick={() => analyticsApi.track("apply_click", "research", item.id, user?.id)}
                className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white font-bold py-3.5 rounded-xl hover:bg-violet-700 transition-colors">
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
