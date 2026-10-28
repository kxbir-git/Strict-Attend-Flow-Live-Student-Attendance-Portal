"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, AlertTriangle } from "lucide-react";

export default function ParentPortalPage({
  params,
}: {
  params: { token: string };
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/parent/${params.token}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error || "Unable to load student report");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading Student Attendance Digest...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-base font-bold text-slate-900">Access Link Expired or Invalid</h1>
          <p className="text-xs text-slate-500">{error || "Please request a fresh link from the student."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white">
      <header className="bg-white/90 border-b border-slate-200 px-4 sm:px-8 py-4 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-orange-200 flex-shrink-0 bg-white">
              <Image
                src="/logo.png"
                alt="Strict Attend Flow"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">Parent &amp; Guardian Digest</h1>
              <p className="text-[11px] text-slate-500">Strict Attend Flow Read-Only Portal</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Read-Only Access
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-6 flex-1">
        {/* Student Overview Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-700">
              Enrolled Student Record
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">{data.studentName}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Roll No: <span className="font-mono font-bold text-slate-700">{data.rollNo}</span> • Class:{" "}
              <span className="text-slate-700 font-semibold">{data.className}</span>
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block uppercase">Overall Attendance</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-3xl font-black ${data.overall.percentage >= 75 ? "text-emerald-700" : "text-rose-600"
                  }`}
              >
                {data.overall.percentage}%
              </span>
              <span className="text-xs text-slate-500">
                ({data.overall.attended}/{data.overall.total})
              </span>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1.5 ${data.overall.percentage >= 75
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}
            >
              {data.overall.percentage >= 75 ? "In Safe Zone (>= 75%)" : "Defaulter Risk (< 75%)"}
            </span>
          </div>
        </div>

        {/* Warning if defaulter */}
        {data.overall.isDefaulter && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-rose-900">Mandatory Attendance Compliance Warning</p>
              <p className="text-rose-700">
                Student is currently below the institutional 75% attendance threshold. They must attend the next{" "}
                <strong>{data.overall.classesNeededToRecover} consecutive lectures</strong> to restore examination eligibility.
              </p>
            </div>
          </div>
        )}

        {/* Subject-Wise Attendance Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Subject-Wise Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Subject</th>
                  <th className="py-3 px-4 font-bold">Code</th>
                  <th className="py-3 px-4 text-center font-bold">Held</th>
                  <th className="py-3 px-4 text-center font-bold">Attended</th>
                  <th className="py-3 px-4 text-right font-bold">Attendance %</th>
                  <th className="py-3 px-4 text-right font-bold">Faculty Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.subjects.map((sub: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{sub.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{sub.code}</td>
                    <td className="py-3.5 px-4 text-center text-slate-600">{sub.held}</td>
                    <td className="py-3.5 px-4 text-center text-slate-600">{sub.attended}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`font-black ${sub.percent >= 75 ? "text-emerald-700" : "text-rose-600"
                          }`}
                      >
                        {sub.percent}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`mailto:${sub.teacherEmail}?subject=Attendance Inquiry for ${encodeURIComponent(
                          data.studentName
                        )} (${data.rollNo})`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                      >
                        <Mail className="w-3 h-3 text-slate-500" /> {sub.teacherName}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
