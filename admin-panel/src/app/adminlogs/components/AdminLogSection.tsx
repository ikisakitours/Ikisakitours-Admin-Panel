"use client";

import { useState } from "react";

export interface LogEntry {
  id: string;
  createdAt: string;
  logType: "allocation" | "issue" | "schedule" | "note";
  relatedRequestId?: string;
  assignedStaff?: string;
  content: string;
}

const mockInitialLogs: LogEntry[] = [
  {
    id: "1",
    createdAt: "Jul 22, 10:15 AM",
    logType: "allocation",
    relatedRequestId: "req_1",
    assignedStaff: "Saman (Driver)",
    content: "Allocated luxury SUV (WP-CAB-1234) for David Miller's Ella trip.",
  },
  {
    id: "2",
    createdAt: "Jul 22, 09:30 AM",
    logType: "issue",
    relatedRequestId: "req_2",
    content: "Vehicle needed maintenance. Swapped driver to Nimal for Sigiriya tour.",
  },
];

export default function AdminLogSection() {
  const [logs, setLogs] = useState<LogEntry[]>(mockInitialLogs);

  // Form State
  const [logType, setLogType] = useState<LogEntry["logType"]>("allocation");
  const [relatedRequestId, setRelatedRequestId] = useState("");
  const [assignedStaff, setAssignedStaff] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newLog: LogEntry = {
      id: Date.now().toString(),
      createdAt: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric",
      }),
      logType,
      relatedRequestId: relatedRequestId.trim() || undefined,
      assignedStaff: assignedStaff.trim() || undefined,
      content,
    };

    setLogs([newLog, ...logs]);

    // Reset Form
    setContent("");
    setRelatedRequestId("");
    setAssignedStaff("");
  };

  return (
    <div className="space-y-6">
      
      {/* --- QUICK INPUT FORM --- */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span>📝</span> Add Operations Log Entry
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Log Category */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Log Type
            </label>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value as any)}
              className="w-full text-xs font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              <option value="allocation">👤 Allocation</option>
              <option value="schedule">📅 Schedule</option>
              <option value="issue">⚠️ Issue / Alert</option>
              <option value="note">📝 General Note</option>
            </select>
          </div>

          {/* Related Request ID */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Request ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. req_1"
              value={relatedRequestId}
              onChange={(e) => setRelatedRequestId(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 sm:w-36 focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          {/* Assigned Staff/Driver */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Assigned Staff (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Driver Saman"
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 sm:w-44 focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>
        </div>

        {/* Note Content */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
            Work Note / Operational Details *
          </label>
          <textarea
            required
            rows={2}
            placeholder="Type your operational log note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            + Post Log Entry
          </button>
        </div>
      </form>

      {/* --- LOG DISPLAY STREAM --- */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Activity Stream ({logs.length})
          </h3>
          <span className="text-[11px] text-slate-400">Newest first</span>
        </div>

        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 text-xs transition-all hover:bg-slate-50"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                      log.logType === "issue"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : log.logType === "allocation"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : log.logType === "schedule"
                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                        : "bg-slate-200 text-slate-700 border border-slate-300"
                    }`}
                  >
                    {log.logType}
                  </span>

                  {log.relatedRequestId && (
                    <span className="font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                      #{log.relatedRequestId}
                    </span>
                  )}

                  {log.assignedStaff && (
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-medium text-[11px]">
                      👤 {log.assignedStaff}
                    </span>
                  )}
                </div>

                <p className="text-slate-700 font-medium leading-relaxed">
                  {log.content}
                </p>
              </div>

              <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-4 pt-0.5">
                {log.createdAt}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}