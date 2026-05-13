"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eventsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const EVENT_TYPES = ["deadline", "webinar", "career_fair", "campus_event", "workshop", "other"];

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", event_type: "other", event_date: "", start_time: "", end_time: "",
    location: "", is_online: false, meeting_link: "", organizer: "", registration_link: "",
    image_url: "", status: "upcoming",
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: any = { ...form };
    Object.keys(payload).forEach(k => { if (payload[k] === "") delete payload[k]; });
    const { error } = await eventsApi.create(payload);
    if (error) { toast.error("Failed to create event"); setLoading(false); return; }
    toast.success("Event created!");
    router.push("/admin/events");
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/events" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500"><ChevronLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Add New Event</h1>
          <p className="text-gray-500 text-sm">Create a new event or deadline.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Event Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Event Title *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Annual Career Fair 2026" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Event Type *</label>
                <select value={form.event_type} onChange={e => set("event_type", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white">
                  {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Event Date *</label>
                <input type="date" value={form.event_date} onChange={e => set("event_date", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Start Time</label>
                <input type="time" value={form.start_time} onChange={e => set("start_time", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">End Time</label>
                <input type="time" value={form.end_time} onChange={e => set("end_time", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Organizer</label>
                <input value={form.organizer} onChange={e => set("organizer", e.target.value)} placeholder="Organizing body" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Location</label>
                <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Venue or City" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_online" checked={form.is_online} onChange={e => set("is_online", e.target.checked)} className="w-4 h-4 accent-[#1a3c8f]" />
                <label htmlFor="is_online" className="text-sm text-gray-700">Online Event</label>
              </div>
              {form.is_online && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Meeting Link</label>
                  <input type="url" value={form.meeting_link} onChange={e => set("meeting_link", e.target.value)} placeholder="https://zoom.us/..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Registration Link</label>
                <input type="url" value={form.registration_link} onChange={e => set("registration_link", e.target.value)} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Description</h2>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} placeholder="Describe this event..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] resize-none" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Publish Settings</h3>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-white">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="past">Past</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Image URL</label>
              <input value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f]" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-60 mb-2">
              {loading ? "Creating..." : "Create Event"}
            </button>
            <button type="button" onClick={() => router.back()} className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
