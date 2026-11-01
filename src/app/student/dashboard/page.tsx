"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  BookOpen,
  Sparkles,
  Shield,
  Bot,
  FileText,
  ShieldCheck,
  Flame,
  Award,
  Calculator,
  Compass,
  FileSpreadsheet,
  Check,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  Percent,
} from "lucide-react";

export default function StudentDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [insightsData, setInsightsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Academic Planner States
  const [plannedBunks, setPlannedBunks] = useState(0);
  const [plannedAttends, setPlannedAttends] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string>("MON");

  useEffect(() => {
    async function fetchData() {
      try {
        const [attRes, insRes] = await Promise.all([
          fetch("/api/student/attendance"),
          fetch("/api/student/insights"),
        ]);
        const attJson = await attRes.json();
        const insJson = await insRes.json();

        if (attJson.success) setData(attJson.data);
        if (insJson.success) setInsightsData(insJson.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        <span className="text-xs font-medium">Loading personal academic attendance data...</span>
      </div>
    );
  }

  const summary = data?.summary || {
    totalConducted: 0,
    presentCount: 0,
    absentCount: 0,
    overallPercentage: 100,
    isOverallDefaulter: false,
  };

  const student = data?.student || {
    name: "Student",
    rollNo: "BCA3A-001",
    enrollmentNo: "ENR2024001",
    email: "student.rahul@portal.edu",
    phone: "+91 98765 00101",
    className: "BCA-3A",
    section: "A",
    department: "Computer Applications",
    semester: 3,
  };

  // Static Weekly Timetable for B.Tech CSE (ILIZone / University Standard)
  const WEEKLY_TIMETABLE: Record<string, Array<{ period: number; time: string; code: string; name: string; faculty: string; room: string }>> = {
    MON: [
      { period: 1, time: "09:00 - 09:50", code: "CSE-201", name: "Data Structures & Algorithms", faculty: "Prof. Rajesh Sharma", room: "Lab 102" },
      { period: 2, time: "09:50 - 10:40", code: "CSE-202", name: "Object Oriented Programming", faculty: "Dr. Ananya Roy", room: "Room 301" },
      { period: 3, time: "10:50 - 11:40", code: "CSE-203", name: "Computer Networks", faculty: "Prof. Vikram Malhotra", room: "Room 204" },
      { period: 4, time: "11:40 - 12:30", code: "CSE-204", name: "Database Management Systems", faculty: "Prof. Amit Verma", room: "Lab 101" },
      { period: 5, time: "01:30 - 02:20", code: "CSE-205", name: "Operating Systems", faculty: "Dr. Meera Patel", room: "Room 302" },
    ],
    TUE: [
      { period: 1, time: "09:00 - 09:50", code: "CSE-204", name: "Database Management Systems", faculty: "Prof. Amit Verma", room: "Lab 101" },
      { period: 2, time: "09:50 - 10:40", code: "CSE-205", name: "Operating Systems", faculty: "Dr. Meera Patel", room: "Room 302" },
      { period: 3, time: "10:50 - 11:40", code: "CSE-201", name: "Data Structures & Algorithms", faculty: "Prof. Rajesh Sharma", room: "Lab 102" },
      { period: 4, time: "11:40 - 12:30", code: "CSE-202", name: "Object Oriented Programming", faculty: "Dr. Ananya Roy", room: "Room 301" },
    ],
    WED: [
      { period: 1, time: "09:00 - 09:50", code: "CSE-203", name: "Computer Networks", faculty: "Prof. Vikram Malhotra", room: "Room 204" },
      { period: 2, time: "09:50 - 10:40", code: "CSE-201", name: "Data Structures & Algorithms", faculty: "Prof. Rajesh Sharma", room: "Lab 102" },
      { period: 3, time: "10:50 - 11:40", code: "CSE-204", name: "Database Management Systems", faculty: "Prof. Amit Verma", room: "Lab 101" },
      { period: 4, time: "11:40 - 12:30", code: "CSE-205", name: "Operating Systems", faculty: "Dr. Meera Patel", room: "Room 302" },
    ],
    THU: [
      { period: 1, time: "09:00 - 09:50", code: "CSE-202", name: "Object Oriented Programming", faculty: "Dr. Ananya Roy", room: "Room 301" },
      { period: 2, time: "09:50 - 10:40", code: "CSE-203", name: "Computer Networks", faculty: "Prof. Vikram Malhotra", room: "Room 204" },
      { period: 3, time: "10:50 - 11:40", code: "CSE-205", name: "Operating Systems", faculty: "Dr. Meera Patel", room: "Room 302" },
      { period: 4, time: "11:40 - 12:30", code: "CSE-201", name: "Data Structures & Algorithms", faculty: "Prof. Rajesh Sharma", room: "Lab 102" },
    ],
    FRI: [
      { period: 1, time: "09:00 - 09:50", code: "CSE-201", name: "Data Structures & Algorithms Lab", faculty: "Prof. Rajesh Sharma", room: "Lab 102" },
      { period: 2, time: "09:50 - 10:40", code: "CSE-204", name: "DBMS Project Lab", faculty: "Prof. Amit Verma", room: "Lab 101" },
      { period: 3, time: "10:50 - 11:40", code: "CSE-203", name: "Computer Networks Lab", faculty: "Prof. Vikram Malhotra", room: "Lab 103" },
      { period: 4, time: "11:40 - 12:30", code: "CSE-202", name: "OOP Java Lab", faculty: "Dr. Ananya Roy", room: "Lab 104" },
    ],
    SAT: [
      { period: 1, time: "09:30 - 11:00", code: "CSE-SEM", name: "Technical Seminar & Industrial Guidance", faculty: "Faculty Coordinator", room: "Seminar Hall" },
      { period: 2, time: "11:15 - 12:45", code: "CSE-REM", name: "Remedial & Doubts Clearance Session", faculty: "Department Faculty", room: "Room 204" },
    ],
  };

  // Academic Course Syllabus & Modules
  const ACADEMIC_SYLLABUS = [
    {
      code: "CSE-201",
      name: "Data Structures & Algorithms",
      credits: 4,
      faculty: "Prof. Rajesh Sharma",
      units: [
        { unit: "Unit 1", topic: "Asymptotic Notations & Arrays/Linked Lists", status: "Completed" },
        { unit: "Unit 2", topic: "Stacks, Queues & Recursion Analysis", status: "Completed" },
        { unit: "Unit 3", topic: "Trees, Binary Search Trees & AVL Trees", status: "In Progress" },
        { unit: "Unit 4", topic: "Graph Algorithms (BFS/DFS, Dijkstra)", status: "Upcoming" },
        { unit: "Unit 5", topic: "Hashing & Dynamic Programming", status: "Upcoming" },
      ],
    },
    {
      code: "CSE-202",
      name: "Object Oriented Programming",
      credits: 4,
      faculty: "Dr. Ananya Roy",
      units: [
        { unit: "Unit 1", topic: "OOP Concepts, Classes & Constructors", status: "Completed" },
        { unit: "Unit 2", topic: "Inheritance, Polymorphism & Interfaces", status: "Completed" },
        { unit: "Unit 3", topic: "Exception Handling & Collections Framework", status: "In Progress" },
        { unit: "Unit 4", topic: "Multithreading & File I/O in Java", status: "Upcoming" },
        { unit: "Unit 5", topic: "GUI Basics & Event Handling", status: "Upcoming" },
      ],
    },
    {
      code: "CSE-203",
      name: "Computer Networks",
      credits: 3,
      faculty: "Prof. Vikram Malhotra",
      units: [
        { unit: "Unit 1", topic: "OSI & TCP/IP Reference Models", status: "Completed" },
        { unit: "Unit 2", topic: "Data Link Layer & Error Control", status: "Completed" },
        { unit: "Unit 3", topic: "Network Layer Routing (OSPF, BGP)", status: "In Progress" },
        { unit: "Unit 4", topic: "Transport Layer Protocols (TCP/UDP)", status: "Upcoming" },
        { unit: "Unit 5", topic: "Application Layer (DNS, HTTP, SMTP)", status: "Upcoming" },
      ],
    },
    {
      code: "CSE-204",
      name: "Database Management Systems",
      credits: 4,
      faculty: "Prof. Amit Verma",
      units: [
        { unit: "Unit 1", topic: "ER Modeling & Relational Schema", status: "Completed" },
        { unit: "Unit 2", topic: "SQL Queries, Joins & Subqueries", status: "Completed" },
        { unit: "Unit 3", topic: "Normalization (1NF, 2NF, 3NF, BCNF)", status: "In Progress" },
        { unit: "Unit 4", topic: "Transaction Processing & ACID Properties", status: "Upcoming" },
        { unit: "Unit 5", topic: "Indexing, B+ Trees & Concurrency Control", status: "Upcoming" },
      ],
    },
  ];

  // Dynamic Attendance Planner Simulation
  const simulatedTotal = summary.totalConducted + plannedBunks + plannedAttends;
  const simulatedPresent = summary.presentCount + plannedAttends;
  const simulatedPercentage = simulatedTotal > 0 ? Number(((simulatedPresent / simulatedTotal) * 100).toFixed(1)) : 100;
  const isSimulatedDefaulter = simulatedPercentage < 75;

  const subjectStats = data?.subjectStats || [];
  const liveSession = data?.liveSession || null;
  const heatmap = data?.heatmap || {};
  const nextClass = insightsData?.nextClass;
  const streak = insightsData?.streak || { currentStreak: 0 };
  const overallInsights = insightsData?.overall || {};

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Student Institutional Identity & Credentials Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-2xl shadow-xs">
                {student.name ? student.name[0] : "S"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg overflow-hidden border border-orange-200 bg-white shadow-xs">
                <Image src="/logo.png" alt="Strict Attend Flow" width={24} height={24} className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {student.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Class: <strong className="text-slate-800">{student.className} (Sec {student.section})</strong> • {student.department} • Semester {student.semester}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs self-start sm:self-auto font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Private Enrolled Session (Own Data Only)
          </div>
        </div>

        {/* 4 Crucial Student Credentials Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Enrollment No
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
              {student.enrollmentNo}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Roll Number
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm sm:text-base">
              {student.rollNo}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Mail ID
            </span>
            <span className="font-medium text-slate-900 text-xs sm:text-sm truncate block" title={student.email}>
              {student.email}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Phone Number
            </span>
            <span className="font-medium text-slate-900 text-xs sm:text-sm">
              {student.phone}
            </span>
          </div>
        </div>
      </div>
      {/* Live Now Alert Banner (IF a session for their class is OPEN) */}
      {liveSession && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-indigo-50 border-2 border-emerald-500/50 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 animate-pulse flex-shrink-0">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                  LIVE LECTURE IN PROGRESS
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Period {liveSession.periodNo} ({liveSession.startTime} - {liveSession.endTime})
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {liveSession.subjectName} ({liveSession.subjectCode})
              </h2>
              <p className="text-xs text-slate-600">
                Faculty: <strong className="text-slate-900">{liveSession.teacherName}</strong> • {liveSession.isMarkedPresent ? "You are recorded as PRESENT ✓" : "Mark yourself present now with in-class passcode"}
              </p>
            </div>
          </div>

          <Link
            href="/student/live"
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition hover:scale-[1.02]"
          >
            {liveSession.isMarkedPresent ? "View Session Status" : "Mark Attendance Now"} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Next Class Today Alert (if any) */}
      {nextClass && !liveSession && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Next Lecture Scheduled Today</span>
              <p className="text-slate-900 font-bold">
                {nextClass.subjectName} ({nextClass.subjectCode}) • Period {nextClass.periodNo} at {nextClass.startTime} ({nextClass.room})
              </p>
            </div>
          </div>
          <Link
            href="/student/calendar"
            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
          >
            Schedule <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main KPI Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Percentage Card */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 flex flex-col justify-between space-y-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Overall Academic Attendance
            </span>
            <div className="flex items-baseline gap-4 mt-2">
              <span
                className={`text-5xl lg:text-6xl font-black tracking-tight ${summary.isOverallDefaulter ? "text-rose-600" : "text-emerald-700"
                  }`}
              >
                {summary.overallPercentage}%
              </span>

              {summary.isOverallDefaulter ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-50 border border-rose-200 text-rose-700">
                  <AlertTriangle className="w-4 h-4" /> Defaulter Alert (&lt;75%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" /> Exam Eligible (&ge;75%)
                </span>
              )}
            </div>

            {/* Buffer Info Badge */}
            <div className="mt-3">
              {overallInsights.isDefaulter ? (
                <p className="text-xs text-rose-700 font-semibold">
                  ⚠️ You must attend the next <strong>{overallInsights.classesNeededToRecover} consecutive classes</strong> to restore 75% eligibility.
                </p>
              ) : (
                <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Safe Buffer: <strong>{overallInsights.bufferAbsences} spare absences</strong> remaining before dipping below 75%.
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Conducted</span>
              <span className="text-lg font-bold text-slate-900">{summary.totalConducted}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Attended</span>
              <span className="text-lg font-bold text-emerald-700">{summary.presentCount}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Absences</span>
              <span className="text-lg font-bold text-rose-600">{summary.absentCount}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <span className="text-slate-500 text-[10px] uppercase font-bold block flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" /> Streak
              </span>
              <span className="text-lg font-bold text-orange-600">{streak.currentStreak}d</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Smart Student Features</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Instant AI assistance, absence leave requests, and verified certificates.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/student/assistant"
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-2 transition"
            >
              <Bot className="w-4 h-4 text-indigo-600" /> AI Attendance Assistant
            </Link>

            <Link
              href="/student/leave"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4 text-emerald-600" /> Apply for Leave
            </Link>

            <Link
              href="/student/certificate"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-2 transition"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Official PDF Certificate
            </Link>

            <a
              href="/api/student/attendance.csv"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-slate-500" /> Export Personal CSV
            </a>
          </div>
        </div>
      </div>

      {/* Per-Subject Attendance Breakdown with <75% Red Warning */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Per-Subject Attendance &amp; Buffer
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {subjectStats.length} Enrolled Subjects
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStats.map((sub: any) => {
            const isRed = sub.isDefaulter;

            return (
              <div
                key={sub.subjectId}
                className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${isRed
                  ? "bg-rose-50/50 border-rose-200 shadow-xs"
                  : "bg-white border-slate-200 shadow-xs hover:shadow-md"
                  }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {sub.subjectCode}
                    </span>
                    {isRed ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> &lt;75% Defaulter
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Safe
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                    {sub.subjectName}
                  </h3>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Attendance</span>
                    <span
                      className={`text-xl font-black ${isRed ? "text-rose-600" : "text-emerald-700"
                        }`}
                    >
                      {sub.percentage}%
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isRed ? "bg-rose-500" : "bg-emerald-600"
                        }`}
                      style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-mono">
                    <span>Attended: {sub.attended}/{sub.totalLectures}</span>
                    <span>Absent: {sub.absent}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Heatmap Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" /> Attendance Calendar Heatmap
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Regularity breakdown over the past 30 lecture days.
          </p>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
          {Object.entries(heatmap).map(([dateStr, counts]: any) => {
            const hasAbsence = counts.absent > 0;
            const allPresent = counts.present > 0 && counts.absent === 0;

            return (
              <div
                key={dateStr}
                className={`p-2.5 rounded-xl border text-center transition ${allPresent
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : hasAbsence
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
              >
                <div className="text-[10px] font-mono font-bold">
                  {new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
                <div className="text-xs font-black mt-1">
                  {counts.present}/{counts.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. WEEKLY ACADEMIC CLASS TIMETABLE GRID (ILIZONE STANDARD)            */}
      {/* ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Weekly Academic Class Timetable
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official B.Tech CSE semester schedule with period timings and classroom locations.
            </p>
          </div>

          {/* Day Selector Pills */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${selectedDay === day
                  ? "bg-white text-orange-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Period Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {WEEKLY_TIMETABLE[selectedDay]?.map((slot) => (
            <div
              key={slot.period}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-800 font-mono font-bold text-xs flex items-center justify-center">
                  P{slot.period}
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  {slot.time}
                </span>
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 block mb-0.5">
                  {slot.code}
                </span>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{slot.name}</h4>
                <p className="text-[11px] text-slate-600 mt-1">Faculty: {slot.faculty}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                <span>Location:</span>
                <strong className="text-slate-800">{slot.room}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. INTERACTIVE ATTENDANCE & BUNK PLANNER CALCULATOR                    */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block mb-1">
              Smart Simulation Tool
            </span>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-400" /> Academic Attendance &amp; Bunk Recovery Planner
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Check live impact on your 75% threshold before taking leaves or plan classes needed to recover.
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-xs text-slate-300 block">Simulated Forecast</span>
            <span className={`text-3xl font-black ${isSimulatedDefaulter ? "text-rose-400" : "text-emerald-400"}`}>
              {simulatedPercentage}%
            </span>
          </div>
        </div>

        {/* Interactive Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Plan Extra Bunk / Absences:</span>
              <span className="font-mono text-orange-300 font-black text-sm">+{plannedBunks} Lectures</span>
            </label>
            <input
              type="range"
              min={0}
              max={25}
              value={plannedBunks}
              onChange={(e) => setPlannedBunks(parseInt(e.target.value) || 0)}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Increase to test how many upcoming classes you can afford to skip without dropping below 75%.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Plan Extra Consecutive Attendances:</span>
              <span className="font-mono text-emerald-300 font-black text-sm">+{plannedAttends} Lectures</span>
            </label>
            <input
              type="range"
              min={0}
              max={30}
              value={plannedAttends}
              onChange={(e) => setPlannedAttends(parseInt(e.target.value) || 0)}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Calculate recovery path: see how fast attending upcoming lectures raises your percentage.
            </p>
          </div>
        </div>

        {/* Prediction Summary Bar */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {isSimulatedDefaulter ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            )}
            <div>
              <div className="font-bold">
                {isSimulatedDefaulter
                  ? "Defaulter Warning: This plan drops your compliance below the mandatory 75% limit!"
                  : "Safe Academic Eligibility: This plan keeps you safely eligible for end-semester exams."}
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                Simulated Attendance: {simulatedPresent} Present / {simulatedTotal} Conducted Lectures.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setPlannedBunks(0);
              setPlannedAttends(0);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition self-start sm:self-auto"
          >
            Reset Planner
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. COURSE SYLLABUS & LEARNING MODULE TRACKER (ILIZONE REPOSITORY)      */}
      {/* ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> B.Tech CSE Course Syllabus &amp; Module Tracker
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit-wise curriculum progression matching the official Integral Learning Initiative (ILI) syllabus.
            </p>
          </div>
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full font-bold">
            Semester 3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ACADEMIC_SYLLABUS.map((course) => (
            <div
              key={course.code}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">{course.code}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{course.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Faculty: {course.faculty} · {course.credits} Credits</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                {course.units.map((u) => (
                  <div
                    key={u.unit}
                    className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white border border-slate-200/80"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] font-bold text-slate-500 flex-shrink-0">
                        {u.unit}
                      </span>
                      <span className="truncate text-slate-700 font-medium">{u.topic}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${u.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : u.status === "In Progress"
                          ? "bg-orange-50 text-orange-700 border border-orange-200"
                          : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {u.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
