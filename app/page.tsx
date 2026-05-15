"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap, Briefcase, BookOpen, Megaphone, ArrowRight,
  Users, Globe, Building2, TrendingUp, ChevronRight, Bell,
  BadgeCheck, Heart, Play, CheckCircle, Star, Trophy
} from "lucide-react";
import { jobsApi, scholarshipsApi, trainingsApi, campusApi, newsletterApi } from "@/lib/api";
import { insforge } from "@/lib/insforge";
import { Job, Scholarship, Training, CampusUpdate } from "@/types";
import { formatDate } from "@/lib/utils";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FadeUp, FadeIn, SlideLeft, SlideRight, StaggerGroup, StaggerItem, ScaleCard, AnimatedCounter } from "@/components/ui/animations";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Stats are now dynamic — loaded from DB in useEffect below

const categories = [
  { label: "Scholarships", icon: GraduationCap, href: "/opportunities/scholarships", color: "bg-purple-50 text-purple-700 border-purple-200", desc: "Find scholarships for undergraduate, postgraduate, and PhD more." },
  { label: "Job Leads", icon: Briefcase, href: "/opportunities/jobs", color: "bg-blue-50 text-blue-700 border-blue-200", desc: "Explore verified job opportunities from top organizations." },
  { label: "Trainings", icon: BookOpen, href: "/trainings", color: "bg-orange-50 text-orange-700 border-orange-200", desc: "Upskill with professional courses, certifications and workshops." },
  { label: "Campus Updates", icon: Megaphone, href: "/campus-updates", color: "bg-green-50 text-green-700 border-green-200", desc: "Stay updated with campus news, events and announcements." },
];

const whyJoin = [
  { icon: BadgeCheck, title: "Verified Opportunities", desc: "100% genuine and trustworthy listings.", color: "bg-green-100 text-green-700" },
  { icon: Globe, title: "Global Reach", desc: "Connecting talent to opportunities worldwide.", color: "bg-blue-100 text-blue-700" },
  { icon: TrendingUp, title: "Growth & Impact", desc: "Empowering you to grow and make impact.", color: "bg-purple-100 text-purple-700" },
  { icon: Heart, title: "Community Support", desc: "A supportive community that inspires success.", color: "bg-rose-100 text-rose-700" },
];

interface Partner { id: string; name: string; abbreviation: string; color: string; logo_url?: string; location?: string; }
interface PlatformStats { opportunities: number; members: number; partners: number; countries: number; }
interface HomeReview { id: string; rating: number; body: string; profiles?: { full_name: string } | null; created_at: string; }

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [updates, setUpdates] = useState<CampusUpdate[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [campusTicker, setCampusTicker] = useState<CampusUpdate[]>([]);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({ opportunities: 0, members: 0, partners: 0, countries: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [homeReviews, setHomeReviews] = useState<HomeReview[]>([]);
  const [totalStories, setTotalStories] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [j, s, t, u, p, cu, statsRes] = await Promise.allSettled([
          jobsApi.getAll({ limit: "3", status: "active" }),
          scholarshipsApi.getAll({ limit: "3", status: "active" }),
          trainingsApi.getAll({ limit: "3", status: "active" }),
          campusApi.getAll({ limit: "3" }),
          insforge.database.from("partners").select("id,name,abbreviation,color,logo_url,location").eq("is_active", true).limit(20),
          campusApi.getAll({ limit: "8" }),
          // Fetch real platform stats in parallel
          Promise.all([
            insforge.database.from("jobs").select("id", { count: "exact" }).limit(1),
            insforge.database.from("scholarships").select("id", { count: "exact" }).limit(1),
            insforge.database.from("trainings").select("id", { count: "exact" }).limit(1),
            insforge.database.from("opportunities").select("id", { count: "exact" }).limit(1),
            insforge.database.from("profiles").select("id", { count: "exact" }).limit(1),
            insforge.database.from("partners").select("id", { count: "exact" }).eq("is_active", true).limit(1),
          ]),
        ]);
        if (j.status === "fulfilled") setJobs(j.value.data?.data || []);
        if (s.status === "fulfilled") setScholarships(s.value.data?.data || []);
        if (t.status === "fulfilled") setTrainings(t.value.data?.data || []);
        if (u.status === "fulfilled") setUpdates(u.value.data?.data || []);
        if (p.status === "fulfilled") setPartners((p.value as any).data ?? []);
        if (cu.status === "fulfilled") setCampusTicker(cu.value.data?.data || []);
        if (statsRes.status === "fulfilled") {
          const [jobsC, scholC, trainC, oppC, usersC, partnersC] = statsRes.value as any[];
          const totalOpps = (jobsC.count ?? 0) + (scholC.count ?? 0) + (trainC.count ?? 0) + (oppC.count ?? 0);
          setPlatformStats({
            opportunities: totalOpps,
            members: usersC.count ?? 0,
            partners: partnersC.count ?? 0,
            countries: 50, // Real reach — we serve 50+ countries
          });
          setStatsLoaded(true);
        }
      } catch {}
    };
    fetchAll();

    // Fetch reviews for trust strip
    fetch("/api/reviews?limit=4")
      .then(r => r.json())
      .then(d => {
        setHomeReviews(d.reviews ?? []);
        setAvgRating(d.avgRating ?? 0);
      })
      .catch(() => {});

    // Fetch story count
    fetch("/api/reviews?type=stories&limit=100")
      .then(r => r.json())
      .then(d => setTotalStories(d.stories?.length ?? 0))
      .catch(() => {});
  }, []);

  // Cycle campus cards every 5s — advance by 3 cards per tick
  useEffect(() => {
    if (campusTicker.length === 0) return;
    const t = setInterval(() => {
      setTickerIdx(i => {
        const next = i + 3;
        return next >= campusTicker.length ? 0 : next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [campusTicker.length]);

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

  const latestUpdates = [
    ...scholarships.map(s => ({ id: s.id, type: "scholarship" as const, title: s.title, org: s.provider, date: s.deadline, label: "SCHOLARSHIP", color: "bg-purple-100 text-purple-700", href: `/opportunities/scholarships/${s.id}` })),
    ...jobs.map(j => ({ id: j.id, type: "job" as const, title: j.title, org: j.company, date: j.deadline, label: "JOB LEAD", color: "bg-blue-100 text-blue-700", href: `/opportunities/jobs/${j.id}` })),
    ...updates.map(u => ({ id: u.id, type: "campus-update" as const, title: u.title, org: u.institution, date: u.date, label: "CAMPUS UPDATE", color: "bg-green-100 text-green-700", href: `/campus-updates/${u.id}` })),
  ].slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">

        {/* ── Hero Section ── */}
        <section className="relative bg-gradient-to-br from-[#0a1628] via-[#0d1b4b] to-[#1a3c8f] text-white overflow-hidden">
          {/* Brand image background — place hero-students.jpg in public/images/ */}
          <div className="absolute inset-0">
            <img
              src="/images/hero-students.jpg"
              alt=""
              aria-hidden
              className="w-full h-full object-cover object-center opacity-20"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/90 via-[#0d1b4b]/80 to-[#1a3c8f]/70" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 sm:py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/20">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  WELCOME TO STARZLINK
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[3.4rem] font-extrabold leading-[1.1] mb-4">
                  Your Pathway to{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                    Opportunities
                  </span>{" "}
                  and a Better Tomorrow.
                </h1>

                <p className="text-base text-blue-100 mb-5 leading-relaxed max-w-xl">
                  Discover scholarships, job leads, trainings, and campus updates all in one place. Empowering minds, creating impact, inspiring futures.
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <Link
                    href="/opportunities"
                    className="flex items-center gap-2 bg-white text-[#0d1b4b] px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-black/20"
                  >
                    Explore Opportunities <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/30 px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
                  >
                    <Users className="w-4 h-4" /> Join Our Community
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-3 text-sm text-blue-200">
                  {[
                    { icon: CheckCircle, text: "100% Verified Listings" },
                    { icon: Globe, text: "50+ Countries" },
                    { icon: Users, text: statsLoaded ? `${platformStats.members.toLocaleString()} Registered Members` : "Loading…" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-green-400" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats grid — real data from DB */}
              <StaggerGroup className="hidden lg:grid grid-cols-2 gap-4">
                {[
                  { value: statsLoaded ? platformStats.opportunities.toLocaleString() : "—", label: "Opportunities", icon: Briefcase },
                  { value: statsLoaded ? platformStats.members.toLocaleString() : "—", label: "Registered Members", icon: Users },
                  { value: statsLoaded ? platformStats.partners.toLocaleString() : "—", label: "Partner Institutions", icon: Building2 },
                  { value: "50+", label: "Countries Reached", icon: Globe },
                ].map(({ value, label, icon: Icon }) => (
                  <StaggerItem key={label}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-colors cursor-default"
                    >
                      <Icon className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
                      <div className="text-blue-200 text-sm font-medium">{label}</div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>

            {/* Mobile stats — real data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 lg:hidden">
              {[
                { value: statsLoaded ? platformStats.opportunities.toLocaleString() : "—", label: "Opportunities", icon: Briefcase },
                { value: statsLoaded ? platformStats.members.toLocaleString() : "—", label: "Members", icon: Users },
                { value: statsLoaded ? platformStats.partners.toLocaleString() : "—", label: "Partners", icon: Building2 },
                { value: "50+", label: "Countries", icon: Globe },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 text-blue-300 mx-auto mb-1" />
                  <div className="text-xl font-extrabold text-white">{value}</div>
                  <div className="text-blue-300 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Explore Opportunities ── */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold text-[#1a3c8f] uppercase tracking-widest mb-2">WHAT WE OFFER</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Explore Opportunities</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Find your path through our curated categories — all verified, all real.</p>
            </div>
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map(({ label, icon: Icon, href, color, desc }) => (
                <StaggerItem key={label}>
                <Link
                  href={href}
                  className={`group bg-white rounded-2xl border ${color.split(" ")[2] || "border-gray-100"} p-6 hover:shadow-lg transition-all hover:-translate-y-1 block`}
                >
                  <div className={`w-12 h-12 ${color.split(" ").slice(0,2).join(" ")} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{label}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{desc}</p>
                  <span className="text-sm font-semibold text-[#1a3c8f] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Browse <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* ── Opportunities Showcase with Brand Image ── */}
        <section className="py-16 px-4 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 lg:h-[480px]">
                <img
                  src="/images/explore-opportunities.jpg"
                  alt="Explore opportunities on StarzLink"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {/* Overlay stats */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b4b]/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
                  {[
                    { icon: GraduationCap, label: "Scholarships", count: "250+" },
                    { icon: Briefcase, label: "Job Openings", count: "350+" },
                    { icon: BookOpen, label: "Courses", count: "120+" },
                  ].map(({ icon: Icon, label, count }) => (
                    <div key={label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center text-white">
                      <Icon className="w-5 h-5 mx-auto mb-1 text-blue-300" />
                      <p className="text-lg font-extrabold">{count}</p>
                      <p className="text-[10px] text-blue-200 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a3c8f] uppercase tracking-widest mb-2">YOUR FUTURE STARTS HERE</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                  The Right Opportunities, All in One Place
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  StarzLink curates the best scholarships, job openings, training programs, grants, internships and campus updates — so you spend less time searching and more time applying.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    "250+ verified scholarships from global institutions",
                    "350+ job openings from reputable companies",
                    "120+ professional training programs",
                    "Real-time campus updates and event alerts",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/opportunities" className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors">
                    Browse All Opportunities <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/signup" className="flex items-center gap-2 border border-[#1a3c8f] text-[#1a3c8f] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                    Create Free Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Latest Updates ── */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-[#1a3c8f] uppercase tracking-widest mb-1">FRESH DAILY</p>
                <h2 className="text-3xl font-extrabold text-gray-900">Latest Updates</h2>
              </div>
              <Link href="/opportunities" className="flex items-center gap-1 text-sm font-semibold text-[#1a3c8f] hover:underline">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {latestUpdates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {latestUpdates.map((item, i) => (
                  <Link
                    key={`${item.type}-${item.id}-${i}`}
                    href={item.href}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.label}</span>
                      <span className="text-xs text-gray-400">{formatDate(item.date)}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a3c8f] transition-colors line-clamp-2 mb-2 leading-snug">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.org}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#1a3c8f] opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Placeholder cards when no data yet */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { label: "SCHOLARSHIP", color: "bg-purple-100 text-purple-700", title: "Fully Funded Master's Scholarship in USA 2026", org: "Various Universities", date: "Jun 30, 2026", href: "/opportunities/scholarships" },
                  { label: "JOB LEAD", color: "bg-blue-100 text-blue-700", title: "Project Manager Needed at UNDP", org: "UNDP", date: "May 31, 2026", href: "/opportunities/jobs" },
                  { label: "CAMPUS UPDATE", color: "bg-green-100 text-green-700", title: "National Youth Summit 2026 Registration Open", org: "Nigeria", date: "Jun 15, 2026", href: "/campus-updates" },
                ].map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.label}</span>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a3c8f] transition-colors line-clamp-2 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.org}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── WhatsApp Banner ── */}
        <WhatsAppBanner />

        {/* ── Why Join StarzLink ── */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold text-[#1a3c8f] uppercase tracking-widest mb-2">WHY CHOOSE US</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Why Join StarzLink?</h2>
              <p className="text-gray-500 max-w-xl mx-auto">We are committed to providing a seamless experience that helps you stay ahead.</p>
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

        {/* ── Community Trust Strip ── */}
        <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <p className="text-xs font-bold text-[#1a3c8f] uppercase tracking-widest mb-1">COMMUNITY TRUST</p>
                <h2 className="text-2xl font-extrabold text-gray-900">What Our Members Say</h2>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                    <span className="text-sm font-bold text-gray-700">{avgRating}</span>
                    <span className="text-sm text-gray-400">average rating</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {totalStories > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-bold text-yellow-800">{totalStories} Success {totalStories === 1 ? "Story" : "Stories"}</span>
                  </div>
                )}
                <Link href="/reviews" className="text-sm font-semibold text-[#1a3c8f] hover:underline flex items-center gap-1">
                  All Reviews <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {homeReviews.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-dashed border-gray-200 p-4 text-center">
                    <Star className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 font-medium">Be the first to share your experience</p>
                    <Link href="/reviews" className="text-xs text-[#1a3c8f] font-semibold hover:underline mt-2 block">Write a Review</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {homeReviews.map(review => {
                  const name = (review.profiles as any)?.full_name ?? "Anonymous";
                  const firstName = name.split(" ")[0] ?? "User";
                  return (
                    <div key={review.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f] rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {firstName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{firstName}</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{review.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="py-16 px-4 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f]">
          <div className="max-w-2xl mx-auto text-center">
            <Bell className="w-10 h-10 text-blue-300 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-white mb-2">Stay Connected, Never Miss Out!</h2>
            <p className="text-blue-200 mb-6">Subscribe to our newsletter and get the latest opportunities, updates and tips delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-5 py-3 bg-white text-[#1a3c8f] font-bold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60 whitespace-nowrap text-sm"
              >
                {subscribing ? "…" : "Subscribe"}
              </button>
            </form>
          </div>
        </section>

        {/* ── Campus Updates Carousel ───────────────────────────────────────── */}
        {campusTicker.length > 0 && (
          <section className="py-14 px-4 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f]">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Latest From Campus</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Campus Updates</h2>
                </div>
                <Link href="/campus-updates" className="hidden sm:flex items-center gap-1 text-sm text-blue-300 hover:text-white font-semibold transition-colors">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Current card — re-renders on tickerIdx change */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {campusTicker.slice(0, 3).map((u, i) => (
                  <motion.div
                    key={`${u.id}-${tickerIdx}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                    className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/15 rounded-2xl p-5 flex flex-col gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-4 h-4 text-yellow-300" />
                      </div>
                      <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                        {u.category || "Update"} · {u.institution?.slice(0, 20) || "Campus"}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 flex-1">
                      {u.title}
                    </h3>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <span className="text-[10px] text-blue-300/70">
                        {u.date ? new Date(u.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </span>
                      <Link href={`/campus-updates/${u.id}`}
                        className="text-xs text-blue-300 hover:text-white font-semibold transition-colors flex items-center gap-1">
                        Read More <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination dots + mobile view all */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.ceil(campusTicker.length / 3) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTickerIdx(i * 3)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        Math.floor(tickerIdx / 3) === i
                          ? "w-6 bg-white"
                          : "w-1.5 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
                <Link href="/campus-updates" className="sm:hidden text-sm text-blue-300 hover:text-white font-semibold flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Partners Marquee (infinite scroll) ───────────────────────────── */}
        {partners.length > 0 && (
          <section className="py-12 px-4 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1a3c8f] uppercase tracking-widest mb-1">OUR PARTNERS</p>
                <h2 className="text-2xl font-extrabold text-gray-900">Partner Institutions</h2>
              </div>
              <Link href="/partners" className="text-sm text-[#1a3c8f] hover:underline font-semibold flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Infinite scroll marquee */}
            <div className="relative">
              <style>{`
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .marquee-track { animation: marquee 30s linear infinite; }
                .marquee-track:hover { animation-play-state: paused; }
              `}</style>
              <div className="flex marquee-track" style={{ width: "max-content" }}>
                {[...partners, ...partners].map((p, i) => (
                  <Link
                    key={`${p.id}-${i}`}
                    href="/partners"
                    className="flex flex-col items-center mx-4 w-24 group flex-shrink-0"
                  >
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="w-14 h-14 object-contain rounded-xl mb-2 group-hover:scale-110 transition-transform" />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md mb-2 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.abbreviation.slice(0, 3)}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-500 text-center leading-tight line-clamp-2">{p.name}</p>
                  </Link>
                ))}
              </div>
              {/* Fade edges */}
              <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}
