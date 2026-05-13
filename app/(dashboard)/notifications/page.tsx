"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { insforge } from "@/lib/insforge";
import toast from "react-hot-toast";
import { Bell, Briefcase, GraduationCap, BookOpen, Globe, Megaphone, Calendar, Mail, Save } from "lucide-react";

interface NotifPrefs {
  new_jobs: boolean;
  new_scholarships: boolean;
  new_trainings: boolean;
  new_opportunities: boolean;
  campus_updates: boolean;
  events: boolean;
  newsletter: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  new_jobs: true, new_scholarships: true, new_trainings: true,
  new_opportunities: true, campus_updates: true, events: true, newsletter: true,
};

const NOTIF_ITEMS = [
  { key: "new_jobs", label: "New Jobs Posted", desc: "Get notified when new job opportunities are added.", icon: Briefcase },
  { key: "new_scholarships", label: "New Scholarships", desc: "Be the first to know about new scholarship opportunities.", icon: GraduationCap },
  { key: "new_trainings", label: "New Training Programs", desc: "Discover new courses and training programs.", icon: BookOpen },
  { key: "new_opportunities", label: "New Opportunities", desc: "Internships, grants, competitions, volunteer, study abroad.", icon: Globe },
  { key: "campus_updates", label: "Campus Updates", desc: "News and updates from Liberian universities.", icon: Megaphone },
  { key: "events", label: "Events & Deadlines", desc: "Reminders for upcoming events and application deadlines.", icon: Calendar },
  { key: "newsletter", label: "Newsletter", desc: "Weekly digest of the best opportunities curated for you.", icon: Mail },
];

const FREQUENCIES = [
  { value: "immediately", label: "Immediately", desc: "Get notified as soon as something new is posted" },
  { value: "daily", label: "Daily Digest", desc: "One email per day with all updates" },
  { value: "weekly", label: "Weekly Digest", desc: "A single weekly roundup every Monday" },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [frequency, setFrequency] = useState("immediately");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    insforge.database.from("profiles").select("notification_preferences").eq("id", user.id).single().then(({ data }) => {
      if (data?.notification_preferences) {
        setPrefs({ ...DEFAULT_PREFS, ...data.notification_preferences });
        if (data.notification_preferences.frequency) setFrequency(data.notification_preferences.frequency);
      }
      setLoading(false);
    });
  }, [user?.id]);

  const toggle = (key: keyof NotifPrefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    await insforge.database.from("profiles").update({ notification_preferences: { ...prefs, frequency } }).eq("id", user.id);
    toast.success("Notification preferences saved!");
    setSaving(false);
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
      {Array(7).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl" />)}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Notification Preferences</h1>
        <p className="text-gray-500 text-sm">Choose what you want to be notified about.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {NOTIF_ITEMS.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#1a3c8f]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={() => toggle(key as keyof NotifPrefs)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${prefs[key as keyof NotifPrefs] ? "bg-[#1a3c8f]" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${prefs[key as keyof NotifPrefs] ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-[#1a3c8f]" />
              <h3 className="font-bold text-gray-900">Email Frequency</h3>
            </div>
            <div className="space-y-2">
              {FREQUENCIES.map(f => (
                <label key={f.value} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${frequency === f.value ? "bg-blue-50 border border-[#1a3c8f]/20" : "hover:bg-gray-50"}`}>
                  <input type="radio" name="frequency" value={f.value} checked={frequency === f.value} onChange={() => setFrequency(f.value)} className="mt-0.5 accent-[#1a3c8f]" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{f.label}</p>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full bg-[#1a3c8f] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
