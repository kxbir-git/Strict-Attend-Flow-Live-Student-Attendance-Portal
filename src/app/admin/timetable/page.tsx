"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  DoorOpen,
  Plus,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const DAYS = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
];

export default function AdminTimetablePage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [slots, setSlots] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [room, setRoom] = useState<string>("Room 204");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function loadInitial() {
    try {
      const [tRes, pRes, cRes, sRes] = await Promise.all([
        fetch("/api/admin/teachers"),
        fetch("/api/admin/periods"),
        fetch("/api/admin/classes"),
        fetch("/api/admin/subjects"),
      ]);
      const [tData, pData, cData, sData] = await Promise.all([
        tRes.json(),
        pRes.json(),
        cRes.json(),
        sRes.json(),
      ]);

      if (tData.success && tData.data?.length > 0) {
        setTeachers(tData.data);
        setSelectedTeacherId(tData.data[0].id);
      }
      if (pData.success) setPeriods(pData.data || []);
      if (cData.success) setClasses(cData.data || []);
      if (sData.success) setSubjects(sData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadTeacherSlots(tId: string) {
    if (!tId) return;
    try {
      const res = await fetch(`/api/timetable?teacherId=${tId}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (selectedTeacherId) {
      loadTeacherSlots(selectedTeacherId);
    }
  }, [selectedTeacherId]);

  const openSlotModal = (dayOfWeek: number, periodNo: number, existing?: any) => {
    setSelectedDay(dayOfWeek);
    setSelectedPeriod(periodNo);
    if (existing) {
      setSelectedClassId(existing.classId);
      setSelectedSubjectId(existing.subjectId);
      setRoom(existing.room || "Room 204");
    } else {
      if (classes.length > 0) setSelectedClassId(classes[0].id);
      if (subjects.length > 0) setSelectedSubjectId(subjects[0].id);
      setRoom("Room 204");
    }
    setModalOpen(true);
    setMessage(null);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          dayOfWeek: selectedDay,
          periodNo: selectedPeriod,
          room,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ text: data.error || "Failed to save slot", type: "error" });
      } else {
        setMessage({ text: "Slot updated successfully!", type: "success" });
        setModalOpen(false);
        loadTeacherSlots(selectedTeacherId);
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to remove this timetable slot?")) return;

    try {
      const res = await fetch(`/api/timetable?id=${slotId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Slot deleted.", type: "success" });
        loadTeacherSlots(selectedTeacherId);
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        <span>Loading timetable override manager...</span>
      </div>
    );
  }

  const periodList = periods.length > 0 ? periods : Array.from({ length: 8 }, (_, i) => ({ periodNo: i + 1, startTime: `P${i + 1}`, endTime: "" }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-purple-600" /> Admin Timetable Overrides
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Inspect and override any faculty member&apos;s weekly schedule.
          </p>
        </div>

        {/* Teacher Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-600 font-semibold">Select Faculty:</span>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-xs"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.user?.name} ({t.employeeId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${message.type === "success"
            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
            : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="p-3.5 w-28 text-center border-r border-slate-200">Period</th>
              {DAYS.map((d) => (
                <th key={d.id} className="p-3.5 text-center border-r border-slate-200 last:border-r-0">
                  {d.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {periodList.map((p) => (
              <tr key={p.periodNo} className="hover:bg-slate-50/60 transition">
                <td className="p-3 text-center border-r border-slate-200 bg-slate-50/50 font-medium">
                  <span className="font-bold text-slate-900 block">Period {p.periodNo}</span>
                  <span className="text-[10px] text-slate-500 block">{p.startTime} - {p.endTime}</span>
                </td>

                {DAYS.map((d) => {
                  const matchingSlot = slots.find(
                    (s) => s.dayOfWeek === d.id && s.periodNo === p.periodNo
                  );

                  return (
                    <td key={d.id} className="p-2 border-r border-slate-200 last:border-r-0 align-top h-24">
                      {matchingSlot ? (
                        <div className="h-full p-2.5 rounded-xl bg-purple-50/40 border border-purple-200 flex flex-col justify-between group hover:border-purple-400 transition">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-slate-900 text-[11px] truncate">
                                {matchingSlot.class?.name}
                              </span>
                              <button
                                onClick={() => handleDeleteSlot(matchingSlot.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                title="Remove Slot"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[11px] text-purple-700 font-semibold truncate">
                              {matchingSlot.subject?.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {matchingSlot.subject?.code}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-purple-100 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <DoorOpen className="w-3 h-3 text-slate-400" />
                              {matchingSlot.room}
                            </span>
                            <button
                              onClick={() => openSlotModal(d.id, p.periodNo, matchingSlot)}
                              className="text-purple-600 hover:underline font-semibold"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openSlotModal(d.id, p.periodNo)}
                          className="w-full h-full min-h-[5rem] rounded-xl border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 transition"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] mt-0.5">Assign</span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Override Timetable Slot</h3>
                <p className="text-xs text-slate-500">
                  {DAYS.find((d) => d.id === selectedDay)?.name} • Period {selectedPeriod}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                  required
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Room 204 or Lab 1"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
