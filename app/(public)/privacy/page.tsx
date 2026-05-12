import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ChevronRight, Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Privacy Policy — StarzLink" };

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Personal Information",
        text: "When you register on StarzLink, we collect information such as your full name, email address, phone number, educational background, and user type (student, graduate, professional, or institution). This information is provided by you voluntarily during the registration or profile completion process.",
      },
      {
        subtitle: "Usage Information",
        text: "We automatically collect certain information about your device and how you interact with our platform, including your IP address, browser type, operating system, referring URLs, pages viewed, search queries, and the dates and times of your visits.",
      },
      {
        subtitle: "Profile Information",
        text: "You may optionally provide additional profile details such as a profile photo, your institution or employer, your field of study, and career interests. This information helps us personalize your experience and surface more relevant opportunities.",
      },
      {
        subtitle: "Communications",
        text: "If you contact us through our contact form, submit a campus update, or communicate with our team, we retain those messages and any information you include in them.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "Providing and Improving the Platform",
        text: "We use your information to operate StarzLink, display relevant opportunities, personalize your dashboard, and continuously improve our features and services.",
      },
      {
        subtitle: "Communications and Notifications",
        text: "With your consent, we send email notifications about new scholarships, jobs, trainings, and campus updates. You may opt out of marketing emails at any time by clicking the unsubscribe link in any email or contacting us directly.",
      },
      {
        subtitle: "Security and Fraud Prevention",
        text: "We use account and usage information to detect, investigate, and prevent fraudulent transactions, unauthorized access, and other illegal activities, and to enforce our Terms of Use.",
      },
      {
        subtitle: "Analytics and Research",
        text: "We analyze aggregated, anonymized data to understand usage trends, measure the effectiveness of our platform, and plan new features. This data cannot be used to identify you personally.",
      },
    ],
  },
  {
    id: "information-sharing",
    title: "3. Information Sharing and Disclosure",
    content: [
      {
        subtitle: "We Do Not Sell Your Data",
        text: "StarzLink does not sell, trade, or rent your personal information to third parties for their marketing purposes.",
      },
      {
        subtitle: "Service Providers",
        text: "We share information with trusted third-party service providers who assist us in operating our platform (such as cloud hosting, email delivery, and analytics services). These providers are contractually required to keep your information confidential and use it only for the services they provide to us.",
      },
      {
        subtitle: "Partner Institutions",
        text: "If you apply to an opportunity or scholarship through a partner university or organization on our platform, the relevant information you submit as part of that application may be shared with that institution.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required to do so by law or in response to valid requests by public authorities (such as a court or government agency).",
      },
    ],
  },
  {
    id: "data-security",
    title: "4. Data Security",
    content: [
      {
        subtitle: "Security Measures",
        text: "We implement industry-standard security measures including encryption in transit (HTTPS/TLS), secure authentication, and access controls to protect your personal information from unauthorized access, alteration, disclosure, or destruction.",
      },
      {
        subtitle: "No Absolute Guarantee",
        text: "While we strive to protect your personal information, no method of transmission over the internet or electronic storage is 100% secure. We encourage you to use a strong, unique password and to notify us immediately if you suspect any unauthorized use of your account.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "5. Your Rights and Choices",
    content: [
      {
        subtitle: "Access and Correction",
        text: "You may access and update your personal information at any time through your account dashboard under Profile Settings.",
      },
      {
        subtitle: "Data Deletion",
        text: "You may request deletion of your account and associated personal data by contacting us at morrisldorleyjr21@gmail.com. We will process your request within 30 days, subject to any legal obligations to retain certain data.",
      },
      {
        subtitle: "Marketing Communications",
        text: "You may opt out of marketing and notification emails by using the unsubscribe link in our emails or by updating your notification preferences in your account settings.",
      },
      {
        subtitle: "Cookies",
        text: "You may control cookie usage through your browser settings. Please refer to our Cookie Policy for more information.",
      },
    ],
  },
  {
    id: "children",
    title: "6. Children's Privacy",
    content: [
      {
        subtitle: "",
        text: "StarzLink is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a child, please contact us immediately so we can delete it.",
      },
    ],
  },
  {
    id: "third-party",
    title: "7. Third-Party Links",
    content: [
      {
        subtitle: "",
        text: "Our platform may contain links to external websites, scholarship portals, job boards, and partner institution pages. We are not responsible for the privacy practices of those sites. We encourage you to read their privacy policies before providing any personal information.",
      },
    ],
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    content: [
      {
        subtitle: "",
        text: "We may update this Privacy Policy from time to time. We will notify registered users of significant changes by email and will update the 'Last Updated' date at the top of this page. Your continued use of StarzLink after such changes constitutes your acceptance of the updated policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content: [
      {
        subtitle: "",
        text: "If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us using the information below. We aim to respond within 5 business days.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-blue-200" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-blue-200 text-sm">Last Updated: May 12, 2026</p>
          <p className="text-blue-200 mt-3 max-w-2xl mx-auto">
            Your privacy matters to us. This policy explains how StarzLink collects, uses, and protects your personal information.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> <ChevronRight className="inline w-3 h-3" /> <span className="text-gray-900">Privacy Policy</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 grid lg:grid-cols-4 gap-8">
        {/* Table of Contents */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6 shadow-sm">
            <h2 className="font-bold text-gray-900 text-sm mb-3">Contents</h2>
            <nav className="space-y-1">
              {sections.map(s => (
                <a key={s.id} href={`#${s.id}`} className="block text-xs text-gray-500 hover:text-[#1a3c8f] py-1 hover:underline transition-colors">
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="lg:col-span-3 space-y-8">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
            <strong>Summary:</strong> We collect only the information necessary to run StarzLink. We do not sell your data. You can delete your account at any time. We use industry-standard security practices to keep your information safe.
          </div>

          {sections.map(s => (
            <section key={s.id} id={s.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm scroll-mt-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">{s.title}</h2>
              <div className="space-y-4">
                {s.content.map((c, i) => (
                  <div key={i}>
                    {c.subtitle && <h3 className="font-semibold text-gray-800 mb-1">{c.subtitle}</h3>}
                    <p className="text-gray-600 text-sm leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>

              {s.id === "contact" && (
                <div className="mt-5 grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Mail, label: "Email", value: "morrisldorleyjr21@gmail.com" },
                    { icon: Phone, label: "Phone", value: "+231 770 787 020" },
                    { icon: MapPin, label: "Address", value: "Monrovia, Liberia" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                      <div className="w-8 h-8 bg-[#1a3c8f] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className="text-sm text-gray-900 font-medium mt-0.5 break-all">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          <div className="flex flex-wrap gap-4 text-sm text-center">
            <Link href="/terms" className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-colors font-medium">
              Terms of Use →
            </Link>
            <Link href="/cookies" className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-colors font-medium">
              Cookie Policy →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
