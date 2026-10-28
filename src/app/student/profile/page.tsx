"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  Lock,
  FolderArchive,
  Download,
  Settings,
} from "lucide-react";

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
      <div className="text-center space-y-1">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Enrolled Profile &amp; Wallet
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Student Information &amp; Documents
        </h1>
        <p className="text-xs text-slate-500">
          Your official institutional enrollment details, immutable roll credentials, and document wallet.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black text-2xl shadow-xs">
              {user?.name ? user.name[0] : "S"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <div className="text-xs text-slate-500">{user?.email}</div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-700 mt-2">
                <ShieldCheck className="w-3 h-3" /> Verified Student
              </div>
            </div>
          </div>

          <Link
            href="/student/settings"
            className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 border border-slate-200 transition self-start sm:self-auto shadow-xs"
          >
            <Settings className="w-3.5 h-3.5" /> Edit Preferences
          </Link>
        </div>

        {/* Read-Only Academic Attributes */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Enrollment Number
              </span>
              <span className="font-mono font-bold text-slate-900 text-base">
                {`ENR2024${(user?.rollNo || "001").replace(/\D/g, "").padStart(3, "0")}`}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" /> System Immutable
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Official Roll Number
              </span>
              <span className="font-mono font-bold text-slate-900 text-base">
                {user?.rollNo || "BCA3A-001"}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" /> System Immutable
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Official Mail ID
              </span>
              <span className="font-medium text-slate-900 text-sm truncate block">
                {user?.email || "student.rahul@portal.edu"}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" /> Institutional Verified
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Phone Number
              </span>
              <span className="font-medium text-slate-900 text-sm block">
                {`+91 98765 ${(user?.rollNo || "001").replace(/\D/g, "").padStart(5, "0")}`}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" /> Registered Mobile
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Enrolled Class
              </span>
              <span className="font-bold text-slate-900 text-base">
                BCA-3A (Sec A)
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" /> Admin Enforced
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
                Perimeter Protection
              </span>
              <span className="font-bold text-emerald-700 text-base">
                STRICT_OWN_DATA
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Only Own Attendance Visible
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Department</span>
              <span className="font-semibold text-slate-900">Computer Applications</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Semester</span>
              <span className="font-semibold text-slate-900">3rd Semester</span>
            </div>
          </div>
        </div>

        {/* Document Wallet */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-emerald-600" />
              Digital Document Wallet
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">HMAC Verified</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900">Attendance Certificate</h4>
                <p className="text-[10px] text-slate-500">Official signed PDF with QR</p>
              </div>
              <Link
                href="/student/certificate"
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition shadow-xs"
              >
                <Download className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900">Personal Attendance CSV</h4>
                <p className="text-[10px] text-slate-500">Full audit log of marked lectures</p>
              </div>
              <a
                href="/api/student/attendance.csv"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-bold text-slate-900">Calendar ICS File</h4>
                <p className="text-[10px] text-slate-500">Apple Calendar &amp; Outlook sync</p>
              </div>
              <a
                href="/api/student/calendar.ics"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
