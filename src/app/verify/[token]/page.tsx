import React from "react";
import Link from "next/link";
import Image from "next/image";
import { verifyCertificateToken } from "@/lib/cert";
import { ShieldCheck, ShieldAlert, GraduationCap, ArrowLeft } from "lucide-react";

export default function VerifyCertificatePage({
  params,
}: {
  params: { token: string };
}) {
  const result = verifyCertificateToken(params.token);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 selection:bg-emerald-600 selection:text-white">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-orange-200 flex-shrink-0 bg-white">
              <Image
                src="/logo.png"
                alt="Strict Attend Flow"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Strict Attend Flow</h1>
              <p className="text-xs text-slate-500">Digital Credential Verification Service</p>
            </div>
          </div>
          <Link
            href="/login"
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Portal Login
          </Link>
        </div>

        {/* Verification Status */}
        {result.valid && result.data ? (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <ShieldCheck className="w-8 h-8 flex-shrink-0 text-emerald-600" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Cryptographically Verified Authentic
                </h2>
                <p className="text-xs text-emerald-700 mt-0.5">
                  This attendance certificate is genuine and has not been altered since generation.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold text-slate-900">{result.data.studentName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Roll Number:</span>
                <span className="font-mono font-bold text-slate-900">{result.data.rollNo}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Class / Section:</span>
                <span className="font-semibold text-slate-900">{result.data.className}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Overall Attendance:</span>
                <span
                  className={`font-black text-sm ${result.data.overallPercentage >= 75 ? "text-emerald-700" : "text-rose-600"
                    }`}
                >
                  {result.data.overallPercentage}%
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Lectures Held:</span>
                <span className="text-slate-800 font-semibold">{result.data.totalLectures}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Lectures Attended:</span>
                <span className="text-slate-800 font-semibold">{result.data.attendedLectures}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Eligibility Status:</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${result.data.isOfficial
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                >
                  {result.data.isOfficial ? "OFFICIAL COMPLIANT (>= 75%)" : "UNOFFICIAL DEFAULTER (< 75%)"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                <span>Certificate Token ID:</span>
                <span className="font-mono">{result.data.certId}</span>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-400">
              Verified via HMAC-SHA256 signature verification key.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
              <ShieldAlert className="w-8 h-8 flex-shrink-0 text-rose-600" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Verification Failed / Invalid Token
                </h2>
                <p className="text-xs text-rose-700 mt-0.5">
                  {result.error || "The cryptographic signature on this token is invalid or counterfeit."}
                </p>
              </div>
            </div>
            <div className="text-center text-xs text-slate-500 py-4">
              Please contact the Office of Academic Affairs to request a genuine digitally-signed certificate.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
