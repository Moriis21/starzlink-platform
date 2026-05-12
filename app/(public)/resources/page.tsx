"use client";

import { useState, useEffect } from "react";
import { Download, Eye, BookOpen, FileText, Video, Lightbulb, GraduationCap, Globe, Wrench, FolderOpen, Users, ChevronRight, Bell } from "lucide-react";
import { resourcesApi, newsletterApi } from "@/lib/api";
import { Resource } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";

const resourceCategories = [
  { id: "guides", label: "Guides & eBooks", icon: BookOpen, color: "bg-blue-50 text-blue-600 border-blue-100", count: "120+" },
  { id: "templates", label: "Templates", icon: FileText, color: "bg-purple-50 text-purple-600 border-purple-100", count: "60+" },
  { id: "videos", label: "Video Tutorials", icon: Video, color: "bg-red-50 text-red-600 border-red-100", count: "80+" },
  { id: "tips", label: "Tips & Articles", icon: Lightbulb, color: "bg-yellow-50 text-yellow-600 border-yellow-100", count: "200+" },
  { id: "institutions", label: "Partner Institutions", icon: Users, color: "bg-pink-50 text-pink-600 border-pink-100", count: "500+" },
  { id: "study-abroad", label: "Study Abroad", icon: Globe, color: "bg-teal-50 text-teal-600 border-teal-100", count: "50+" },
  { id: "career", label: "Career Tools", icon: Wrench, color: "bg-orange-50 text-orange-600 border-orange-100", count: "30+" },
  { id: "downloads", label: "Downloads", icon: Download, color: "bg-green-50 text-green-600 border-green-100", count: "100+" },
];

const popularResources = [
  "How to Write a Winning CV",
  "Interview Preparation Guide",
  "Scholarship Application Guide",
  "Personal Statement Samples",
  "Career Planning Toolkit",
];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const params: Record<string, string> = { status: "active" };
        if (selectedCat) params.category = selectedCat;
        const res = await resourcesApi.getAll(params);
        setResources(res.data?.data || res.data || []);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [selectedCat]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await newsletterApi.subscribe(email);
      toast.success("Subscribed!");
      setEmail("");
    } catch { toast.error("Failed."); }
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white">
        <div className="max-w-7xl mx-auto flex items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-2">Resources for Your Success</h1>
            <p className="text-blue-200">Access helpful guides, templates, tips and tools to support your academic and career journey.</p>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-sm text-blue-200">
            <div className="text-center"><p className="text-3xl font-extrabold text-white">10K+</p><p>Resources Available</p></div>
            <div className="text-center"><p className="text-3xl font-extrabold text-white">500+</p><p>Partner Institutions</p></div>
            <div className="text-center"><p className="text-3xl font-extrabold text-white">50+</p><p>Countries Covered</p></div>
            <div className="text-center"><p className="text-3xl font-extrabold text-white">100%</p><p>Trusted Content</p></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-500">
        <Link href="/">Home</Link> › <span className="text-gray-900">Resources</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 flex gap-6">
        {/* Main */}
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Explore Resources</h2>

          {/* Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {resourceCategories.map(({ id, label, icon: Icon, color, count }) => (
              <button
                key={id}
                onClick={() => setSelectedCat(selectedCat === id ? "" : id)}
                className={`rounded-2xl border p-5 text-left hover:shadow-md transition-all group ${selectedCat === id ? "border-[#1a3c8f] shadow-md bg-blue-50" : "bg-white border-gray-100"}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${color} border`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{label}</h3>
                <p className="text-xs text-gray-400 mb-3">{count === "500+" ? "Discover our global partner institutions and opportunities." : count === "80+" ? "Watch expert-led tutorials on in-demand skills." : "Access guides, templates and tools."}</p>
                <span className={`text-xs font-semibold flex items-center gap-1 ${selectedCat === id ? "text-[#1a3c8f]" : "text-gray-500"} group-hover:text-[#1a3c8f]`}>
                  {count} <ChevronRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>

          {/* Resources List */}
          {selectedCat && (
            <div>
              <h3 className="font-bold text-gray-900 text-xl mb-4">
                {resourceCategories.find(c => c.id === selectedCat)?.label}
              </h3>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-48" />)}
                </div>
              ) : resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 group">
                      {resource.image_url ? (
                        <img src={resource.image_url} alt={resource.title} className="w-full h-32 object-cover rounded-xl mb-3" />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
                          <FolderOpen className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900 group-hover:text-[#1a3c8f] transition-colors mb-2 line-clamp-2">{resource.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{resource.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>{formatDate(resource.created_at)}</span>
                      </div>
                      <div className="flex gap-2">
                        {resource.file_url && (
                          <a href={resource.file_url} download className="flex-1 flex items-center justify-center gap-1.5 bg-[#1a3c8f] text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-900">
                            <Download className="w-4 h-4" /> Download
                          </a>
                        )}
                        <Link href={`/resources/${resource.id}`} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-medium hover:border-[#1a3c8f] hover:text-[#1a3c8f]">
                          <Eye className="w-4 h-4" /> View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No resources in this category yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden xl:block w-72 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Popular Resources</h3>
            <div className="space-y-2">
              {popularResources.map((title, i) => (
                <button key={i} className="flex items-center justify-between w-full py-2 text-sm text-gray-700 hover:text-[#1a3c8f] border-b border-gray-50 last:border-0">
                  <span>{title}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
            <h3 className="font-bold text-gray-900 mb-2">Request a Resource</h3>
            <p className="text-sm text-gray-500 mb-3">Can't find what you're looking for? Request it and we'll get it for you.</p>
            <Link href="/contact" className="flex items-center justify-center gap-1.5 bg-[#1a3c8f] text-white font-bold text-sm py-2.5 rounded-xl hover:bg-blue-900">Request Now →</Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <Bell className="w-6 h-6 text-[#1a3c8f] mb-2" />
            <h3 className="font-bold text-gray-900 mb-2">Stay Updated!</h3>
            <p className="text-sm text-gray-500 mb-3">Subscribe for new resources and tips.</p>
            <form onSubmit={handleSubscribe}>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none" />
              <button type="submit" className="w-full bg-[#1a3c8f] text-white text-sm font-bold py-2 rounded-lg hover:bg-blue-900">Subscribe</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}

