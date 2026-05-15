"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Globe, Link2, Code2, Briefcase, Award, CheckCircle, ExternalLink, Eye, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/portfolio?username=${username}`);
      const data = await res.json();
      setPortfolio(data.portfolio);
      setLoading(false);
    };
    if (username) load();
  }, [username]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#1a3c8f]" /></div>;

  if (!portfolio || !portfolio.is_public) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-gray-400" /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Portfolio not found</h2>
        <p className="text-gray-500 mb-4">This portfolio doesn't exist or is set to private.</p>
        <Link href="/" className="text-[#1a3c8f] hover:underline">← Back to StarzLink</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-14 px-4 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-extrabold">
            {portfolio.username?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-extrabold">{portfolio.username}</h1>
          {portfolio.headline && <p className="text-blue-200 text-lg mt-2">{portfolio.headline}</p>}
          {portfolio.bio && <p className="text-white/70 mt-3 max-w-xl mx-auto text-sm leading-relaxed">{portfolio.bio}</p>}
          <div className="flex justify-center gap-3 mt-5">
            {portfolio.website && <a href={portfolio.website} target="_blank" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Globe className="w-5 h-5" /></a>}
            {portfolio.linkedin && <a href={`https://${portfolio.linkedin}`} target="_blank" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Link2 className="w-5 h-5" /></a>}
            {portfolio.github && <a href={`https://${portfolio.github}`} target="_blank" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Code2 className="w-5 h-5" /></a>}
            {portfolio.twitter && <a href={`https://${portfolio.twitter}`} target="_blank" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all" aria-label="Twitter/X"><span className="w-5 h-5 flex items-center justify-center font-bold text-sm">𝕏</span></a>}
          </div>
          <div className="flex items-center justify-center gap-1 mt-3 text-blue-300 text-xs"><Eye className="w-3.5 h-3.5" />{portfolio.views || 0} views</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Projects */}
        {portfolio.projects?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#1a3c8f]" />Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolio.projects.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
                  {p.description && <p className="text-sm text-gray-500 mb-3 line-clamp-3">{p.description}</p>}
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">{p.tags.map((t: string) => <span key={t} className="text-xs bg-blue-50 text-[#1a3c8f] px-2 py-0.5 rounded-md">{t}</span>)}</div>
                  )}
                  {p.link_url && <a href={p.link_url} target="_blank" className="flex items-center gap-1 text-xs text-[#1a3c8f] font-semibold hover:underline"><ExternalLink className="w-3.5 h-3.5" />View Project</a>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {portfolio.certifications?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" />Certifications</h2>
            <div className="space-y-3">
              {portfolio.certifications.map((c: any) => (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">{c.title}</h3>
                    {c.issuer && <p className="text-xs text-gray-500">{c.issuer}{c.issue_date && ` · ${c.issue_date}`}</p>}
                  </div>
                  {c.credential_url && <a href={c.credential_url} target="_blank" className="text-xs text-[#1a3c8f] font-semibold hover:underline">View</a>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Awards */}
        {portfolio.awards?.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-yellow-500" />Awards</h2>
            <div className="space-y-3">
              {portfolio.awards.map((a: any) => (
                <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0"><Award className="w-5 h-5 text-yellow-600" /></div>
                  <div><h3 className="font-bold text-gray-800 text-sm">{a.title}</h3>{a.organization && <p className="text-xs text-gray-500">{a.organization}</p>}{a.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{a.description}</p>}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center pt-4 pb-2">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#1a3c8f] transition-colors">
            <img src="/images/logo.jpg" alt="StarzLink" className="w-5 h-5 rounded-md object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            Created with <strong className="text-[#1a3c8f]">StarzLink</strong>
          </Link>
        </div>
      </div>
    </div>
  );
}
