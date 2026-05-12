import type { Metadata } from "next";
import Link from "next/link";
import BrandImage from "@/components/ui/BrandImage";
import {
  Target, Eye, CheckCircle, Shield, Star, Globe, Users, TrendingUp,
  ChevronRight, BadgeCheck, LayoutGrid, Bell, Monitor, Heart, Award, Lightbulb, Play
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
      {/* Hero — with team image */}
      <div className="relative bg-[#0d1b4b] py-20 px-4 text-white overflow-hidden">
        <div className="absolute inset-0">
          <BrandImage
            src="/images/hero-students.jpg"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1b4b]/95 via-[#0d1b4b]/80 to-[#1a3c8f]/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">ABOUT STARZLINK</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Empowering Minds.<br />
              <span className="text-blue-300">Creating Impact.</span><br />
              Inspiring Futures.
            </h1>
            <p className="text-blue-200 text-lg mb-6 leading-relaxed">
              We connect students and professionals to life-changing opportunities, knowledge and resources that empower them to build a better future.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="flex items-center gap-2 bg-white text-[#0d1b4b] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                Join StarzLink <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25 transition-colors">
                Partner With Us
              </Link>
            </div>
          </div>
          {/* Mission / Vision quick cards */}
          <div className="hidden lg:grid grid-cols-1 gap-4">
            {[
              { icon: Target, title: "Our Mission", text: "To connect and empower young people by providing access to opportunities that inspire growth, create impact, and build a better future." },
              { icon: Eye, title: "Our Vision", text: "A world where every young person has equal access to opportunities to thrive and lead change." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-200" />
                  </div>
                  <h3 className="font-bold text-white">{title}</h3>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Team image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-72 lg:h-[460px] bg-gradient-to-br from-[#0d1b4b] to-[#1a3c8f]">
              <BrandImage
                src="/images/explore-opportunities.jpg"
                alt="StarzLink team — connect, grow, get opportunities"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Overlay brand tags */}
              <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 text-center flex-1">
                  <p className="text-xs font-bold text-[#0d1b4b] uppercase tracking-wide">Connect</p>
                </div>
                <div className="bg-[#1a3c8f] text-white rounded-xl px-3 py-2 text-center flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide">Grow</p>
                </div>
                <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 text-center flex-1">
                  <p className="text-xs font-bold text-[#0d1b4b] uppercase tracking-wide">Opportunity</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#1a3c8f] uppercase tracking-widest mb-3">OUR STORY</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                Empowering Futures.<br />Connecting Possibilities.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                StarzLink was founded with a simple mission — to bridge the gap between talented individuals and life-changing opportunities. We believe that everyone deserves access to the right resources, guidance and platforms to learn, grow and succeed.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Through our platform, we connect students and professionals to opportunities in scholarships, jobs, trainings and campus updates that drive personal and professional growth.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Target, title: "Our Mission", text: "Connecting talent to opportunities." },
                  { icon: Eye, title: "Our Vision", text: "Equal access for all." },
                  { icon: CheckCircle, title: "Our Values", text: "Integrity, Excellence, Impact." },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                    <Icon className="w-6 h-6 text-[#1a3c8f] mx-auto mb-2" />
                    <p className="font-bold text-gray-900 text-xs mb-1">{title}</p>
                    <p className="text-xs text-gray-500">{text}</p>
                  </div>
                ))}
              </div>
              <Link href="/opportunities" className="inline-flex items-center gap-1.5 bg-[#1a3c8f] text-white font-bold px-5 py-3 rounded-xl hover:bg-blue-900 transition-colors text-sm">
                Explore Opportunities <ChevronRight className="w-4 h-4" />
              </Link>
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
