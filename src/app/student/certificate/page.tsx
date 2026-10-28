"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, ShieldCheck, FileText, CheckCircle, ExternalLink, QrCode } from "lucide-react";

export default function StudentCertificatePage() {
  const [downloading, setDownloading] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/student/certificate.pdf");
      if (!res.ok) throw new Error("Failed to generate PDF");

      const token = res.headers.get("X-Verification-Token");
      if (token) setVerificationToken(token);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Attendance_Certificate.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          Official Attendance Certificate
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate an HMAC-SHA256 digitally-signed official attendance certificate for scholarships, internships, or examination eligibility.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Registrar Verified
            </span>
            <h2 className="text-lg font-bold text-slate-900">Institutional Grade Certificate</h2>
            <p className="text-xs text-slate-500 max-w-md">
              Features student name, roll number, class, semester, subject-wise breakdown, overall percentage, and a tamper-proof verification URL.
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Generating PDF..." : "Download PDF Certificate"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">Cryptographically Signed</h3>
            <p className="text-[11px] text-slate-500">
              Each certificate carries a unique HMAC-SHA256 signature calculated from verified student attendance records.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">Instant Verification</h3>
            <p className="text-[11px] text-slate-500">
              Employers and exam boards can verify authenticity by visiting the verification link printed on the document.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900">75% Policy Compliance</h3>
            <p className="text-[11px] text-slate-500">
              Certificates for attendance below 75% are watermarked with an &quot;UNOFFICIAL COPY&quot; notice.
            </p>
          </div>
        </div>

        {verificationToken && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
            <p className="font-semibold">Last Generated Verification Token:</p>
            <div className="font-mono text-[11px] bg-white p-3 rounded-xl border border-emerald-200 break-all text-slate-700">
              {verificationToken}
            </div>
            <Link
              href={`/verify/${verificationToken}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-bold"
            >
              Test Public Verification Link <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
