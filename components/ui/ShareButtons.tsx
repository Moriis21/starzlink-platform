"use client";
import { useState } from "react";
import { Share2, MessageCircle, Link2, Check } from "lucide-react";

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

      {/* WhatsApp */}
      <button onClick={whatsapp}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity">
        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
      </button>

      {/* Facebook — inline SVG (not in lucide) */}
      <button onClick={facebook}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </button>

      {/* X / Twitter — inline SVG (not in lucide) */}
      <button onClick={twitter}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        X
      </button>

      {/* Copy Link */}
      <button onClick={copy}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">
        {copied
          ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
          : <><Link2 className="w-3.5 h-3.5" /> Copy Link</>
        }
      </button>
    </div>
  );
}
