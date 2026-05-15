"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { opportunitiesApi, analyticsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AuthGate from "@/components/ui/AuthGate";
import Link from "next/link";
import { MapPin, Calendar, Clock, DollarSign, ExternalLink, ChevronLeft, Briefcase, Globe } from "lucide-react";
import ShareButtons from "@/components/ui/ShareButtons";

export default function InternshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    opportunitiesApi.getOne(id as string).then(res => {
      setItem(res.data?.data ?? null);
      setLoading(false);
      analyticsApi.track("view", "internship", id as string, user?.id);
    });
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-2/3" />
      <div className="h-4 bg-gray-100 rounded mb-2 w-1/2" />
      <div className="h-48 bg-gray-100 rounded-2xl mt-6" />
    </div>
  );

  if (!item) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-700">Internship not found</h2>
      <Link href="/opportunities/internships" className="mt-4 inline-block text-[#1a3c8f] font-medium hover:underline">
        Back to Internships
      </Link>
    </div>
  );

  const preview = (
    <div>
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-12 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <Link href="/opportunities/internships" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 w-fit">
            <ChevronLeft className="w-4 h-4" /> Back to Internships
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold mb-1">{item.title}</h1>
              <p className="text-white/80 text-lg">{item.organizer}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            {item.location && <span className="flex items-center gap-1.5 text-sm text-white/80"><MapPin className="w-4 h-4" />{item.location}</span>}
            {item.deadline && <span className="flex items-center gap-1.5 text-sm text-white/80"><Calendar className="w-4 h-4" />Deadline: {new Date(item.deadline).toLocaleDateString()}</span>}
            {item.duration && <span className="flex items-center gap-1.5 text-sm text-white/80"><Clock className="w-4 h-4" />{item.duration}</span>}
            {item.stipend && <span className="flex items-center gap-1.5 text-sm text-white/80"><DollarSign className="w-4 h-4" />{item.stipend}</span>}
            {item.is_remote && <span className="text-xs bg-green-400/20 border border-green-400/30 text-green-200 px-3 py-1 rounded-full">Remote</span>}
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-gray-700 text-base leading-relaxed">{item.description?.slice(0, 300)}...</p>
      </div>
    </div>
  );

  return (
    <AuthGate preview={preview}>
      <div>
        <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-12 px-4 text-white">
          <div className="max-w-4xl mx-auto">
            <Link href="/opportunities/internships" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 w-fit">
              <ChevronLeft className="w-4 h-4" /> Back to Internships
            </Link>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold mb-1">{item.title}</h1>
                <p className="text-white/80 text-lg">{item.organizer}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              {item.location && <span className="flex items-center gap-1.5 text-sm text-white/80"><MapPin className="w-4 h-4" />{item.location}</span>}
              {item.deadline && <span className="flex items-center gap-1.5 text-sm text-white/80"><Calendar className="w-4 h-4" />Deadline: {new Date(item.deadline).toLocaleDateString()}</span>}
              {item.duration && <span className="flex items-center gap-1.5 text-sm text-white/80"><Clock className="w-4 h-4" />{item.duration}</span>}
              {item.stipend && <span className="flex items-center gap-1.5 text-sm text-white/80"><DollarSign className="w-4 h-4" />{item.stipend}</span>}
              {item.is_remote && <span className="text-xs bg-green-400/20 border border-green-400/30 text-green-200 px-3 py-1 rounded-full">Remote</span>}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-lg">About This Internship</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>
            {item.eligibility && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-3 text-lg">Eligibility</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.eligibility}</p>
              </div>
            )}
            {item.benefits && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-3 text-lg">Benefits</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.benefits}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Quick Info</h3>
              <dl className="space-y-3 text-sm">
                {item.duration && <><dt className="text-gray-500">Duration</dt><dd className="font-medium text-gray-900">{item.duration}</dd></>}
                {item.stipend && <><dt className="text-gray-500">Stipend</dt><dd className="font-medium text-gray-900">{item.stipend}</dd></>}
                {item.category && <><dt className="text-gray-500">Category</dt><dd className="font-medium text-gray-900">{item.category}</dd></>}
                {item.deadline && <><dt className="text-gray-500">Deadline</dt><dd className="font-medium text-red-600">{new Date(item.deadline).toLocaleDateString()}</dd></>}
              </dl>
            </div>
            <div className="mb-3">
              <ShareButtons title={item.title} description={item.description} />
            </div>
            {item.application_link && (
              <a
                href={item.application_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analyticsApi.track("apply_click", "internship", item.id, user?.id)}
                className="flex items-center justify-center gap-2 w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors"
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
