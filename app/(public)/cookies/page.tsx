import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, ChevronRight, CheckCircle, XCircle, Settings } from "lucide-react";

export const metadata: Metadata = { title: "Cookie Policy — StarzLink" };

const cookieTypes = [
  {
    name: "Essential Cookies",
    purpose: "Required for the platform to function. These handle authentication sessions, security tokens, and basic site functionality.",
    examples: ["Session authentication token", "CSRF protection token", "User preference storage"],
    canDisable: false,
    color: "bg-green-100 text-green-700",
    badge: "Always Active",
  },
  {
    name: "Functional Cookies",
    purpose: "Remember your preferences and settings to personalize your experience on StarzLink.",
    examples: ["Saved opportunity filters", "Notification preferences", "Language and display settings"],
    canDisable: true,
    color: "bg-blue-100 text-blue-700",
    badge: "Optional",
  },
  {
    name: "Analytics Cookies",
    purpose: "Help us understand how users interact with the platform so we can improve features and content.",
    examples: ["Page views and navigation paths", "Feature usage statistics", "Error tracking and performance monitoring"],
    canDisable: true,
    color: "bg-purple-100 text-purple-700",
    badge: "Optional",
  },
  {
    name: "Marketing Cookies",
    purpose: "Used to track visits across websites and measure the effectiveness of our promotional campaigns.",
    examples: ["Social media sharing buttons", "Referral source tracking", "Campaign performance data"],
    canDisable: true,
    color: "bg-orange-100 text-orange-700",
    badge: "Optional",
  },
];

export default function CookiesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-7 h-7 text-blue-200" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Cookie Policy</h1>
          <p className="text-blue-200 text-sm">Last Updated: May 12, 2026</p>
          <p className="text-blue-200 mt-3 max-w-2xl mx-auto">
            This policy explains how StarzLink uses cookies and similar tracking technologies on our platform.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> <ChevronRight className="inline w-3 h-3" /> <span className="text-gray-900">Cookie Policy</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-8">

        {/* What are cookies */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" id="what-are-cookies">
          <h2 className="text-xl font-extrabold text-gray-900 mb-3">What Are Cookies?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work, to improve efficiency, and to provide information to website owners. Cookies allow the website to recognize your device and remember certain information about your visit, such as your language preference or login status.
          </p>
        </section>

        {/* How we use cookies */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" id="how-we-use">
          <h2 className="text-xl font-extrabold text-gray-900 mb-3">How StarzLink Uses Cookies</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            StarzLink uses cookies to keep you logged in, remember your preferences, understand how you use our platform, and improve your experience. We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device for a set period).
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Authentication", desc: "Keep you securely logged in across pages and sessions." },
              { title: "Preferences", desc: "Remember your filter settings, notification choices, and display options." },
              { title: "Performance", desc: "Measure how features are used to guide our improvements." },
            ].map(item => (
              <div key={item.title} className="bg-blue-50 rounded-xl p-4">
                <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Types of cookies */}
        <section id="cookie-types">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Types of Cookies We Use</h2>
          <div className="space-y-4">
            {cookieTypes.map(cookie => (
              <div key={cookie.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">{cookie.name}</h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cookie.color}`}>{cookie.badge}</span>
                  </div>
                  {cookie.canDisable ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <XCircle className="w-4 h-4 text-gray-400" /> Can be disabled
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-green-700">
                      <CheckCircle className="w-4 h-4 text-green-500" /> Always required
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{cookie.purpose}</p>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Examples</p>
                  <div className="flex flex-wrap gap-2">
                    {cookie.examples.map(ex => (
                      <span key={ex} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{ex}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Managing cookies */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" id="managing-cookies">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#1a3c8f]/10 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#1a3c8f]" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">Managing Your Cookie Preferences</h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            You can control and manage cookies in several ways. Please note that disabling certain cookies may affect the functionality of StarzLink.
          </p>
          <div className="space-y-4">
            {[
              {
                title: "Browser Settings",
                desc: "Most browsers allow you to view, block, or delete cookies through their settings menu. Look for the 'Privacy', 'Security', or 'Cookies' section in your browser settings. Common browsers: Chrome (Settings → Privacy and Security → Cookies), Firefox (Options → Privacy & Security), Safari (Preferences → Privacy).",
              },
              {
                title: "Platform Settings",
                desc: "Once logged in, you can update your notification and data preferences in your Account Settings. Certain analytical cookies can be opted out of directly from your profile.",
              },
              {
                title: "Do Not Track",
                desc: "Some browsers include a 'Do Not Track' feature. When enabled, StarzLink will do its best to honor this signal and will not load non-essential analytics or marketing cookies.",
              },
            ].map(item => (
              <div key={item.title} className="border-l-4 border-[#1a3c8f] pl-4">
                <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Third-party */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" id="third-party">
          <h2 className="text-xl font-extrabold text-gray-900 mb-3">Third-Party Cookies</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Some pages on StarzLink may include content from third-party services (such as YouTube videos, social media widgets, or embedded maps). These third parties may set their own cookies when you interact with their content. We do not control these cookies, and they are subject to the respective third party&apos;s privacy policies.
          </p>
        </section>

        {/* Changes */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" id="changes">
          <h2 className="text-xl font-extrabold text-gray-900 mb-3">Changes to This Policy</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. When we make significant changes, we will notify you by updating the date at the top of this page and, where appropriate, by sending you an email or showing a notice on the platform.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-sm text-center">
          <Link href="/privacy" className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-colors font-medium">
            Privacy Policy →
          </Link>
          <Link href="/terms" className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-colors font-medium">
            Terms of Use →
          </Link>
        </div>
      </div>
    </div>
  );
}
