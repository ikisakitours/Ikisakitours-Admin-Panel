"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Monitor, Sparkles } from "lucide-react";
import { QUICK_DIRECTORY_MODULES } from "../data/manualMockData";
import { SectionCard } from "./SectionCard";
import { ManualIcon } from "./ManualIcon";

export function QuickDirectorySection() {
  return (
    <SectionCard
      id="getting-started"
      number="01"
      title="Getting Started & Complete Module Directory"
      subtitle="Understand desktop requirements, hover sidebar navigation, and jump directly into any admin page."
      icon="monitor"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
          <p className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-600" /> Desktop-First Workspace
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Operate on a PC or laptop screen (<strong>≥ 1024px</strong> width). Narrow mobile screens are intentionally blocked by{" "}
            <code>DesktopOnlyGuard</code> to protect complex tables, itineraries, and pricing rules.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1.5">
          <p className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Hover-to-Expand Sidebar
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Move your cursor over the left navigation rail to expand all 10 module groups. Clicking any link loads the page cleanly while keeping the sidebar locked in place.
          </p>
        </div>
      </div>

      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
        Quick-Launch Directory (All {QUICK_DIRECTORY_MODULES.length} Modules)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {QUICK_DIRECTORY_MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-emerald-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${mod.colorClass}`}
              >
                <ManualIcon name={mod.icon} className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                  {mod.label}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{mod.desc}</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
