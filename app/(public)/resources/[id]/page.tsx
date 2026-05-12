"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, Eye, ChevronLeft, Share2 } from "lucide-react";
import { resourcesApi } from "@/lib/api";
import { Resource } from "@/types";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ResourceDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await resourcesApi.getOne(id as string);
        setItem(res.data?.data || res.data);
      } catch { toast.error("Failed to load."); }
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded mb-4 w-3/4" /><div className="h-48 bg-gray-100 rounded mt-6" /></div>;
  if (!item) return <div className="text-center py-20"><h2 className="text-2xl font-bold mb-2">Resource not found</h2><Link href="/resources" className="text-[#1a3c8f] hover:underline">← Back to Resources</Link></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/resources" className="flex items-center gap-1 text-[#1a3c8f] text-sm mb-6 hover:underline"><ChevronLeft className="w-4 h-4" /> Back to Resources</Link>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-xl mb-6" />}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{item.category}</span>
          <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">{item.title}</h1>
        <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>
        <div className="flex gap-3">
          {item.file_url && (
            <a href={item.file_url} download className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors">
              <Download className="w-4 h-4" /> Download Resource
            </a>
          )}
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }} className="flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl hover:border-[#1a3c8f] transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
