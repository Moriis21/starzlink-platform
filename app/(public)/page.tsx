"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap, Briefcase, BookOpen, Megaphone, ArrowRight,
  Users, Globe, Building2, TrendingUp, ChevronRight, MessageCircle, Bell,
  BadgeCheck, Heart
} from "lucide-react";
import { jobsApi, scholarshipsApi, trainingsApi, campusApi, newsletterApi } from "@/lib/api";
import { Job, Scholarship, Training, CampusUpdate } from "@/types";
import { formatDate, getDaysLeft } from "@/lib/utils";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";
import toast from "react-hot-toast";

const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17";

const stats = [
  { value: "10K+", label: "Opportunities", icon: Briefcase },
  { value: "25K+", label: "Active Members", icon: Users },
  { value: "500+", label: "Partner Institutions", icon: Building2 },
  { value: "50+", label: "Countries Reached", icon: Globe },
];

const categories = [
  { label: "Scholarships", icon: GraduationCap, href: "/opportunities/scholarships", color: "bg-purple-50 text-purple-700 border-purple-100", desc: "Find scholarships for undergraduate, postgraduate, and PhD more." },
  { label: "Job Leads", icon: Briefcase, href: "/opportunities/jobs", color: "bg-blue-50 text-blue-700 border-blue-100", desc: "Explore verified job opportunities from top organizations." },
  { label: "Trainings", icon: BookOpen, href: "/trainings", color: "bg-orange-50 text-orange-700 border-orange-100", desc: "Upskill with professional courses, certifications and workshops." },
  { label: "Campus Updates", icon: Megaphone, href: "/campus-updates", color: "bg-green-50 text-green-700 border-green-100", desc: "Stay updated with campus news, events and announcements." },
];

const whyJoin = [
  { icon: BadgeCheck, title: "Verified Opportunities", desc: "100% genuine and trustworthy listings.", color: "bg-green-100 text-green-600" },
  { icon: Globe, title: "Global Reach", desc: "Connecting talent to opportunities worldwide.", color: "bg-blue-100 text-blue-600" },
  { icon: TrendingUp, title: "Growth & Impact", desc: "Empowering you to grow and make impact.", color: "bg-purple-100 text-purple-600" },
  { icon: Heart, title: "Community Support", desc: "A supportive community that inspires success.", color: "bg-rose-100 text-rose-600" },
];

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [updates, setUpdates] = useState<CampusUpdate[]>([]);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [j, s, t, u] = await Promise.allSettled([
          jobsApi.getAll({ limit: "3", status: "active" }),
          scholarshipsApi.getAll({ limit: "3", status: "active" }),
          trainingsApi.getAll({ limit: "3", status: "active" }),
          campusApi.getAll({ limit: "3" }),
        ]);
        if (j.status === "fulfilled") setJobs(j.value.data?.data || j.value.data || []);
        if (s.status === "fulfilled") setScholarships(s.value.data?.data || s.value.data || []);
        if (t.status === "fulfilled") setTrainings(t.value.data?.data || t.value.data || []);
        if (u.status === "fulfilled") setUpdates(u.value.data?.data || u.value.data || []);
      } catch {}
    };
    fetch();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await newsletterApi.subscribe(email);
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch {
      toast.error("Subscription failed. Try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const allUpdates = [
    ...scholarships.map(s => ({ id: s.id, type: "scholarship" as const, title: s.title, org: s.provider, date: s.deadline, label: "SCHOLARSHIP", color: "bg-purple-100 text-purple-700" })),
    ...jobs.map(j => ({ id: j.id, type: "job" as const, title: j.title, org: j.company, date: j.deadline, label: "JOB LEAD", color: "bg-blue-100 text-blue-700" })),
    ...updates.map(u => ({ id: u.id, type: "campus-update" as const, title: u.title, org: u.institution, date: u.date, label: "CAMPUS UPDATE", color: "bg-green-100 text-green-700" })),
  ].slice(0, 6);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0d1b4b] via-[#1a3c8f] to-[#2563eb] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-indigo-400 blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 text-xs font-medium px-3 py-1.5 rounded-full mb-5 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                WELCOME TO STARZLINK
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
                Your Pathway to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                  Opportunities
                </span>{" "}
                and a Better Tomorrow.
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Discover scholarships, job leads, trainings, and campus updates all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/opportunities"
                  className="flex items-center gap-2 bg-white text-[#1a3c8f] px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Explore Opportunities <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-white/10 text-white border border-white/30 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
                >
                  <Users className="w-4 h-4" /> Join Our Community
                </Link>
              </div>
            </div>

            {/* Floating category buttons */}
            <div className="hidden lg:flex items-center justify-center relative h-80">
              <div className="relative w-64 h-64 bg-white/10 rounded-full border border-white/20 flex items-center justify-center">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-14 h-14 text-white" />
                </div>
                {[
                  { label: "Find Scholarships", icon: GraduationCap, pos: "absolute -top-6 -right-4" },
                  { label: "Discover Job Leads", icon: Briefcase, pos: "absolute -right-12 top-1/2 -translate-y-1/2" },
                  { label: "Stay Updated", icon: Bell, pos: "absolute -bottom-6 right-4" },
                ].map(({ label, icon: Icon, pos }) => (
                  <div key={label} className={`${pos} bg-white text-[#1a3c8f] text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap`}>
                    <Icon className="w-4 h-4" /> {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center hover:bg-white/15 transition-colors">
                <Icon className="w-6 h-6 text-blue-300 mx-auto mb-1" />
                <div className="text-2xl font-extrabold text-white">{value}</div>
                <div className="text-blue-200 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Opportunities */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Explore Opportunities</h2>
            <p className="text-gray-500">Find your path through our curated categories</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map(({ label, icon: Icon, href, color, desc }) => (
              <Link
                key={label}
                href={href}
                className={`group bg-white rounded-2xl border ${color.split(" ")[2]} p-6 hover:shadow-lg transition-all hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{label}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{desc}</p>
                <span className="text-sm font-semibold text-[#1a3c8f] flex items-center gap-1 group-hover:gap-2 transition-all">
                  Browse {label} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Updates */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Latest Updates</h2>
              <p className="text-gray-500 text-sm">Fresh opportunities posted daily</p>
            </div>
            <Link href="/opportunities" className="flex items-center gap-1 text-sm font-semibold text-[#1a3c8f] hover:underline">
              View All Updates <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {allUpdates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allUpdates.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={`/${item.type === "job" ? "opportunities/jobs" : item.type === "scholarship" ? "opportunities/scholarships" : "campus-updates"}/${item.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.label}</span>
                    <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#1a3c8f] transition-colors line-clamp-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.org}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Placeholder cards when no data */}
              {["Fully Funded Master's Scholarship in USA 2025", "Project Manager Needed at UNDP", "National Youth Summit 2025"].map((title, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${["bg-purple-100 text-purple-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700"][i]}`}>
                      {["SCHOLARSHIP", "JOB LEAD", "CAMPUS UPDATE"][i]}
                    </span>
                    <span className="text-xs text-gray-400">May {20 + i}, 2025</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500">{["Various Universities", "UNDP", "Nigeria"][i]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp Banner */}
      <WhatsAppBanner />

      {/* Why Join StarzLink */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Why Join StarzLink?</h2>
            <p className="text-gray-500">We are committed to providing a seamless experience that helps you stay ahead.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyJoin.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-md transition-all group">
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-gradient-to-r from-[#1a3c8f] to-[#2563eb]">
        <div className="max-w-2xl mx-auto text-center">
          <Bell className="w-10 h-10 text-blue-300 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-white mb-2">Stay Connected, Never Miss Out!</h2>
          <p className="text-blue-200 mb-6">Subscribe to our newsletter and get the latest opportunities, updates and tips delivered to your inbox.</p>
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-5 py-3 bg-white text-[#1a3c8f] font-bold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60 whitespace-nowrap text-sm"
            >
              {subscribing ? "..." : "Subscribe"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
