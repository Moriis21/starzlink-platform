"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";
import {
  Building2, Plus, Search, Pencil, Trash2, Globe, MapPin, ExternalLink,
  GraduationCap, Loader2, Save, X, ChevronDown, ChevronRight
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

type PartnerScope = "local" | "international";
type PartnerType = "university" | "organization" | "ngo" | "government" | "corporate";

interface Partner {
  id?: string;
  name: string;
  abbreviation: string;
  type: PartnerType;
  scope: PartnerScope;
  location: string;
  country: string;
  founded: string;
  website: string;
  description: string;
  logo_url: string;
  color: string;
  is_active: boolean;
  created_at?: string;
}

const typeLabels: Record<PartnerType, string> = {
  university: "University / College",
  organization: "Organization",
  ngo: "NGO / Non-Profit",
  government: "Government Body",
  corporate: "Corporate Partner",
};

const typeColors: Record<PartnerType, string> = {
  university: "bg-blue-100 text-blue-700",
  organization: "bg-purple-100 text-purple-700",
  ngo: "bg-green-100 text-green-700",
  government: "bg-orange-100 text-orange-700",
  corporate: "bg-gray-100 text-gray-700",
};

const colorOptions = [
  "#1a3c8f", "#7c3aed", "#059669", "#d97706", "#0891b2",
  "#16a34a", "#dc2626", "#be185d", "#9333ea", "#0369a1",
  "#b45309", "#0f766e",
];

const blankForm = (): Omit<Partner, "id" | "created_at"> => ({
  name: "",
  abbreviation: "",
  type: "university",
  scope: "local",
  location: "",
  country: "Liberia",
  founded: "",
  website: "",
  description: "",
  logo_url: "",
  color: "#1a3c8f",
  is_active: true,
});

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PartnerScope>("local");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setPartners(data ?? []);
    } catch {
      // table might not exist yet — seed defaults
      setPartners([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPartners(); }, []);

  const filtered = partners.filter(p => {
    const matchScope = p.scope === tab;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.abbreviation.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || p.type === typeFilter;
    return matchScope && matchSearch && matchType;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...blankForm(), scope: tab });
    setShowModal(true);
  };

  const openEdit = (p: Partner) => {
    setEditing(p);
    setForm({
      name: p.name,
      abbreviation: p.abbreviation,
      type: p.type,
      scope: p.scope,
      location: p.location,
      country: p.country,
      founded: p.founded,
      website: p.website,
      description: p.description,
      logo_url: p.logo_url,
      color: p.color,
      is_active: p.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing?.id) {
        await insforge.database.from("partners").update(form).eq("id", editing.id);
        toast.success("Partner updated!");
      } else {
        await insforge.database.from("partners").insert(form);
        toast.success("Partner added!");
      }
      setShowModal(false);
      fetchPartners();
    } catch {
      toast.error("Failed to save partner.");
    }
    setSaving(false);
  };

  const handleDelete = async (p: Partner) => {
    if (!p.id) return;
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeleting(p.id);
    try {
      await insforge.database.from("partners").delete().eq("id", p.id);
      toast.success("Deleted.");
      setPartners(prev => prev.filter(x => x.id !== p.id));
    } catch {
      toast.error("Delete failed.");
    }
    setDeleting(null);
  };

  const localCount = partners.filter(p => p.scope === "local").length;
  const intlCount = partners.filter(p => p.scope === "international").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Partners Management</h1>
          <p className="text-gray-500 text-sm">Manage local and international partner institutions</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-900 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Partners", value: partners.length, color: "bg-blue-50 text-blue-700" },
          { label: "Local Partners", value: localCount, color: "bg-green-50 text-green-700" },
          { label: "International", value: intlCount, color: "bg-purple-50 text-purple-700" },
          { label: "Active", value: partners.filter(p => p.is_active).length, color: "bg-orange-50 text-orange-700" },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl p-4 ${stat.color}`}>
            <p className="text-2xl font-extrabold">{stat.value}</p>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {([
            { id: "local", label: "Local Partners", sub: "Universities & Organizations in Liberia", count: localCount },
            { id: "international", label: "International Partners", sub: "Global Universities & Organizations", count: intlCount },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setTypeFilter("all"); setSearch(""); }}
              className={`flex-1 px-6 py-4 text-left transition-colors ${tab === t.id ? "bg-[#1a3c8f]/5 border-b-2 border-[#1a3c8f]" : "hover:bg-gray-50"}`}
            >
              <p className={`font-bold text-sm ${tab === t.id ? "text-[#1a3c8f]" : "text-gray-700"}`}>
                {t.label} <span className="ml-1 text-xs font-normal bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{t.count}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
            </button>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div className="flex items-center gap-3 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search partners…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a3c8f]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none bg-white"
          >
            <option value="all">All Types</option>
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Partners Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-56 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-600 mb-1">No partners found</h3>
          <p className="text-gray-400 text-sm mb-4">
            {search ? "Try a different search term" : `No ${tab} partners yet. Add your first one.`}
          </p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-[#1a3c8f] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-900">
            <Plus className="w-4 h-4" /> Add {tab === "local" ? "Local" : "International"} Partner
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(partner => (
            <div key={partner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              {/* Logo area */}
              <div className="h-24 flex items-center justify-center relative" style={{ backgroundColor: partner.color + "18" }}>
                {partner.logo_url ? (
                  <img src={partner.logo_url} alt={partner.name} className="w-14 h-14 object-contain rounded-xl" />
                ) : (
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-md"
                    style={{ backgroundColor: partner.color }}
                  >
                    {partner.abbreviation.slice(0, 3)}
                  </div>
                )}
                {/* Type badge */}
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[partner.type]}`}>
                  {partner.type === "university" ? "University" : typeLabels[partner.type].split(" ")[0]}
                </span>
                {/* Active indicator */}
                <span className={`absolute top-2 left-2 w-2 h-2 rounded-full ${partner.is_active ? "bg-green-400" : "bg-gray-300"}`} title={partner.is_active ? "Active" : "Inactive"} />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-0.5 line-clamp-2 group-hover:text-[#1a3c8f] transition-colors">{partner.name}</h3>
                <p className="text-xs text-gray-400 mb-1">{partner.abbreviation}{partner.founded ? ` · Est. ${partner.founded}` : ""}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{partner.location || partner.country}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(partner)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(partner)}
                    disabled={deleting === partner.id}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-100 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === partner.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                  {partner.website && partner.website !== "#" && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-400 hover:text-[#1a3c8f] hover:border-[#1a3c8f] transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1a3c8f]/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#1a3c8f]" />
                </div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  {editing ? "Edit Partner" : "Add New Partner"}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Scope tabs */}
              <div className="flex gap-2">
                {(["local", "international"] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("scope", s)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${form.scope === s ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {s === "local" ? "🇱🇷 Local (Liberia)" : "🌍 International"}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Institution / Partner Name <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="e.g. University of Liberia" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Abbreviation / Short Name <span className="text-red-500">*</span></label>
                  <input value={form.abbreviation} onChange={e => set("abbreviation", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="e.g. UL" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Partner Type</label>
                  <select value={form.type} onChange={e => set("type", e.target.value as PartnerType)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">City / Location</label>
                  <input value={form.location} onChange={e => set("location", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="e.g. Monrovia" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Country <span className="text-red-500">*</span></label>
                  <input value={form.country} onChange={e => set("country", e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="e.g. Liberia" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Year Founded</label>
                  <input value={form.founded} onChange={e => set("founded", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="e.g. 1862" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Website URL</label>
                  <input type="url" value={form.website} onChange={e => set("website", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" placeholder="https://..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" placeholder="Brief description of the institution…" />
                </div>
                <div className="sm:col-span-2">
                  <ImageUploader
                    value={form.logo_url}
                    onChange={url => set("logo_url", url)}
                    folder="partners"
                    label="Partner Logo"
                    hint="Upload logo image · PNG, JPG · Max 5 MB · Leave blank to use initials badge"
                    aspectRatio="square"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Or paste a direct URL:{" "}
                    <input
                      value={form.logo_url}
                      onChange={e => set("logo_url", e.target.value)}
                      className="border-b border-dashed border-gray-300 px-1 text-xs focus:outline-none text-gray-600 w-48"
                      placeholder="https://..."
                    />
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Badge Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set("color", c)}
                        className={`w-7 h-7 rounded-lg transition-transform ${form.color === c ? "ring-2 ring-offset-1 ring-gray-900 scale-110" : "hover:scale-105"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="w-4 h-4 accent-[#1a3c8f]" />
                    <span className="text-sm font-semibold text-gray-700">Active (visible on website)</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md flex-shrink-0" style={{ backgroundColor: form.color }}>
                  {form.abbreviation ? form.abbreviation.slice(0, 3) : "??"}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{form.name || "Partner Name"}</p>
                  <p className="text-xs text-gray-400">{form.abbreviation || "ABBR"}{form.founded ? ` · Est. ${form.founded}` : ""}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{form.location || "Location"}{form.country ? `, ${form.country}` : ""}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-[#1a3c8f] text-white font-bold py-2.5 rounded-xl hover:bg-blue-900 disabled:opacity-60">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> {editing ? "Save Changes" : "Add Partner"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
