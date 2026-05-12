"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, Mail, Phone, MapPin, Clock } from "lucide-react";
import { newsletterApi } from "@/lib/api";
import toast from "react-hot-toast";
import StarzLinkLogo from "@/components/ui/StarzLinkLogo";

const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await newsletterApi.subscribe(email);
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#0d1b4b] text-gray-300 mt-auto">
      {/* WhatsApp Banner */}
      <div className="bg-[#25D366] py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium">Join our WhatsApp Channel for daily updates!</span>
          </div>
          <a
            href={WHATSAPP_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white text-[#25D366] font-bold text-sm px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Join Now →
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-3">
              <StarzLinkLogo size="sm" variant="light" showTagline={true} href="/" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Empowering students and professionals by connecting them to opportunities, resources and updates that shape a better future.
            </p>
            <div className="flex gap-3">
              {[
              { label: "FB", href: "#" },
              { label: "TW", href: "#" },
              { label: "IG", href: "#" },
              { label: "YT", href: "#" },
              { label: "IN", href: "#" },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="w-8 h-8 bg-white/10 hover:bg-[#1a3c8f] rounded-lg flex items-center justify-center transition-colors text-xs font-bold">
                {label}
              </a>
            ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Opportunities", href: "/opportunities" },
                { label: "Trainings", href: "/trainings" },
                { label: "Campus Updates", href: "/campus-updates" },
                { label: "Resources", href: "/resources" },
                { label: "About Us", href: "/about" },
                { label: "Contact Us", href: "/contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: "Blog", href: "/resources" },
                { label: "Career Guidance", href: "/resources?category=career" },
                { label: "Interview Tips", href: "/resources?category=interview" },
                { label: "CV Templates", href: "/resources?category=cv-templates" },
                { label: "Study Abroad", href: "/resources?category=study-abroad" },
                { label: "Help Center", href: "/contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Connected</h4>
            <p className="text-sm text-gray-400 mb-3">Subscribe to our newsletter and never miss an update.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 min-w-0"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-4 py-2 bg-[#1a3c8f] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {subscribing ? "..." : "Subscribe"}
              </button>
            </form>

            {/* WhatsApp */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-gray-400 mb-2 font-medium">Join Our WhatsApp Channel</p>
              <a
                href={WHATSAPP_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Join Now →
              </a>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0" /> support@starzlink.com</div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0" /> +234 800 123 4567</div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0" /> 123 Opportunity Avenue, Yaba, Lagos</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 flex-shrink-0" /> Mon - Fri: 9:00 AM - 6:00 PM (WAT)</div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© 2025 StarzLink. All Rights Reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
