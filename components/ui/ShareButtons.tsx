"use client";
import { useState } from "react";
import { Share2, MessageCircle, Facebook, Twitter, Link2, Check } from "lucide-react";

interface Props {
  title: string;
  url?: string;
  description?: string;
}

export default function ShareButtons({ title, url, description }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const text = `${title}\n\n${description ? description.slice(0, 100) + "..." : ""}\n\nFind more opportunities on StarzLink: ${shareUrl}`;

  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  const facebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  const twitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
        <Share2 className="w-4 h-4" /> Share:
      </span>
      <button onClick={whatsapp}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity">
        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
      </button>
      <button onClick={facebook}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity">
        <Facebook className="w-3.5 h-3.5" /> Facebook
      </button>
      <button onClick={twitter}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity">
        <Twitter className="w-3.5 h-3.5" /> X
      </button>
      <button onClick={copy}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">
        {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Link2 className="w-3.5 h-3.5" /> Copy Link</>}
      </button>
    </div>
  );
}
