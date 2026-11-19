"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { STAFF_ROLES } from "../data/staffRoles";

interface StaffFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  roleFilter: string;
  onRoleFilterChange: (r: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  twoFaFilter: string;
  onTwoFaFilterChange: (t: string) => void;
  totalCount: number;
}

export function StaffFiltersBar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  twoFaFilter,
  onTwoFaFilterChange,
  totalCount,
}: StaffFiltersBarProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input with standard width as on users/packages pages */}
        <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by staff name or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            aria-label="Filter by staff role"
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Roles ({totalCount})</option>
            {STAFF_ROLES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.title}
              </option>
            ))}
          </select>

          {/* Account Status Filter */}
          <select
            aria-label="Filter by account status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="SUSPENDED">Suspended Accounts</option>
          </select>

          {/* 2FA Filter */}
          <select
            aria-label="Filter by 2FA status"
            value={twoFaFilter}
            onChange={(e) => onTwoFaFilterChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All 2FA Statuses</option>
            <option value="ENABLED">2FA Protected</option>
            <option value="DISABLED">2FA Not Configured</option>
          </select>
        </div>
      </div>
    </div>
  );
}
