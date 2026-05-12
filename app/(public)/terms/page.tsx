import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ChevronRight, Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Terms of Use — StarzLink" };

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    text: "By accessing or using StarzLink (\"the Platform\"), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use the Platform. We reserve the right to update these Terms at any time, and your continued use of the Platform following any changes constitutes your acceptance of those changes.",
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    text: "You must be at least 13 years of age to use StarzLink. By creating an account, you represent and warrant that you are at least 13 years old, that all information you provide is accurate and truthful, and that your use of the Platform will comply with all applicable laws and regulations in Liberia and your jurisdiction.",
  },
  {
    id: "account",
    title: "3. Account Registration and Security",
    items: [
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You agree to notify us immediately of any unauthorized use of your account.",
      "You are responsible for all activities that occur under your account.",
      "You may not share your account with others or create multiple accounts for the same person.",
      "We reserve the right to suspend or terminate accounts that violate these Terms.",
    ],
  },
  {
    id: "permitted-use",
    title: "4. Permitted Use",
    text: "StarzLink is provided for lawful, personal, and professional use. You may use the Platform to:",
    items: [
      "Browse and apply for job opportunities, scholarships, and training programs.",
      "Access campus updates and educational resources.",
      "Create and manage your professional profile.",
      "Subscribe to notifications and newsletters.",
      "Contact our team or submit campus updates for review.",
    ],
  },
  {
    id: "prohibited",
    title: "5. Prohibited Activities",
    text: "You agree NOT to:",
    items: [
      "Post false, misleading, or fraudulent information.",
      "Impersonate any person, institution, or organization.",
      "Use the Platform to send spam, unsolicited messages, or phishing content.",
      "Attempt to hack, scrape, or reverse-engineer any part of the Platform.",
      "Upload malicious code, viruses, or harmful software.",
      "Use automated bots or scripts to access the Platform without our written permission.",
      "Violate any applicable laws, including privacy laws and intellectual property rights.",
      "Engage in any conduct that harasses, threatens, or harms other users.",
    ],
  },
  {
    id: "content",
    title: "6. User-Submitted Content",
    text: "When you submit content to StarzLink — including campus updates, profile information, or messages — you grant us a non-exclusive, worldwide, royalty-free license to display, distribute, and use that content in connection with operating the Platform. You represent that you have the right to submit such content and that it does not infringe on any third-party rights. We reserve the right to remove any content that violates these Terms or that we deem inappropriate, without prior notice.",
  },
  {
    id: "opportunities",
    title: "7. Opportunities and Third-Party Content",
    text: "StarzLink aggregates and publishes information about jobs, scholarships, trainings, and other opportunities from various sources. We strive to verify the authenticity of all listed opportunities; however, we cannot guarantee the accuracy, completeness, or availability of third-party listings. We encourage you to independently verify any opportunity before applying. StarzLink is not a party to any agreement between you and a third-party employer, scholarship provider, or training organization.",
  },
  {
    id: "resources",
    title: "8. Paid Resources",
    text: "Some resources on StarzLink are available for purchase (\"Paid Resources\"). All purchases are final. We do not offer refunds unless a resource is materially different from its description. Paid resources are licensed to you for personal, non-commercial use only. You may not distribute, resell, or share paid resources without our written consent.",
  },
  {
    id: "intellectual-property",
    title: "9. Intellectual Property",
    text: "All content on StarzLink — including the logo, design, text, graphics, code, and data — is owned by or licensed to StarzLink and is protected by applicable copyright and intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from our content without our express written permission.",
  },
  {
    id: "disclaimer",
    title: "10. Disclaimer of Warranties",
    text: "StarzLink is provided \"as is\" and \"as available\" without warranties of any kind, either express or implied. We do not warrant that the Platform will be error-free, uninterrupted, or free of viruses. We disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement. Your use of the Platform is at your own risk.",
  },
  {
    id: "limitation",
    title: "11. Limitation of Liability",
    text: "To the fullest extent permitted by law, StarzLink and its team members shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform, even if we have been advised of the possibility of such damages. Our total liability to you for any cause of action shall not exceed the amount you paid to StarzLink in the preceding 12 months.",
  },
  {
    id: "termination",
    title: "12. Termination",
    text: "We reserve the right to suspend or permanently terminate your access to StarzLink at any time, without notice, for conduct that we believe violates these Terms, is harmful to other users, or is detrimental to the interests of StarzLink. Upon termination, your right to use the Platform immediately ceases.",
  },
  {
    id: "governing-law",
    title: "13. Governing Law",
    text: "These Terms of Use shall be governed by and construed in accordance with the laws of the Republic of Liberia. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of Liberia.",
  },
  {
    id: "contact",
    title: "14. Contact Information",
    text: "If you have questions about these Terms of Use or need to report a violation, please contact us:",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-blue-200" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Terms of Use</h1>
          <p className="text-blue-200 text-sm">Last Updated: May 12, 2026 · Effective: May 12, 2026</p>
          <p className="text-blue-200 mt-3 max-w-2xl mx-auto">
            Please read these Terms carefully before using StarzLink. By using our platform, you agree to be bound by these Terms.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> <ChevronRight className="inline w-3 h-3" /> <span className="text-gray-900">Terms of Use</span>
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
        <main className="lg:col-span-3 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-sm text-yellow-800">
            <strong>Important:</strong> By creating an account or using StarzLink, you acknowledge that you have read, understood, and agree to these Terms of Use and our Privacy Policy.
          </div>

          {sections.map(s => (
            <section key={s.id} id={s.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm scroll-mt-6">
              <h2 className="text-xl font-extrabold text-gray-900 mb-3">{s.title}</h2>
              {s.text && <p className="text-gray-600 text-sm leading-relaxed mb-3">{s.text}</p>}
              {s.items && (
                <ul className="space-y-2">
                  {s.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-[#1a3c8f]/10 text-[#1a3c8f] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {s.id === "contact" && (
                <div className="mt-5 grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Mail, label: "Email", value: "morrisldorleyjr21@gmail.com" },
                    { icon: Phone, label: "Phone", value: "+231 770 787 020" },
                    { icon: MapPin, label: "Location", value: "Monrovia, Liberia" },
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
            <Link href="/privacy" className="flex-1 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-colors font-medium">
              Privacy Policy →
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
