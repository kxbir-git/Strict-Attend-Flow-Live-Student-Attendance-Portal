"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

export default function AdminLeaveRequestsPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadLeaves = () => {
    setLoading(true);
    fetch("/api/leave")
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

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/leave/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewNote: reviewNotes[id] || "",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Leave request ${status.toLowerCase()} by Administrator. ${status === "APPROVED" ? `Updated ${data.recordsAdjusted} attendance records to APPROVED_LEAVE.` : ""
            }`,
        });
        loadLeaves();
      } else {
        setMessage({ type: "error", text: data.message || data.error });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLeaves =
    selectedStatus === "ALL"
      ? leaves
      : leaves.filter((l) => l.status === selectedStatus);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-purple-600" />
            Institutional Leave Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global administrative overview of all student leave and absence applications.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${selectedStatus === status
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs sm:text-sm ${message.type === "success"
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

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading leave requests...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No leave requests found matching selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Leave Dates</th>
                  <th className="py-3 px-4">Reason &amp; Attachment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{l.student?.user?.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{l.student?.rollNo}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {l.student?.class?.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {new Date(l.dateFrom).toLocaleDateString()} &rarr;{" "}
                      {new Date(l.dateTo).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs space-y-1">
                      <p className="text-slate-800 line-clamp-2">{l.reason}</p>
                      {l.attachmentUrl && (
                        <a
                          href={l.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" /> View Attachment
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${l.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : l.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                      >
                        {l.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                        {l.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                        {l.status === "PENDING" && <Clock className="w-3 h-3" />}
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {l.status === "PENDING" ? (
                        <div className="space-y-2 inline-block text-right">
                          <input
                            type="text"
                            placeholder="Optional admin review note..."
                            value={reviewNotes[l.id] || ""}
                            onChange={(e) =>
                              setReviewNotes({ ...reviewNotes, [l.id]: e.target.value })
                            }
                            className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white block w-48"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReview(l.id, "APPROVED")}
                              disabled={actionLoading === l.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 transition disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleReview(l.id, "REJECTED")}
                              disabled={actionLoading === l.id}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 transition disabled:opacity-50"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">
                          Reviewed by {l.reviewedBy}
                          {l.reviewNote && <p className="italic text-slate-600">&ldquo;{l.reviewNote}&rdquo;</p>}
                        </div>
                      )}
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
