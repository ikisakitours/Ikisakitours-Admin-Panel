"use client";

import { useMemo } from "react";
import {
  Car,
  Clock,
  Compass,
  FileCheck2,
  Plane,
  Sparkles,
} from "lucide-react";
import type { TourServiceRequest } from "../types/tourservice.types";
import { isNewServiceRequest } from "../utils/tourserviceFormatters";

interface TourServicesSummaryBarProps {
  services: TourServiceRequest[];
  selectedCategory: string;
  onSelectCategory: (category: "all" | "custom" | "chauffeur" | "transfer") => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export function TourServicesSummaryBar({
  services,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
}: TourServicesSummaryBarProps) {
  const stats = useMemo(() => {
    let custom = 0;
    let chauffeur = 0;
    let transfer = 0;
    let pending = 0;
    let approved = 0;
    let new24h = 0;

    for (const s of services) {
      if (s.category === "custom") custom++;
      else if (s.category === "chauffeur") chauffeur++;
      else if (s.category === "transfer") transfer++;

      const st = (s.status || "").toLowerCase();
      if (st === "pending") pending++;
      else if (st === "approved" || st === "active") approved++;

      if (isNewServiceRequest(s.createdAt, 24)) new24h++;
    }

    return {
      total: services.length,
      custom,
      chauffeur,
      transfer,
      pending,
      approved,
      new24h,
    };
  }, [services]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Total Requests */}
      <button
        type="button"
        onClick={() => {
          onSelectCategory("all");
          onSelectStatus("all");
        }}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedCategory === "all" && selectedStatus === "all"
            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Total Requests
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.total}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Across 3 service lines</p>
      </button>

      {/* 2. Custom Tours */}
      <button
        type="button"
        onClick={() => onSelectCategory(selectedCategory === "custom" ? "all" : "custom")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedCategory === "custom"
            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Custom Tours
          </span>
          <Compass className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.custom}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Tailored itineraries</p>
      </button>

      {/* 3. Chauffeurs */}
      <button
        type="button"
        onClick={() => onSelectCategory(selectedCategory === "chauffeur" ? "all" : "chauffeur")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedCategory === "chauffeur"
            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-purple-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Chauffeur
          </span>
          <Car className="w-3.5 h-3.5 text-purple-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.chauffeur}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Private driver hire</p>
      </button>

      {/* 4. Transfers */}
      <button
        type="button"
        onClick={() => onSelectCategory(selectedCategory === "transfer" ? "all" : "transfer")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedCategory === "transfer"
            ? "bg-teal-600 text-white border-teal-600 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-teal-300 hover:bg-teal-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Transfers
          </span>
          <Plane className="w-3.5 h-3.5 text-teal-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.transfer}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Airport &amp; Intercity</p>
      </button>

      {/* 5. Pending Review */}
      <button
        type="button"
        onClick={() => onSelectStatus(selectedStatus === "pending" ? "all" : "pending")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "pending"
            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Pending
          </span>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.pending}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Action required</p>
      </button>

      {/* 6. Approved / Active */}
      <button
        type="button"
        onClick={() => onSelectStatus(selectedStatus === "approved" ? "all" : "approved")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "approved"
            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Approved / Active
          </span>
          <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.approved}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Confirmed services</p>
      </button>
    </div>
  );
}
