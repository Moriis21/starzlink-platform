"use client";

import { useState, useEffect } from "react";
import { User, Briefcase, Award, Link2, Eye, Save, Plus, Trash2, Loader2, ExternalLink, CheckCircle, Globe, Code2 } from "lucide-react";
import AIToolNav from "@/components/ui/AIToolNav";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";

type Portfolio = { id?: string; username?: string; headline?: string; bio?: string; website?: string; linkedin?: string; github?: string; twitter?: string; is_public?: boolean; template?: string };
type Project = { id?: string; title: string; description?: string; link_url?: string; tags?: string[]; is_current?: boolean };
type Certification = { id?: string; title: string; issuer?: string; issue_date?: string; credential_url?: string };
type Award = { id?: string; title: string; organization?: string; date?: string; description?: string };

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "certs", label: "Certifications", icon: CheckCircle },
  { id: "awards", label: "Awards", icon: Award },
];

export default function PortfolioBuilderPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Portfolio>({ is_public: true, template: "default" });
  const [projects, setProjects] = useState<Project[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [newProject, setNewProject] = useState<Project>({ title: "" });
  const [newCert, setNewCert] = useState<Certification>({ title: "" });
  const [newAward, setNewAward] = useState<Award>({ title: "" });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      const res = await fetch(`/api/portfolio?userId=${user.id}`);
      const data = await res.json();
      if (data.portfolio) {
        setPortfolioId(data.portfolio.id);
        setProfile({ username: data.portfolio.username, headline: data.portfolio.headline, bio: data.portfolio.bio, website: data.portfolio.website, linkedin: data.portfolio.linkedin, github: data.portfolio.github, twitter: data.portfolio.twitter, is_public: data.portfolio.is_public, template: data.portfolio.template });
        setProjects(data.portfolio.projects || []);
        setCerts(data.portfolio.certifications || []);
        setAwards(data.portfolio.awards || []);
      } else {
        setProfile(p => ({ ...p, username: user.full_name?.toLowerCase().replace(/\s+/g, ".") || "" }));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, ...profile }),
    });
    const data = await res.json();
    if (data.success) { setPortfolioId(data.portfolio?.id); toast.success("Portfolio saved!"); }
    else toast.error(data.error || "Save failed");
    setSaving(false);
  };

  const addItem = async (type: "project" | "certification" | "award") => {
    if (!portfolioId) { toast.error("Save your profile first."); return; }
    const item = type === "project" ? newProject : type === "certification" ? newCert : newAward;
    if (!item.title.trim()) { toast.error("Title is required."); return; }
    const res = await fetch("/api/portfolio/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioId, itemType: type, ...item }),
    });
    const data = await res.json();
    if (data.success) {
      if (type === "project") { setProjects(p => [...p, data.item]); setNewProject({ title: "" }); }
      else if (type === "certification") { setCerts(c => [...c, data.item]); setNewCert({ title: "" }); }
      else { setAwards(a => [...a, data.item]); setNewAward({ title: "" }); }
      toast.success("Added!");
    }
  };

  const removeItem = async (type: string, id: string) => {
    await fetch("/api/portfolio/items", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: id, itemType: type }) });
    if (type === "project") setProjects(p => p.filter(x => x.id !== id));
    else if (type === "certification") setCerts(c => c.filter(x => x.id !== id));
    else setAwards(a => a.filter(x => x.id !== id));
    toast.success("Removed");
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><User className="w-8 h-8 text-[#1a3c8f]" /></div>
        <h2 className="text-2xl font-bold mb-2">Portfolio Builder</h2>
        <p className="text-gray-500 mb-6">Sign in to build your professional portfolio.</p>
        <a href="/login" className="bg-[#1a3c8f] text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-900">Sign In</a>
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[#1a3c8f]" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <AIToolNav currentLabel="Portfolio Builder" />
      </div>
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-10 px-4 text-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Portfolio Builder</h1>
            <p className="text-blue-200 text-sm mt-1">Build your professional online portfolio</p>
          </div>
          <div className="flex gap-2">
            {profile.username && (
              <Link href={`/portfolio/${profile.username}`} target="_blank"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                <Eye className="w-4 h-4" /> Preview
              </Link>
            )}
            <button onClick={saveProfile} disabled={saving}
              className="flex items-center gap-2 bg-white text-[#1a3c8f] font-bold px-4 py-2 rounded-xl hover:bg-blue-50 text-sm disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t.id ? "bg-[#1a3c8f] text-white shadow" : "text-gray-500 hover:text-gray-800"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">Portfolio Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Username <span className="text-gray-400">(your public URL)</span></label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <span className="px-3 text-gray-400 text-sm bg-gray-50 border-r border-gray-200 py-2.5">/portfolio/</span>
                  <input value={profile.username || ""} onChange={e => setProfile(p => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "") }))}
                    placeholder="your.name" className="flex-1 px-3 py-2.5 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Headline</label>
                <input value={profile.headline || ""} onChange={e => setProfile(p => ({ ...p, headline: e.target.value }))} placeholder="e.g. Software Engineer | UL Graduate"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Bio</label>
              <textarea value={profile.bio || ""} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={4}
                placeholder="A short introduction about yourself..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30 resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ key: "website", label: "Website", placeholder: "https://yoursite.com" }, { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/yourname" }, { key: "github", label: "GitHub", placeholder: "github.com/username" }, { key: "twitter", label: "Twitter / X", placeholder: "twitter.com/username" }].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">{f.label}</label>
                  <input value={(profile as any)[f.key] || ""} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
                </div>
              ))}
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={profile.is_public ?? true} onChange={e => setProfile(p => ({ ...p, is_public: e.target.checked }))} className="w-4 h-4 accent-[#1a3c8f]" />
              <span className="text-sm text-gray-700 flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" /> Make portfolio public (viewable by anyone with the link)</span>
            </label>
            {profile.username && <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-sm text-[#1a3c8f]">
              <ExternalLink className="w-4 h-4" /> Your portfolio: <strong>/portfolio/{profile.username}</strong>
            </div>}
          </div>
        )}

        {tab === "projects" && (
          <div className="space-y-4">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start justify-between gap-4">
                <div><h3 className="font-bold text-gray-800">{p.title}</h3>{p.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>}{p.link_url && <a href={p.link_url} target="_blank" className="text-xs text-[#1a3c8f] mt-1 flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" />{p.link_url}</a>}</div>
                <button onClick={() => removeItem("project", p.id!)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Add Project</h3>
              <input value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} placeholder="Project title *"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
              <textarea value={newProject.description || ""} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Description"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30 resize-none" />
              <input value={newProject.link_url || ""} onChange={e => setNewProject(p => ({ ...p, link_url: e.target.value }))} placeholder="Project link (optional)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
              <button onClick={() => addItem("project")} className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-900 text-sm"><Plus className="w-4 h-4" /> Add Project</button>
            </div>
          </div>
        )}

        {tab === "certs" && (
          <div className="space-y-4">
            {certs.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start justify-between gap-4">
                <div><h3 className="font-bold text-gray-800">{c.title}</h3>{c.issuer && <p className="text-sm text-gray-500">{c.issuer}</p>}{c.issue_date && <p className="text-xs text-gray-400 mt-0.5">{c.issue_date}</p>}</div>
                <button onClick={() => removeItem("certification", c.id!)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Add Certification</h3>
              <input value={newCert.title} onChange={e => setNewCert(c => ({ ...c, title: e.target.value }))} placeholder="Certification name *"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
              <input value={newCert.issuer || ""} onChange={e => setNewCert(c => ({ ...c, issuer: e.target.value }))} placeholder="Issuing organization"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
              <input type="date" value={newCert.issue_date || ""} onChange={e => setNewCert(c => ({ ...c, issue_date: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
              <button onClick={() => addItem("certification")} className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-900 text-sm"><Plus className="w-4 h-4" /> Add Certification</button>
            </div>
          </div>
        )}

        {tab === "awards" && (
          <div className="space-y-4">
            {awards.map(a => (
              <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start justify-between gap-4">
                <div><h3 className="font-bold text-gray-800">{a.title}</h3>{a.organization && <p className="text-sm text-gray-500">{a.organization}</p>}{a.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{a.description}</p>}</div>
                <button onClick={() => removeItem("award", a.id!)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Add Award</h3>
              <input value={newAward.title} onChange={e => setNewAward(a => ({ ...a, title: e.target.value }))} placeholder="Award name *"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
              <input value={newAward.organization || ""} onChange={e => setNewAward(a => ({ ...a, organization: e.target.value }))} placeholder="Awarding organization"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30" />
              <textarea value={newAward.description || ""} onChange={e => setNewAward(a => ({ ...a, description: e.target.value }))} rows={2} placeholder="Description"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c8f]/30 resize-none" />
              <button onClick={() => addItem("award")} className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-900 text-sm"><Plus className="w-4 h-4" /> Add Award</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
