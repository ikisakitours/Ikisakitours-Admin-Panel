"use client";

import React from "react";
import { BookMarked, Search } from "lucide-react";
import { MANUAL_HERO_STATS, MANUAL_SEARCH_CHIPS } from "../data/manualMockData";

interface ManualHeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function ManualHero({ searchQuery, onSearchChange }: ManualHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-7 sm:p-10 shadow-xl border border-slate-800">
      {/* Ambient Emerald / Teal Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-teal-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
            <BookMarked className="w-3.5 h-3.5" />
            Official Operations Handbook
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white lg:whitespace-nowrap">
            Ikisaki Tours — Admin Panel Manual Guide
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Complete end-to-end documentation covering every screen, workflow, pricing rule, multilingual guideline, media validation, and daily operational tool across the Ikisaki Tours Admin Panel.
          </p>
        </div>

        {/* Live Search Box */}
        <div className="w-full lg:w-80 xl:w-88 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search guide (e.g. pricing, webp, slug, japanese)..."
              className="w-full rounded-xl border border-white/15 bg-white/10 pl-5 pr-6 py-2.5 text-xs text-white placeholder:text-slate-400 outline-none backdrop-blur-md focus:border-emerald-400/60 focus:bg-white/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {MANUAL_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onSearchChange(chip)}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                #{chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className="relative z-10 mt-7 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MANUAL_HERO_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3"
          >
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              {stat.label}
            </p>
            <p className={`text-sm sm:text-base font-extrabold mt-0.5 whitespace-nowrap ${stat.accentClass}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
