"use client";

import React from "react";
import { UserCheck, Table2, LayoutGrid, RefreshCw, UserPlus } from "lucide-react";

interface StaffHeaderProps {
  viewMode: "table" | "cards";
  onViewModeChange: (mode: "table" | "cards") => void;
  loading: boolean;
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export function StaffHeader({
  viewMode,
  onViewModeChange,
  loading,
  onRefresh,
  onOpenAddModal,
}: StaffHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
              Staff &amp; Access Control (RBAC)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Internal team credentials, role-based access control, and 2FA compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Segmented View Mode, Refresh, Add Staff */}
      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        {/* View Mode Toggle: [ Table | Cards ] */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            title="Table View"
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("cards")}
            title="Cards View"
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              viewMode === "cards"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
        </div>

        {/* Refresh */}
        <button
          type="button"
          disabled={loading}
          onClick={onRefresh}
          title="Reload staff members"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Add Staff Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>
    </div>
  );
}
