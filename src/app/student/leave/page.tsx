"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UploadCloud,
  FileCheck,
} from "lucide-react";

export default function StudentLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const loadLeaves = () => {
    setLoading(true);
    fetch("/api/student/leave")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setLeaves(res.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/student/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateFrom,
          dateTo,
          reason,
          attachmentUrl: attachmentUrl || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Leave request submitted successfully!" });
        setDateFrom("");
        setDateTo("");
        setReason("");
        setAttachmentUrl("");
        loadLeaves();
      } else {
        setMessage({ type: "error", text: data.message || data.error || "Submission failed" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-emerald-600" />
          Leave &amp; Absence Workflow
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Apply for medical or institutional leaves. Once approved, affected lectures are automatically recorded as{" "}
          <strong className="text-emerald-700">APPROVED_LEAVE</strong> (counted as attended, excluded from absent).
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm ${message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Leave Application Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900">Submit New Leave Application</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                From Date (Past max 3 days or Future) *
              </label>
              <input
                type="date"
                required
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                To Date *
              </label>
              <input
                type="date"
                required
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Absence *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Diagnosed with viral fever, prescribed bed rest / Attending university symposium"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Supporting Medical Document / Receipt URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/... or verified cloud document link"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-emerald-600"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>

      {/* Leave Application History */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Application History</h2>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No leave applications recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">From</th>
                  <th className="py-3 px-4 font-bold">To</th>
                  <th className="py-3 px-4 font-bold">Reason</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Reviewer Note</th>
                  <th className="py-3 px-4 font-bold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {new Date(l.dateFrom).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {new Date(l.dateTo).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${l.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : l.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                      >
                        {l.status === "APPROVED" && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                        {l.status === "REJECTED" && <XCircle className="w-3 h-3 text-rose-700" />}
                        {l.status === "PENDING" && <Clock className="w-3 h-3 text-amber-700" />}
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic">
                      {l.reviewNote ? `"${l.reviewNote}" (${l.reviewedBy})` : "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
