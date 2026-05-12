"use client";

import { useState, useEffect } from "react";
import { settingsApi } from "@/lib/api";
import { Save, Globe, MessageCircle, Mail, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    site_name: "StarzLink",
    site_tagline: "Opportunity • Impact • Inspiration",
    site_email: "support@starzlink.com",
    site_phone: "+231 770 787 020 / 0888 283 007",
    site_address: "Monrovia, Liberia",
    whatsapp_channel: "https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17",
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    youtube_url: "",
    google_analytics_id: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all(Object.entries(settings).map(([k, v]) => settingsApi.update(k, v)));
      toast.success("Settings saved successfully!");
    } catch { toast.error("Failed to save settings."); }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-extrabold text-gray-900">Settings</h1><p className="text-gray-500 text-sm">Configure your StarzLink platform settings.</p></div>
        <button onClick={handleSave} disabled={loading} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a3c8f] text-white rounded-xl text-sm font-medium hover:bg-blue-900 disabled:opacity-60">
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-[#1a3c8f]" />
            <h2 className="font-bold text-gray-900">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Site Name</label><input value={settings.site_name} onChange={e => set("site_name", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Tagline</label><input value={settings.site_tagline} onChange={e => set("site_tagline", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Support Email</label><input type="email" value={settings.site_email} onChange={e => set("site_email", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number</label><input value={settings.site_phone} onChange={e => set("site_phone", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" /></div>
            <div><label className="text-sm font-medium text-gray-700 block mb-1.5">Office Address</label><textarea value={settings.site_address} onChange={e => set("site_address", e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" /></div>
          </div>
        </div>

        {/* Social & WhatsApp */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-gray-900">WhatsApp Channel</h2>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Channel Link</label>
              <input value={settings.whatsapp_channel} onChange={e => set("whatsapp_channel", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
            </div>
            <div className="mt-3 p-3 bg-green-50 rounded-xl text-xs text-green-700 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              This link is displayed across all pages to drive WhatsApp channel growth.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5 text-[#1a3c8f]" />
              <h2 className="font-bold text-gray-900">Social Media Links</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Facebook", key: "facebook_url" },
                { label: "Twitter / X", key: "twitter_url" },
                { label: "Instagram", key: "instagram_url" },
                { label: "LinkedIn", key: "linkedin_url" },
                { label: "YouTube", key: "youtube_url" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                  <input value={(settings as any)[key]} onChange={e => set(key, e.target.value)} placeholder={`https://${label.toLowerCase()}.com/...`} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-[#1a3c8f]" />
              <h2 className="font-bold text-gray-900">Analytics</h2>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Google Analytics ID</label>
              <input value={settings.google_analytics_id} onChange={e => set("google_analytics_id", e.target.value)} placeholder="G-XXXXXXXXXX" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
