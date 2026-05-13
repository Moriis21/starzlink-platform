"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { opportunitiesApi, analyticsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AuthGate from "@/components/ui/AuthGate";
import Link from "next/link";
import { MapPin, Calendar, DollarSign, ExternalLink, ChevronLeft } from "lucide-react";

export default function GrantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    opportunitiesApi.getOne(id as string).then(res => {
      setItem(res.data?.data ?? null);
      setLoading(false);
      analyticsApi.track("view", "grant", id as string, user?.id);
    });
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-2/3" />
      <div className="h-48 bg-gray-100 rounded-2xl mt-6" />
    </div>
  );

  if (!item) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-700">Grant not found</h2>
      <Link href="/opportunities/grants" className="mt-4 inline-block text-[#1a3c8f] font-medium hover:underline">Back to Grants</Link>
    </div>
  );

  const HeroContent = () => (
    <div className="bg-gradient-to-r from-[#064e3b] to-[#059669] py-12 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <Link href="/opportunities/grants" className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 w-fit">
          <ChevronLeft className="w-4 h-4" /> Back to Grants
        </Link>
        <h1 className="text-3xl font-extrabold mb-1">{item.title}</h1>
        <p className="text-white/80 text-lg mb-4">{item.organizer}</p>
        <div className="flex flex-wrap gap-4">
          {item.amount && <span className="flex items-center gap-1.5 text-sm text-white/80"><DollarSign className="w-4 h-4" />Amount: {item.amount}</span>}
          {item.deadline && <span className="flex items-center gap-1.5 text-sm text-white/80"><Calendar className="w-4 h-4" />Deadline: {new Date(item.deadline).toLocaleDateString()}</span>}
          {item.location && <span className="flex items-center gap-1.5 text-sm text-white/80"><MapPin className="w-4 h-4" />{item.location}</span>}
        </div>
      </div>
    </div>
  );

  const preview = (
    <div>
      <HeroContent />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-gray-700 text-base leading-relaxed">{item.description?.slice(0, 300)}...</p>
      </div>
    </div>
  );

  return (
    <AuthGate preview={preview}>
      <div>
        <HeroContent />
        <div className="max-w-4xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 text-lg">About This Grant</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>
            {item.eligibility && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-3">Eligibility Requirements</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.eligibility}</p>
              </div>
            )}
            {item.benefits && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-3">What You Get</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.benefits}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Grant Details</h3>
              <dl className="space-y-3 text-sm">
                {item.amount && <><dt className="text-gray-500">Funding Amount</dt><dd className="font-medium text-green-700 text-base">{item.amount}</dd></>}
                {item.category && <><dt className="text-gray-500">Category</dt><dd className="font-medium">{item.category}</dd></>}
                {item.deadline && <><dt className="text-gray-500">Deadline</dt><dd className="font-medium text-red-600">{new Date(item.deadline).toLocaleDateString()}</dd></>}
              </dl>
            </div>
            {item.application_link && (
              <a href={item.application_link} target="_blank" rel="noopener noreferrer"
                onClick={() => analyticsApi.track("apply_click", "grant", item.id, user?.id)}
                className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors">
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
