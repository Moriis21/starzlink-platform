import type { Metadata } from "next";
import Link from "next/link";
import {
  Target, Eye, CheckCircle, Shield, Star, Globe, Users, TrendingUp,
  ChevronRight, BadgeCheck, LayoutGrid, Bell, Monitor, Heart, Award, Lightbulb
} from "lucide-react";

export const metadata: Metadata = { title: "About Us" };

const stats = [
  { value: "50K+", label: "Active Users", icon: Users },
  { value: "10K+", label: "Opportunities Posted", icon: TrendingUp },
  { value: "5K+", label: "Scholarships Awarded", icon: Award },
  { value: "100+", label: "Training Programs", icon: Target },
  { value: "50+", label: "Countries Reached", icon: Globe },
];

const values = [
  { title: "Integrity", icon: Shield },
  { title: "Excellence", icon: Star },
  { title: "Accessibility", icon: Globe },
  { title: "Impact", icon: Lightbulb },
];

const whyChoose = [
  { icon: BadgeCheck, title: "Verified Opportunities", desc: "All opportunities are carefully checked for authenticity." },
  { icon: LayoutGrid, title: "Diverse Categories", desc: "Jobs, scholarships, trainings and campus updates all in one place." },
  { icon: Bell, title: "Timely Updates", desc: "Get the latest updates and never miss important opportunities." },
  { icon: Monitor, title: "Easy to Use", desc: "A user-friendly platform designed for everyone." },
  { icon: Globe, title: "Global Reach", desc: "Connecting opportunities from around the world." },
  { icon: Heart, title: "Community Impact", desc: "We are driven by the impact we create in people's lives." },
];

const partners = [
  "Microsoft", "Coursera", "Google", "Mastercard Foundation", "British Council", "UNDP"
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-16 px-4 text-white">
        <div className="max-w-7xl mx-auto flex items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-3">About StarzLink</h1>
            <p className="text-blue-200 text-lg mb-5">
              We connect students and professionals to life-changing opportunities, knowledge and resources that empower them to build a better future.
            </p>
            <button className="flex items-center gap-2 bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors">
              ▶ Watch Our Story
            </button>
          </div>
          <div className="hidden lg:block w-72 h-52 bg-white/10 rounded-2xl border border-white/20" />
        </div>
      </div>

      {/* Our Story */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold text-[#1a3c8f] uppercase tracking-widest mb-2">OUR STORY</p>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                Empowering Futures. Connecting Possibilities.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                StarzLink was founded with a simple mission - to bridge the gap between talented individuals and life-changing opportunities. We believe that everyone deserves access to the right resources, guidance and platforms to learn, grow and succeed.
              </p>
              <p className="text-gray-600 leading-relaxed mb-5">
                Through our platform, we connect students and professionals to opportunities in scholarships, jobs, trainings and campus updates that drive personal and professional growth.
              </p>
              <Link href="/opportunities" className="flex items-center gap-1.5 text-[#1a3c8f] font-semibold hover:underline">
                Learn More About Us <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Target, title: "Our Mission", desc: "To empower individuals by connecting them to verified opportunities, quality training and essential resources." },
                { icon: Eye, title: "Our Vision", desc: "To be the leading platform that inspires and equips individuals to achieve their dreams and create impact." },
                { icon: CheckCircle, title: "Our Values", list: values.map(v => v.title) },
              ].map(({ icon: Icon, title, desc, list }) => (
                <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
                  <Icon className="w-8 h-8 text-[#1a3c8f] mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  {desc && <p className="text-xs text-gray-500">{desc}</p>}
                  {list && <ul className="text-xs text-gray-500 space-y-1">{list.map(v => <li key={v}>{v}</li>)}</ul>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center p-4">
              <Icon className="w-7 h-7 text-blue-300 mx-auto mb-2" />
              <div className="text-3xl font-extrabold text-white">{value}</div>
              <div className="text-blue-200 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose StarzLink */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-4 left-4 bg-[#1a3c8f] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Trusted Platform
              </div>
              <div className="pt-10 pb-4 text-center">
                <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                  <Users className="w-16 h-16 text-[#1a3c8f]" />
                </div>
                <p className="text-sm text-gray-500 mt-3">We verify every opportunity to ensure trust and reliability.</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a3c8f] uppercase tracking-widest mb-2">WHY CHOOSE STARZLINK</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Your Success, Our Priority</h2>
              <p className="text-gray-500 mb-6">We are committed to providing a seamless and reliable experience that helps you stay ahead.</p>
              <div className="grid grid-cols-2 gap-4">
                {whyChoose.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#1a3c8f]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{title}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Our Partners</p>
              <p className="text-gray-600 text-sm">We work with trusted organizations and institutions worldwide.</p>
            </div>
            <button className="text-sm text-[#1a3c8f] hover:underline font-medium flex items-center gap-1">View All Partners <ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {partners.map((partner) => (
              <div key={partner} className="px-6 py-3 bg-gray-50 rounded-xl text-gray-600 font-semibold hover:bg-blue-50 hover:text-[#1a3c8f] transition-colors text-sm">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-gradient-to-r from-[#1a3c8f] to-[#2563eb] text-white text-center">
        <h2 className="text-3xl font-extrabold mb-3">Join the StarzLink Community</h2>
        <p className="text-blue-200 mb-6">Be part of a growing network of students, graduates and professionals building a better future.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/signup" className="bg-white text-[#1a3c8f] font-bold px-7 py-3 rounded-xl hover:bg-blue-50 transition-colors">Get Started Free</Link>
          <Link href="/contact" className="bg-white/15 border border-white/30 text-white font-bold px-7 py-3 rounded-xl hover:bg-white/25 transition-colors">Partner With Us</Link>
        </div>
      </section>
    </div>
  );
}
