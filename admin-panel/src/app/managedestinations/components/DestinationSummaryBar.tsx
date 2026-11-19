"use client";

import React from "react";
import { MapPin, Map, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import type { DestinationPayload } from "@/services/destination.service";

interface DestinationSummaryBarProps {
  destinations: DestinationPayload[];
}

export function DestinationSummaryBar({ destinations }: DestinationSummaryBarProps) {
  const totalCount = destinations.length;

  const distinctProvinces = new Set<string>();
  let totalPhotos = 0;
  let liveCount = 0;
  let hiddenCount = 0;

  for (const d of destinations) {
    const prov =
      d.province?.en?.trim() ||
      (typeof d.province === "string" ? d.province : "") ||
      Object.values(d.province || {})[0];
    if (prov) distinctProvinces.add(prov);

    if (d.images?.length) totalPhotos += d.images.length;

    if (d.isLive === false) {
      hiddenCount++;
    } else {
      liveCount++;
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Total Destinations (Hero Card) */}
      <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Destinations
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight">{totalCount}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Across Sri Lanka
        </p>
      </div>

      {/* 2. Provinces */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Provinces
          </span>
          <Map className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{distinctProvinces.size}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Covered regions
        </p>
      </div>

      {/* 3. Total Gallery Photos */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Photos
          </span>
          <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{totalPhotos}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Curated sights
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
          Public exploration
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
          {hiddenCount > 0 ? "Offline / Staged" : "All destinations live"}
        </p>
      </div>
    </div>
  );
}
