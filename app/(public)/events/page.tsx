"use client";

import { useState, useEffect } from "react";
import { eventsApi } from "@/lib/api";
import { Calendar, List, ChevronLeft, ChevronRight, MapPin, Clock, ExternalLink, Globe } from "lucide-react";

type ViewMode = "month" | "list";

const EVENT_TYPE_COLORS: Record<string, string> = {
  deadline: "bg-red-500",
  webinar: "bg-blue-500",
  career_fair: "bg-green-500",
  campus_event: "bg-purple-500",
  workshop: "bg-orange-500",
  other: "bg-gray-500",
};

const EVENT_TYPE_BG: Record<string, string> = {
  deadline: "bg-red-50 border-red-200 text-red-800",
  webinar: "bg-blue-50 border-blue-200 text-blue-800",
  career_fair: "bg-green-50 border-green-200 text-green-800",
  campus_event: "bg-purple-50 border-purple-200 text-purple-800",
  workshop: "bg-orange-50 border-orange-200 text-orange-800",
  other: "bg-gray-50 border-gray-200 text-gray-800",
};

export default function EventsCalendarPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    eventsApi.getAll({ limit: 100, status: "upcoming" }).then(res => {
      setEvents(res.data?.data ?? []);
      setLoading(false);
    });
  }, []);

  const filteredEvents = filterType ? events.filter(e => e.event_type === filterType) : events;

  // Calendar grid helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filteredEvents.filter(e => e.event_date?.startsWith(dateStr));
  };

  const selectedDayEvents = selectedDay
    ? filteredEvents.filter(e => e.event_date?.startsWith(selectedDay.toISOString().slice(0, 10)))
    : [];

  const upcomingEvents = filteredEvents.filter(e => new Date(e.event_date) >= new Date()).slice(0, 8);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0d1b4b] to-[#1a3c8f] py-16 px-4 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-2">Events Calendar</h1>
        <p className="text-white/80 text-lg">Stay on top of deadlines, webinars, career fairs and more.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button onClick={() => setView("month")} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === "month" ? "bg-[#1a3c8f] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              <Calendar className="w-4 h-4" /> Month View
            </button>
            <button onClick={() => setView("list")} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === "list" ? "bg-[#1a3c8f] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              <List className="w-4 h-4" /> List View
            </button>
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
            <option value="">All Event Types</option>
            {Object.keys(EVENT_TYPE_COLORS).map(t => <option key={t} value={t} className="capitalize">{t.replace("_", " ")}</option>)}
          </select>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Calendar / List */}
          <div className="lg:col-span-2">
            {view === "month" ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Month nav */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-bold text-gray-900">{monthNames[month]} {year}</h2>
                  <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                {/* Day names */}
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {dayNames.map(d => <div key={d} className="text-center py-2 text-xs font-semibold text-gray-400">{d}</div>)}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} className="h-20 border-b border-r border-gray-50" />)}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const dayEvents = getEventsForDay(day);
                    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                    const isSelected = selectedDay?.getDate() === day && selectedDay?.getMonth() === month;
                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDay(new Date(year, month, day))}
                        className={`h-20 border-b border-r border-gray-50 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                      >
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${isToday ? "bg-[#1a3c8f] text-white" : "text-gray-700"}`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map((ev, idx) => (
                            <div key={idx} className={`w-full h-1.5 rounded-full ${EVENT_TYPE_COLORS[ev.event_type] ?? "bg-gray-400"}`} title={ev.title} />
                          ))}
                          {dayEvents.length > 2 && <p className="text-xs text-gray-400">+{dayEvents.length - 2}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {loading ? Array(5).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse h-24" />
                )) : filteredEvents.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No events found.</div>
                ) : filteredEvents.map(ev => (
                  <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs text-gray-400 uppercase">{new Date(ev.event_date).toLocaleDateString("en-US", { month: "short" })}</p>
                      <p className="text-2xl font-extrabold text-[#1a3c8f]">{new Date(ev.event_date).getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 line-clamp-1">{ev.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 capitalize ${EVENT_TYPE_BG[ev.event_type] ?? ""}`}>{ev.event_type?.replace("_", " ")}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {ev.start_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.start_time}</span>}
                        {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                        {ev.is_online && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />Online</span>}
                      </div>
                      {ev.registration_link && (
                        <a href={ev.registration_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#1a3c8f] font-medium mt-2 hover:underline">
                          Register <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected day panel for month view */}
            {view === "month" && selectedDay && (
              <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3">
                  {selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-gray-400 text-sm">No events on this day.</p>
                ) : selectedDayEvents.map(ev => (
                  <div key={ev.id} className="border border-gray-100 rounded-xl p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${EVENT_TYPE_COLORS[ev.event_type]}`} />
                      <p className="font-semibold text-gray-900">{ev.title}</p>
                    </div>
                    {ev.start_time && <p className="text-xs text-gray-500 ml-4">{ev.start_time}{ev.end_time ? ` - ${ev.end_time}` : ""}</p>}
                    {ev.organizer && <p className="text-xs text-gray-400 ml-4">By {ev.organizer}</p>}
                    {ev.registration_link && (
                      <a href={ev.registration_link} target="_blank" rel="noopener noreferrer" className="ml-4 inline-flex items-center gap-1 text-xs text-[#1a3c8f] font-medium mt-1 hover:underline">
                        Register <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Upcoming Events */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Upcoming Events</h3>
              {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl mb-2 animate-pulse" />) : upcomingEvents.length === 0 ? (
                <p className="text-gray-400 text-sm">No upcoming events.</p>
              ) : upcomingEvents.map(ev => (
                <div key={ev.id} className="flex gap-3 mb-3 pb-3 border-b border-gray-50 last:border-0 last:mb-0 last:pb-0">
                  <div className={`w-2 h-full min-h-[2rem] rounded-full flex-shrink-0 ${EVENT_TYPE_COLORS[ev.event_type] ?? "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{ev.title}</p>
                    <p className="text-xs text-gray-500">{new Date(ev.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-4">
              <h3 className="font-bold text-gray-900 mb-3">Event Types</h3>
              <div className="space-y-2">
                {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="capitalize">{type.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
