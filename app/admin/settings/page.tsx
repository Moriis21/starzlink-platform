"use client";

import { useState, useEffect } from "react";
import { settingsApi } from "@/lib/api";
import { adminFetch } from "@/lib/adminFetch";
import { Save, Globe, MessageCircle, Link as LinkIcon, CreditCard, CheckCircle2, ShieldAlert } from "lucide-react";
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

  // ── Stripe keys (managed via a dedicated server route — values are never
  //    loaded into the browser; we only learn whether each key is configured) ──
  const [stripe, setStripe] = useState({ secretKey: "", webhookSecret: "" });
  const [stripeStatus, setStripeStatus] = useState({
    hasSecretKey: false, hasWebhookSecret: false, secretFromEnv: false, webhookFromEnv: false,
  });
  const [stripeSaving, setStripeSaving] = useState(false);

  const set = (k: string, v: string) => setSettings(s => ({ ...s, [k]: v }));

  const loadStripeStatus = async () => {
    try {
      const res = await adminFetch("/api/admin/stripe-keys");
      if (res.ok) setStripeStatus(await res.json());
    } catch { /* non-blocking */ }
  };

  useEffect(() => { loadStripeStatus(); }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all(Object.entries(settings).map(([k, v]) => settingsApi.update(k, v)));
      toast.success("Settings saved successfully!");
    } catch { toast.error("Failed to save settings."); }
    setLoading(false);
  };

  const handleSaveStripe = async () => {
    if (!stripe.secretKey.trim() && !stripe.webhookSecret.trim()) {
      toast.error("Enter a key to save.");
      return;
    }
    setStripeSaving(true);
    try {
      const res = await adminFetch("/api/admin/stripe-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stripe),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to save Stripe keys."); return; }
      toast.success("Stripe keys saved.");
      setStripe({ secretKey: "", webhookSecret: "" }); // clear the inputs after saving
      loadStripeStatus();
    } catch {
      toast.error("Could not save Stripe keys.");
    } finally {
      setStripeSaving(false);
    }
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

          {/* Payment Gateway (Stripe) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#635bff]" />
              <h2 className="font-bold text-gray-900">Payment Gateway (Stripe)</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  Secret Key
                  {(stripeStatus.hasSecretKey || stripeStatus.secretFromEnv) && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {stripeStatus.secretFromEnv ? "set via env" : "configured"}
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  autoComplete="off"
                  value={stripe.secretKey}
                  onChange={e => setStripe(s => ({ ...s, secretKey: e.target.value }))}
                  placeholder={stripeStatus.hasSecretKey ? "•••••••• (leave blank to keep)" : "sk_live_… or sk_test_…"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#1a3c8f]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  Webhook Signing Secret
                  {(stripeStatus.hasWebhookSecret || stripeStatus.webhookFromEnv) && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {stripeStatus.webhookFromEnv ? "set via env" : "configured"}
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  autoComplete="off"
                  value={stripe.webhookSecret}
                  onChange={e => setStripe(s => ({ ...s, webhookSecret: e.target.value }))}
                  placeholder={stripeStatus.hasWebhookSecret ? "•••••••• (leave blank to keep)" : "whsec_…"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#1a3c8f]"
                />
              </div>

              <button
                onClick={handleSaveStripe}
                disabled={stripeSaving}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a3c8f] text-white rounded-xl text-sm font-medium hover:bg-blue-900 disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {stripeSaving ? "Saving…" : "Save Stripe Keys"}
              </button>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Keys entered here are stored in the database. For production, prefer setting <code className="font-mono">STRIPE_SECRET_KEY</code> and <code className="font-mono">STRIPE_WEBHOOK_SECRET</code> as environment variables — those take precedence and never touch the database. Webhook endpoint: <code className="font-mono">/api/payments/stripe/webhook</code>.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
