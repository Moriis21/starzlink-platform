"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ChevronRight, ChevronDown, Send, MessageCircle, Users } from "lucide-react";
import { messagesApi } from "@/lib/api";
import toast from "react-hot-toast";

const faqs = [
  { q: "How can I submit an opportunity on StarzLink?", a: "You can submit an opportunity by creating an account and using the 'Submit Opportunity' feature in your dashboard, or by contacting us through this form." },
  { q: "Is StarzLink free to use?", a: "Yes, StarzLink is completely free for students, graduates and professionals. We believe everyone deserves access to opportunities." },
  { q: "How do I get updates about new opportunities?", a: "You can subscribe to our newsletter, join our WhatsApp channel, or enable notifications on your dashboard to stay updated." },
  { q: "Can institutions partner with StarzLink?", a: "Absolutely! We welcome partnerships with universities, NGOs, companies and other institutions. Use the 'Partner With Us' button to get started." },
  { q: "How can I report an issue or provide feedback?", a: "You can report issues or provide feedback through this contact form or by emailing support@starzlink.com directly." },
];

export default function ContactPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", subject: "", category: "", message: "" });
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { toast.error("Please agree to the Privacy Policy."); return; }
    setSubmitting(true);
    try {
      await messagesApi.send(form);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ full_name: "", email: "", phone: "", subject: "", category: "", message: "" });
      setAgree(false);
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">Contact Us</h1>
            <p className="text-blue-200">We're here to help! Reach out to us for any questions, support or feedback.</p>
            <div className="text-sm text-blue-300 mt-2">
              <Link href="/" className="hover:text-white">Home</Link> <span className="mx-1">›</span> Contact Us
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center w-40 h-28">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-300" />
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-400/30 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Get in Touch</h2>
            <p className="text-gray-500 text-sm mb-4">We'd love to hear from you. Choose the best way to reach us.</p>

            {[
              { icon: Mail, title: "Email Us", sub: "Send us an email anytime.", value: "support@starzlink.com", href: "mailto:support@starzlink.com" },
              { icon: Phone, title: "Call Us", sub: "Mon - Fri: 9:00 AM - 6:00 PM (GMT)", value: "+231 770 787 020 / 0888 283 007", href: "tel:+231770787020" },
              { icon: MapPin, title: "Visit Our Office", sub: "Monrovia, Liberia", value: "", href: "#" },
              { icon: Clock, title: "Working Hours", sub: "Monday - Friday", value: "9:00 AM - 6:00 PM (GMT)", href: "" },
            ].map(({ icon: Icon, title, sub, value, href }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start justify-between group hover:border-[#1a3c8f] hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#1a3c8f]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                    {value && <p className="text-sm text-[#1a3c8f] font-medium mt-0.5">{value}</p>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1a3c8f] flex-shrink-0 mt-1" />
              </div>
            ))}

            {/* Partnership */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-[#1a3c8f]" />
                <span className="font-semibold text-gray-900 text-sm">Partnerships & Collaborations</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Interested in partnering with StarzLink? Let's build something impactful together.</p>
              <button className="border border-[#1a3c8f] text-[#1a3c8f] font-medium text-sm px-4 py-2 rounded-lg hover:bg-[#1a3c8f] hover:text-white transition-colors">Partner With Us</button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Send Us a Message</h2>
              <p className="text-gray-500 text-sm mb-5">Fill out the form below and we'll get back to you as soon as possible.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                    <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Enter your full name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Enter your email address" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f]" required />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white" required>
                    <option value="">Select a subject</option>
                    <option>General Inquiry</option>
                    <option>Partnership</option>
                    <option>Support</option>
                    <option>Submit Opportunity</option>
                    <option>Technical Issue</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                      <option value="">Select a category</option>
                      <option>Jobs</option>
                      <option>Scholarships</option>
                      <option>Trainings</option>
                      <option>Campus Updates</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Phone Number (Optional)</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Enter your phone number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} placeholder="Type your message here..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] focus:ring-1 focus:ring-[#1a3c8f] resize-none" required />
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" id="agree" checked={agree} onChange={e => setAgree(e.target.checked)} className="accent-[#1a3c8f] mt-0.5" />
                  <label htmlFor="agree" className="text-xs text-gray-500">
                    I agree to the <Link href="/privacy" className="text-[#1a3c8f] hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-[#1a3c8f] hover:underline">Terms of Use</Link>.
                  </label>
                </div>

                <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60">
                  <Send className="w-4 h-4" /> {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ + Map */}
        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <button className="text-sm text-[#1a3c8f] hover:underline">View All FAQs</button>
            </div>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-gray-900 text-left">
                    {faq.q}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Find Us</h2>
            <div className="bg-gray-100 rounded-2xl h-56 flex items-center justify-center mb-3 overflow-hidden">
              <div className="text-center text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Map View</p>
                <p className="text-xs">Monrovia, Liberia</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">StarzLink Office</p>
                <p className="text-xs text-gray-500">Monrovia, Liberia</p>
              </div>
              <a href="https://maps.google.com/maps?q=Monrovia,Liberia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-bold text-[#1a3c8f] border border-[#1a3c8f] px-3 py-2 rounded-xl hover:bg-blue-50 whitespace-nowrap">
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-10 bg-gradient-to-r from-[#1a3c8f] to-[#2563eb] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div>
            <h3 className="text-2xl font-extrabold mb-1">Stay Connected, Never Miss Out!</h3>
            <p className="text-blue-200 text-sm">Subscribe to our newsletter for the latest opportunities, updates and tips.</p>
          </div>
          <form className="flex gap-2 w-full md:w-auto">
            <input type="email" placeholder="Enter your email address" className="flex-1 md:w-64 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none" />
            <button type="submit" className="px-5 py-3 bg-white text-[#1a3c8f] font-bold rounded-xl hover:bg-blue-50 whitespace-nowrap text-sm">Subscribe</button>
          </form>
        </div>
      </div>
    </div>
  );
}
