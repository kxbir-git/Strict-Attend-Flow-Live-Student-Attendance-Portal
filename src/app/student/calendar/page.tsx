"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Download, ExternalLink, MapPin, User } from "lucide-react";

export default function StudentCalendarPage() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 1); // 1=Mon

  const DAYS = [
    { num: 1, name: "Monday" },
    { num: 2, name: "Tuesday" },
    { num: 3, name: "Wednesday" },
    { num: 4, name: "Thursday" },
    { num: 5, name: "Friday" },
    { num: 6, name: "Saturday" },
  ];

  useEffect(() => {
    fetch("/api/timetable")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setTimetable(res.data.slots || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadIcs = () => {
    window.location.href = "/api/student/calendar.ics";
  };

  const getGoogleCalendarUrl = (slot: any) => {
    const title = encodeURIComponent(`${slot.subject?.name || "Lecture"} (${slot.subject?.code || ""})`);
    const details = encodeURIComponent(
      `Period ${slot.periodNo} | Room: ${slot.room} | Faculty: ${slot.teacher?.user?.name || "Faculty"}`
    );
    const location = encodeURIComponent(slot.room);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const filteredSlots = timetable.filter((s) => s.dayOfWeek === selectedDay);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-emerald-600" />
            Class Schedule &amp; Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Weekly class schedule, instant Google Calendar sync, and offline ICS calendar export.
          </p>
        </div>

        <button
          onClick={handleDownloadIcs}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          Export ICS (Apple / Outlook)
        </button>
      </div>

      {/* Weekday Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DAYS.map((d) => (
          <button
            key={d.num}
            onClick={() => setSelectedDay(d.num)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${selectedDay === d.num
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Slots for the selected day */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading schedule...</div>
        ) : filteredSlots.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-500 shadow-sm">
            No scheduled lectures on {DAYS.find((d) => d.num === selectedDay)?.name}.
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-emerald-700 flex-shrink-0">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">P</span>
                  <span className="text-base font-black">{slot.periodNo}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{slot.subject?.name}</h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {slot.subject?.code}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {slot.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {slot.teacher?.user?.name || "Faculty"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={getGoogleCalendarUrl(slot)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Add to Google Calendar
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
