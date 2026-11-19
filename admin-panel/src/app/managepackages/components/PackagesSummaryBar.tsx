"use client";

import React from "react";
import { Package, CalendarDays, Sun, Eye, EyeOff } from "lucide-react";
import type { PackageListItem } from "@/services/package.service";

interface PackagesSummaryBarProps {
  packages: PackageListItem[];
}

export function PackagesSummaryBar({ packages }: PackagesSummaryBarProps) {
  const totalCount = packages.length;

  let multiDayCount = 0;
  let oneDayCount = 0;
  let liveCount = 0;
  let hiddenCount = 0;

  for (const p of packages) {
    if (p.type === "multiday") multiDayCount++;
    else oneDayCount++;

    if (p.isLive === false) hiddenCount++;
    else liveCount++;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Total Tour Packages (Hero Card) */}
      <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Total Packages
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight">{totalCount}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Bookable tour offerings
        </p>
      </div>

      {/* 2. Multi-Day Tours */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Multi-Day
          </span>
          <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{multiDayCount}</p>
        <p className="mt-0.5 text-[11px] text-purple-600 font-medium">
          Extended circuits
        </p>
      </div>

      {/* 3. One-Day Tours */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            One-Day
          </span>
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{oneDayCount}</p>
        <p className="mt-0.5 text-[11px] text-amber-600 font-medium">
          Day excursions
        </p>
      </div>

      {/* 4. Live on Website */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Live on Site
          </span>
          <Eye className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{liveCount}</p>
        <p className="mt-0.5 text-[11px] text-emerald-600 font-medium">
          Public online booking
        </p>
      </div>

      {/* 5. Hidden / Drafts */}
      <div className="col-span-2 md:col-span-4 lg:col-span-1 rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Hidden / Draft
          </span>
          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{hiddenCount}</p>
        <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
          {hiddenCount > 0 ? "Temporarily offline" : "All packages public"}
        </p>
      </div>
    </div>
  );
}
