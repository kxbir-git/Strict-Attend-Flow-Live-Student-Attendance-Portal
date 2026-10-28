"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield,
  Briefcase,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Search,
  Phone,
  Mail,
  User,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  RotateCcw,
  Radio,
  Sparkles,
  BarChart3,
  Layers,
} from "lucide-react";

type StaffRole = "TEACHER" | "ADMIN";

const STAFF_PRESETS: Record<StaffRole, { email: string; pass: string; title: string }> = {
  TEACHER: {
    email: "rajesh.sharma@portal.edu",
    pass: "teacherPassword123!",
    title: "Prof. Rajesh Sharma (Faculty)",
  },
  ADMIN: {
    email: "admin@portal.edu",
    pass: "adminPassword123!",
    title: "Dr. Arvind Mehta (Administrator)",
  },
};

const STUDENT_PRESETS = [
  { enrollment: "ENR2024001", roll: "BCA3A-001", name: "Rahul Verma", class: "BCA-3A" },
  { enrollment: "ENR2024002", roll: "BCA3A-002", name: "Priya Sharma", class: "BCA-3A" },
  { enrollment: "ENR2024026", roll: "BCA3B-001", name: "Varun Dhawan", class: "BCA-3B" },
  { enrollment: "ENR2024041", roll: "MCA1A-001", name: "Sameer Kulkarni", class: "MCA-1A" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // If URL has ?staff=true, activate staff mode
  const initialStaffMode = searchParams.get("staff") === "true";
  const [isStaffMode, setIsStaffMode] = useState(initialStaffMode);
  const [staffRole, setStaffRole] = useState<StaffRole>("TEACHER");

  // Student Enrollment Number lookup state
  const [enrollmentNo, setEnrollmentNo] = useState("ENR2024001");
  const [studentResult, setStudentResult] = useState<any | null>(null);

  // Staff credentials state
  const [staffEmail, setStaffEmail] = useState(STAFF_PRESETS.TEACHER.email);
  const [staffPassword, setStaffPassword] = useState(STAFF_PRESETS.TEACHER.pass);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated as staff, redirect appropriately
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "TEACHER") router.push("/teacher/dashboard");
    }
  }, [status, session, router]);

  const toggleStaffMode = (enableStaff: boolean) => {
    setIsStaffMode(enableStaff);
    setError(null);
    setStudentResult(null);
    if (enableStaff) {
      setStaffEmail(STAFF_PRESETS[staffRole].email);
      setStaffPassword(STAFF_PRESETS[staffRole].pass);
    }
  };

  const handleStaffRoleChange = (role: StaffRole) => {
    setStaffRole(role);
    setStaffEmail(STAFF_PRESETS[role].email);
    setStaffPassword(STAFF_PRESETS[role].pass);
  };

  // Student Attendance Lookup & Auto-Session Creation
  const handleStudentLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentNo.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch complete student details & daily/cumulative attendance records
      const res = await fetch("/api/student/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentNo: enrollmentNo.trim() }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Student record not found for this enrollment number.");
        setStudentResult(null);
        setLoading(false);
        return;
      }

      setStudentResult(json.data);

      // 2. Establish authenticated JWT session locked strictly to this student's ID
      await signIn("credentials", {
        enrollmentNo: enrollmentNo.trim(),
        redirect: false,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred while retrieving attendance.");
      setStudentResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Staff Email/Password Submit
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email: staffEmail.trim(),
        password: staffPassword,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid institutional credentials. Please check email and password.");
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const userRole = sessionData?.user?.role;

      if (userRole === "ADMIN") router.push("/admin/dashboard");
      else if (userRole === "TEACHER") router.push("/teacher/dashboard");
      else router.push("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-600 selection:text-white">
      {/* Soft Ambient Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px]" />
      </div>

      <div
        className={`relative z-10 w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-slate-200/60 transition-all ${studentResult ? "max-w-3xl" : "max-w-md"
          }`}
      >
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-lg shadow-orange-500/20 border-2 border-orange-200/90 flex-shrink-0 bg-white">
            <Image
              src="/logo.png"
              alt="Strict Attend Flow"
              width={64}
              height={64}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {isStaffMode ? "Staff & Faculty Access" : "Student Attendance Portal"}
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isStaffMode
              ? "Authorized institutional personnel login for timetable runners and administration."
              : "Apna Enrollment Number daal kar apni us din ki attendance aur cumulative curriculum attendance dekhein."}
          </p>
        </div>

        {/* Staff Role Switcher (ONLY shown when staff mode is activated) */}
        {isStaffMode && (
          <div className="space-y-3 mb-6">
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleStaffRoleChange("TEACHER")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${staffRole === "TEACHER"
                    ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> Faculty
              </button>

              <button
                type="button"
                onClick={() => handleStaffRoleChange("ADMIN")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${staffRole === "ADMIN"
                    ? "bg-white text-purple-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-center font-medium">
              Active Staff Profile: <strong className="text-slate-900">{STAFF_PRESETS[staffRole].title}</strong>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 mb-5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* STUDENT MODE VIEW: Enrollment Number Lookup Form                   */}
        {/* =================================================================== */}
        {!isStaffMode && !studentResult && (
          <div className="space-y-5">
            <form onSubmit={handleStudentLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Enter Student Enrollment Number</span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. ENR2024001 or Roll No</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-mono focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition uppercase tracking-wider"
                    placeholder="ENR2024001 / BCA3A-001"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Har student sirf apni attendance dekh sakta hai. Server perimeter se isolation strictly locked hai.
                </p>
              </div>

              {/* Quick Sample Chips */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Sample Test Enrollments (Click to fill):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {STUDENT_PRESETS.map((p) => (
                    <button
                      key={p.enrollment}
                      type="button"
                      onClick={() => setEnrollmentNo(p.enrollment)}
                      className={`p-2 rounded-xl text-left border text-[11px] transition ${enrollmentNo === p.enrollment
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      <div className="font-mono text-[10px] text-slate-500">{p.enrollment}</div>
                      <div className="truncate font-semibold">{p.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Retrieving Curriculum Attendance...
                  </>
                ) : (
                  <>
                    <span>View Today &amp; Cumulative Attendance</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* =================================================================== */}
        {/* STUDENT RESULT VIEW: Daily & Cumulative Curriculum Attendance       */}
        {/* =================================================================== */}
        {!isStaffMode && studentResult && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Bar with Re-search button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Student Identity Record
              </span>
              <button
                onClick={() => setStudentResult(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 hover:underline transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Check Another Enrollment
              </button>
            </div>

            {/* 1. STUDENT IDENTITY CARD */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                  {studentResult.student.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">
                    {studentResult.student.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Class: <strong className="text-slate-800">{studentResult.student.className} (Sec {studentResult.student.section})</strong> • {studentResult.student.department} • Semester {studentResult.student.semester}
                  </p>
                </div>
              </div>

              {/* 4 Crucial Student Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Enrollment No
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                    {studentResult.student.enrollmentNo}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Roll Number
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                    {studentResult.student.rollNo}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> Mail ID
                  </span>
                  <span className="font-medium text-slate-900 truncate block text-[11px]" title={studentResult.student.email}>
                    {studentResult.student.email}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> Phone Number
                  </span>
                  <span className="font-medium text-slate-900 text-[11px]">
                    {studentResult.student.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. "US DIN KI ATTENDANCE" (DAILY CURRICULUM PERIOD SCHEDULE) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Us Din Ki Attendance (Daily Curriculum View)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {studentResult.todayAttendance.dayName}, {studentResult.todayAttendance.date}
                    </p>
                  </div>
                </div>

                {studentResult.todayAttendance.todayConducted > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 self-start sm:self-auto">
                    Today: {studentResult.todayAttendance.todayPresent} / {studentResult.todayAttendance.todayConducted} Attended ({studentResult.todayAttendance.todayPercentage}%)
                  </span>
                )}
              </div>

              {/* Today's Period Table / Cards */}
              {studentResult.todayAttendance.periods?.length > 0 ? (
                <div className="space-y-2">
                  {studentResult.todayAttendance.periods.map((p: any) => (
                    <div
                      key={p.periodNo}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold font-mono flex items-center justify-center flex-shrink-0">
                          P{p.periodNo}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {p.subjectName}{" "}
                            <span className="font-normal text-slate-500 text-xs font-mono">
                              ({p.subjectCode})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {p.timeSlot} • Faculty: <strong className="text-slate-700">{p.teacherName}</strong> • {p.room}
                          </div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex-shrink-0">
                        {p.status === "PRESENT" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present ✓
                          </span>
                        )}
                        {p.status === "ABSENT" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5" /> Absent ✗
                          </span>
                        )}
                        {p.status === "LIVE_NOW" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white animate-pulse">
                            <Radio className="w-3.5 h-3.5" /> Live Now
                          </span>
                        )}
                        {p.status === "SCHEDULED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : studentResult.todayAttendance.recentDayAttendance ? (
                /* Fallback to most recent lecture day if no slots scheduled today */
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <span>No lectures scheduled today ({studentResult.todayAttendance.dayName}). Showing latest recorded class date:</span>
                    <strong className="font-mono">{studentResult.todayAttendance.recentDayAttendance.date}</strong>
                  </div>

                  <div className="space-y-2">
                    {studentResult.todayAttendance.recentDayAttendance.periods.map((p: any) => (
                      <div
                        key={p.periodNo}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold font-mono flex items-center justify-center">
                            P{p.periodNo}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900">{p.subjectName}</span>
                            <div className="text-[11px] text-slate-500 font-mono">{p.timeSlot}</div>
                          </div>
                        </div>

                        <div>
                          {p.status === "PRESENT" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                              <XCircle className="w-3 h-3" /> Absent
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  No sessions recorded for today.
                </div>
              )}
            </div>

            {/* 3. "COMULATIVE ATTENDANCE" (CURRICULUM MATRIX & TOTAL CUMULATIVE STATS) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Cumulative Academic Attendance (Curriculum Type)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Total semester compliance across all enrolled curriculum subjects.
                    </p>
                  </div>
                </div>

                <div>
                  {studentResult.cumulativeAttendance.isDefaulter ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-rose-50 border border-rose-200 text-rose-700">
                      <AlertTriangle className="w-4 h-4" /> Defaulter (&lt;75%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" /> Eligible (&ge;75%)
                    </span>
                  )}
                </div>
              </div>

              {/* Cumulative Top Stats KPI */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Cumulative %</span>
                  <span className={`text-2xl font-black ${studentResult.cumulativeAttendance.isDefaulter ? "text-rose-600" : "text-emerald-700"}`}>
                    {studentResult.cumulativeAttendance.overallPercentage}%
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Conducted</span>
                  <span className="text-2xl font-black text-slate-900">
                    {studentResult.cumulativeAttendance.totalConducted}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Attended</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {studentResult.cumulativeAttendance.presentCount}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Safe Bunk Buffer</span>
                  <span className="text-sm font-bold text-slate-800 block mt-1">
                    {studentResult.cumulativeAttendance.isDefaulter
                      ? `Need +${studentResult.cumulativeAttendance.classesNeededToRecover} Classes`
                      : `${studentResult.cumulativeAttendance.bufferAbsences} Spare Absences`}
                  </span>
                </div>
              </div>

              {/* Subject-Wise Curriculum Cumulative Table */}
              {studentResult.cumulativeAttendance.curriculumSubjects?.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                    Curriculum Subjects Cumulative Matrix:
                  </span>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="p-3">Subject &amp; Code</th>
                          <th className="p-3 text-center">Conducted / Planned</th>
                          <th className="p-3 text-center">Attended</th>
                          <th className="p-3 text-center">Cumulative %</th>
                          <th className="p-3 text-center">Eligibility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentResult.cumulativeAttendance.curriculumSubjects.map((sub: any) => (
                          <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{sub.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {sub.code} • {sub.teacherName}
                              </div>
                            </td>
                            <td className="p-3 text-center font-mono text-slate-700">
                              {sub.conducted} / {sub.totalPlanned}
                            </td>
                            <td className="p-3 text-center font-bold text-emerald-700">
                              {sub.attended}
                            </td>
                            <td className="p-3 text-center">
                              <div className="font-black text-sm text-slate-900">
                                {sub.cumulativePercentage}%
                              </div>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                                <div
                                  className={`h-full ${sub.cumulativePercentage < 75 ? "bg-rose-500" : "bg-emerald-500"}`}
                                  style={{ width: `${Math.min(100, sub.cumulativePercentage)}%` }}
                                />
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              {sub.isDefaulter ? (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                                  Defaulter
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Eligible
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Action to Enter Full Student Dashboard */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => router.push("/student/dashboard")}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition hover:scale-[1.01]"
              >
                <span>Enter Full Student Portal Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStudentResult(null)}
                className="py-3 px-4 rounded-xl font-bold text-slate-700 text-xs flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Check Another Enrollment
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STAFF MODE VIEW: Institutional Faculty & Admin Credentials          */}
        {/* =================================================================== */}
        {isStaffMode && (
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition"
                placeholder="admin@portal.edu"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 transition"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] disabled:opacity-50 ${staffRole === "ADMIN"
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/30"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  <span>Sign In to {staffRole} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Discreet Staff Mode Toggle Link */}
        <div className="mt-8 pt-5 border-t border-slate-100 text-center">
          {isStaffMode ? (
            <button
              type="button"
              onClick={() => toggleStaffMode(false)}
              className="text-xs text-slate-500 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Student Enrollment Portal
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleStaffMode(true)}
              className="text-[11px] text-slate-400 hover:text-slate-700 font-medium transition"
            >
              Faculty &amp; Staff Administration &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
          Loading portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
