"use client";

import { useState, useEffect } from "react";
import { jobsApi, scholarshipsApi, opportunitiesApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Briefcase, GraduationCap, Globe, Clock, MapPin, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";

interface RecommendedItem {
  id: string;
  title: string;
  organization: string;
  type: string;
  reason: string;
  deadline?: string;
  location?: string;
  href: string;
  badge: string;
  badgeColor: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; badge: string }> = {
  job: { icon: Briefcase, color: "text-blue-700 bg-blue-50", badge: "Job" },
  scholarship: { icon: GraduationCap, color: "text-purple-700 bg-purple-50", badge: "Scholarship" },
  internship: { icon: Briefcase, color: "text-indigo-700 bg-indigo-50", badge: "Internship" },
  grant: { icon: Globe, color: "text-green-700 bg-green-50", badge: "Grant" },
  research: { icon: Globe, color: "text-violet-700 bg-violet-50", badge: "Research" },
};

const REASONS: Record<string, string> = {
  student: "Recommended for students",
  graduate: "Recommended for graduates",
  professional: "Recommended for professionals",
  default: "Trending on StarzLink",
};

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    // Load recently viewed from localStorage
    try {
      const rv = JSON.parse(localStorage.getItem("starzlink_recently_viewed") ?? "[]");
      setRecentlyViewed(rv.slice(0, 5));
    } catch {}

    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    setLoading(true);
    const userType = (user as any)?.user_type ?? "student";
    const allItems: RecommendedItem[] = [];

    try {
      if (userType === "student" || !userType) {
        // Prioritize scholarships and internships
        const [schRes, intRes] = await Promise.all([
          scholarshipsApi.getAll({ status: "active", limit: "4" }),
          opportunitiesApi.getAll({ opportunity_type: "internship", limit: "4" }),
        ]);
        (schRes.data?.data ?? []).forEach((s: any) => allItems.push({
          id: s.id, title: s.title, organization: s.provider ?? s.organization ?? "", type: "scholarship",
          reason: REASONS.student, deadline: s.deadline, location: s.country,
          href: `/opportunities/scholarships/${s.id}`, badge: "Scholarship", badgeColor: "text-purple-700 bg-purple-50",
        }));
        (intRes.data?.data ?? []).forEach((o: any) => allItems.push({
          id: o.id, title: o.title, organization: o.organizer, type: "internship",
          reason: REASONS.student, deadline: o.deadline, location: o.location,
          href: `/opportunities/internships/${o.id}`, badge: "Internship", badgeColor: "text-indigo-700 bg-indigo-50",
        }));
      } else if (userType === "graduate") {
        const [jobRes, grantRes] = await Promise.all([
          jobsApi.getAll({ status: "active", limit: "4" }),
          opportunitiesApi.getAll({ opportunity_type: "grant", limit: "4" }),
        ]);
        (jobRes.data?.data ?? []).forEach((j: any) => allItems.push({
          id: j.id, title: j.title, organization: j.company ?? "", type: "job",
          reason: REASONS.graduate, deadline: j.deadline, location: j.location,
          href: `/opportunities/jobs/${j.id}`, badge: "Job", badgeColor: "text-blue-700 bg-blue-50",
        }));
        (grantRes.data?.data ?? []).forEach((o: any) => allItems.push({
          id: o.id, title: o.title, organization: o.organizer, type: "grant",
          reason: REASONS.graduate, deadline: o.deadline, location: o.location,
          href: `/opportunities/grants/${o.id}`, badge: "Grant", badgeColor: "text-green-700 bg-green-50",
        }));
      } else {
        // professional
        const [jobRes, resRes] = await Promise.all([
          jobsApi.getAll({ status: "active", limit: "4" }),
          opportunitiesApi.getAll({ opportunity_type: "research", limit: "4" }),
        ]);
        (jobRes.data?.data ?? []).forEach((j: any) => allItems.push({
          id: j.id, title: j.title, organization: j.company ?? "", type: "job",
          reason: REASONS.professional, deadline: j.deadline, location: j.location,
          href: `/opportunities/jobs/${j.id}`, badge: "Job", badgeColor: "text-blue-700 bg-blue-50",
        }));
        (resRes.data?.data ?? []).forEach((o: any) => allItems.push({
          id: o.id, title: o.title, organization: o.organizer, type: "research",
          reason: REASONS.professional, deadline: o.deadline, location: o.location,
          href: `/opportunities/research/${o.id}`, badge: "Research", badgeColor: "text-violet-700 bg-violet-50",
        }));
      }
    } catch {}

    setItems(allItems);
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#1a3c8f]" /> For You
        </h1>
        <p className="text-gray-500 text-sm">Personalized opportunities based on your profile.</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-40" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map(item => {
            const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.job;
            const Icon = cfg.icon;
            return (
              <div key={`${item.type}-${item.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {item.reason}
                  </span>
                </div>
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.organization}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                      {item.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(item.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <Link href={item.href} className="mt-4 flex items-center justify-center gap-1.5 w-full bg-[#1a3c8f] text-white font-bold py-2.5 rounded-xl hover:bg-blue-900 transition-colors text-sm">
                  View Details <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" /> Recently Viewed
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {recentlyViewed.map((item: any, i) => (
              <Link key={i} href={item.href ?? "#"} className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#1a3c8f] hover:shadow-sm transition-all">
                <p className="font-semibold text-gray-900 text-sm line-clamp-1">{item.title ?? "Viewed item"}</p>
                <p className="text-xs text-gray-400 mt-1">{item.type ?? "Opportunity"}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
