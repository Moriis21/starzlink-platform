"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Building2, Clock, Mail, ExternalLink, Bookmark, ChevronLeft, CheckCircle, Banknote, AlertCircle } from "lucide-react";
import { jobsApi } from "@/lib/api";
import { Job } from "@/types";
import { formatDate, getDaysLeft, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import WhatsAppBanner from "@/components/ui/WhatsAppBanner";
import AuthGate from "@/components/ui/AuthGate";
import ShareButtons from "@/components/ui/ShareButtons";

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await jobsApi.getOne(id as string);
        setJob(res.data?.data || res.data);
      } catch { toast.error("Failed to load job details."); }
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 rounded mb-4 w-3/4" />
      <div className="h-4 bg-gray-100 rounded mb-2 w-1/2" />
      <div className="h-64 bg-gray-100 rounded mt-6" />
    </div>
  );

  if (!job) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-gray-400" /></div>
      <h2 className="text-2xl font-bold mb-2">Job not found</h2>
      <Link href="/opportunities/jobs" className="text-[#1a3c8f] hover:underline">← Back to Jobs</Link>
    </div>
  );

  const daysLeft = getDaysLeft(job.deadline);

  const heroPreview = (
    <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-10 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <Link href="/opportunities/jobs" className="flex items-center gap-1 text-blue-300 text-sm mb-4 hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Back to Jobs
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-8 h-8 text-[#1a3c8f]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{job.title}</h1>
            <p className="text-blue-200">{job.company} · {job.location}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AuthGate preview={heroPreview}>
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-10 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <Link href="/opportunities/jobs" className="flex items-center gap-1 text-blue-300 text-sm mb-4 hover:text-white">
            <ChevronLeft className="w-4 h-4" /> Back to Jobs
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-[#1a3c8f]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", job.status === "active" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300")}>
                  {job.status?.toUpperCase()}
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">{job.job_type}</span>
              </div>
              <h1 className="text-3xl font-extrabold mb-1">{job.title}</h1>
              <p className="text-blue-200">{job.company}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#1a3c8f]">Home</Link> › <Link href="/opportunities/jobs" className="hover:text-[#1a3c8f]">Jobs</Link> › {job.title}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: MapPin, label: "Location", value: job.location },
                { icon: Clock, label: "Job Type", value: job.job_type },
                { icon: Calendar, label: "Deadline", value: formatDate(job.deadline) },
                { icon: Building2, label: "Company", value: job.company },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 text-[#1a3c8f] mx-auto mb-1" />
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{value}</p>
                </div>
              ))}
            </div>

            {job.salary && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-2">
                <Banknote className="w-7 h-7 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Salary / Compensation</p>
                  <p className="font-bold text-green-800">{job.salary}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {job.description && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-3">Job Description</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-3">Responsibilities</h2>
                <div className="space-y-2">
                  {job.responsibilities.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 text-lg mb-3">Requirements</h2>
                <div className="space-y-2">
                  {job.requirements.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1a3c8f] flex-shrink-0 mt-2" />
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              {daysLeft > 0 ? (
                <div className={cn("text-center mb-4 p-3 rounded-xl", daysLeft <= 7 ? "bg-red-50" : "bg-green-50")}>
                  <p className={cn("text-2xl font-extrabold", daysLeft <= 7 ? "text-red-700" : "text-green-700")}>{daysLeft} days left</p>
                  <p className={cn("text-xs", daysLeft <= 7 ? "text-red-500" : "text-green-500")}>Deadline: {formatDate(job.deadline)}</p>
                </div>
              ) : (
                <div className="text-center mb-4 p-3 bg-red-50 rounded-xl">
                  <p className="text-red-700 font-bold">Application Closed</p>
                </div>
              )}

              <div className="mb-3">
                <ShareButtons title={job.title} description={job.description} />
              </div>

              <a
                href={job.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#1a3c8f] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors mb-3"
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => { setSaved(!saved); toast.success(saved ? "Removed from saved" : "Saved successfully!"); }}
                  className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 border rounded-xl text-sm font-medium transition-colors", saved ? "bg-blue-50 border-[#1a3c8f] text-[#1a3c8f]" : "border-gray-200 text-gray-600 hover:border-[#1a3c8f]")}
                >
                  <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
                </button>
              </div>

              {job.contact_email && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Contact</p>
                  <a href={`mailto:${job.contact_email}`} className="flex items-center gap-1.5 text-sm text-[#1a3c8f] hover:underline">
                    <Mail className="w-4 h-4" />{job.contact_email}
                  </a>
                </div>
              )}
            </div>

            {/* WhatsApp */}
            <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] rounded-2xl p-4 text-white">
              <p className="font-bold mb-1 text-sm">Get More Jobs on WhatsApp</p>
              <p className="text-xs text-green-200 mb-3">Join our channel for daily job updates.</p>
              <a href="https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white text-[#075E54] font-bold text-sm px-4 py-2 rounded-lg hover:bg-green-50 w-full justify-center">
                Join Now →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGate>
  );
}
