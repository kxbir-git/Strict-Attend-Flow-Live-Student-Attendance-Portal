"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Eye,
  X,
  Loader2,
} from "lucide-react";

export default function AdminAuditLogPage() {
  const [logs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/admin/audit-log");
        const json = await res.json();
        if (json.success) setAuditLogs(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        <span>Loading institutional audit trail...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <History className="w-6 h-6 text-purple-600" /> Institutional Mutation Audit Trail
        </h1>
        <p className="text-xs text-slate-500">
          Complete tamper-evident log of all attendance sessions, user modifications, and timetable operations.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5 text-center">Role</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Origin IP</th>
                <th className="p-3.5 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {log.user?.name || "System Automated"}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {log.role || "SYSTEM"}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-purple-700 text-[11px]">
                    {log.action}
                  </td>
                  <td className="p-3.5 text-slate-700">
                    {log.entityType}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                    {log.ip || "127.0.0.1"}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold transition"
                    >
                      <Eye className="w-3 h-3 text-purple-600" /> Inspect Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Audit Event Details</h3>
                <p className="text-xs text-purple-700 font-mono">{selectedLog.action}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedLog.beforeJson && (
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    State Before Mutation
                  </span>
                  <pre className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-rose-700 overflow-x-auto border border-rose-200">
                    {JSON.stringify(JSON.parse(selectedLog.beforeJson), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.afterJson && (
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    State After Mutation
                  </span>
                  <pre className="p-3 bg-slate-50 rounded-xl font-mono text-[11px] text-emerald-700 overflow-x-auto border border-emerald-200">
                    {JSON.stringify(JSON.parse(selectedLog.afterJson), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
