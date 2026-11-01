"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  ChevronDown,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  section: string;
  classId: string;
  className: string;
  classSection: string;
  totalLectures: number;
  attendedLectures: number;
  percentage: number;
  isDefaulter: boolean;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
  semester: number;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClassId, setFilterClassId] = useState("");

  // Add student modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRollNo, setFormRollNo] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formParentEmail, setFormParentEmail] = useState("");

  async function loadStudents(classId = filterClassId) {
    setLoading(true);
    try {
      const url = classId
        ? `/api/teacher/students?classId=${classId}`
        : "/api/teacher/students";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
        if (data.classes?.length > 0) {
          setClasses(data.classes);
          if (!formClassId && data.classes[0]) {
            setFormClassId(data.classes[0].id);
            setFormSection(data.classes[0].section);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const handleFilterClass = (cId: string) => {
    setFilterClassId(cId);
    loadStudents(cId);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/teacher/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          rollNo: formRollNo,
          classId: formClassId,
          section: formSection,
          parentEmail: formParentEmail || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ text: data.error || "Failed to enroll student", type: "error" });
      } else {
        setMessage({ text: data.message || "Student enrolled successfully!", type: "success" });
        // Reset form
        setFormName("");
        setFormEmail("");
        setFormRollNo("");
        setFormParentEmail("");
        setModalOpen(false);
        loadStudents();
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Network error", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.rollNo.includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const totalStudents = students.length;
  const defaulters = students.filter((s) => s.isDefaulter).length;
  const avgAttendance =
    students.length > 0
      ? (
          students.reduce((sum, s) => sum + s.percentage, 0) / students.length
        ).toFixed(1)
      : "N/A";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" /> My Students
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Students enrolled in your assigned classes. Add new students or track attendance.
          </p>
        </div>
        <button
          onClick={() => { setModalOpen(true); setMessage(null); }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Enroll Student
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</p>
          <p className="text-2xl font-black text-slate-900">{totalStudents}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg %</p>
          <p className="text-2xl font-black text-emerald-600">{avgAttendance}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Defaulters</p>
          <p className="text-2xl font-black text-rose-600">{defaulters}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, enrollment no, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Class filter */}
        {classes.length > 1 && (
          <div className="relative">
            <select
              value={filterClassId}
              onChange={(e) => handleFilterClass(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} – Sem {c.semester}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Global message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Students Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="text-sm">Loading students...</span>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="font-bold text-slate-800">No classes assigned yet</p>
          <p className="text-xs text-slate-500">
            Admin ko bolein aapko kisi class ke subject assign karein. Tab yahan students dikhenge.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-sm">
          {search ? `"${search}" se koi student nahi mila.` : "Is class mein abhi koi student nahi hai."}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">S.No</th>
                  <th className="p-3.5">Enrollment No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Class</th>
                  <th className="p-3.5 text-center">Attended</th>
                  <th className="p-3.5 text-center">Total</th>
                  <th className="p-3.5 text-center">%</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3.5 font-bold font-mono text-indigo-700">{s.rollNo}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{s.name}</td>
                    <td className="p-3.5 text-slate-500">{s.email}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {s.className}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-emerald-700">{s.attendedLectures}</td>
                    <td className="p-3.5 text-center text-slate-600">{s.totalLectures}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`font-black ${
                          s.percentage >= 75 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {s.percentage}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {s.isDefaulter ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Defaulter
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Safe
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 text-[10px] text-slate-500">
            Showing {filtered.length} of {students.length} students
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Enroll New Student
              </h2>
              <button
                onClick={() => { setModalOpen(false); setMessage(null); }}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar Singh"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Enrollment No */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Enrollment No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="2400100001"
                  maxLength={10}
                  value={formRollNo}
                  onChange={(e) => setFormRollNo(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">10 digits starting with 24. Default password = enrollment no.</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Class *
                </label>
                {classes.length > 0 ? (
                  <select
                    required
                    value={formClassId}
                    onChange={(e) => {
                      setFormClassId(e.target.value);
                      const cls = classes.find((c) => c.id === e.target.value);
                      if (cls) setFormSection(cls.section);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} – Section {c.section} (Sem {c.semester})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    Aapko koi class assign nahi hai. Admin se samprak karein.
                  </div>
                )}
              </div>

              {/* Parent Email (optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Parent Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={formParentEmail}
                  onChange={(e) => setFormParentEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Info box */}
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-800">
                <strong>Note:</strong> Student login = Enrollment No. Default password = Enrollment No (student can change later).
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setMessage(null); }}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || classes.length === 0}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Enrolling...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Enroll Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

