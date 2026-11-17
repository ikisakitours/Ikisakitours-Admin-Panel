"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { TROUBLESHOOTING_GUIDE_ITEMS } from "../data/manualMockData";
import { SectionCard } from "./SectionCard";

export function TroubleshootingSection() {
  const [selectedModule, setSelectedModule] = useState<string>("All");
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({
    [TROUBLESHOOTING_GUIDE_ITEMS[0].question]: true,
  });

  const modules = useMemo(
    () => ["All", ...Array.from(new Set(TROUBLESHOOTING_GUIDE_ITEMS.map((i) => i.module)))],
    []
  );

  const visibleItems = useMemo(
    () =>
      selectedModule === "All"
        ? TROUBLESHOOTING_GUIDE_ITEMS
        : TROUBLESHOOTING_GUIDE_ITEMS.filter((i) => i.module === selectedModule),
    [selectedModule]
  );

  const toggleQuestion = (q: string) => {
    setOpenQuestions((prev) => ({ ...prev, [q]: !prev[q] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    visibleItems.forEach((item) => {
      next[item.question] = true;
    });
    setOpenQuestions(next);
  };

  const collapseAll = () => {
    setOpenQuestions({});
  };

  return (
    <SectionCard
      id="troubleshooting"
      number="14"
      title="Common Issues & Troubleshooting"
      subtitle="Real-world root causes and instant step-by-step fixes covering every module in the Admin Panel."
      icon="alertTriangle"
    >
      <div className="space-y-4">
        {/* Category Filter Pills + Expand/Collapse Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <div className="flex flex-wrap gap-1.5">
            {modules.map((mod) => {
              const active = selectedModule === mod;
              const count =
                mod === "All"
                  ? TROUBLESHOOTING_GUIDE_ITEMS.length
                  : TROUBLESHOOTING_GUIDE_ITEMS.filter((i) => i.module === mod).length;

              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setSelectedModule(mod)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{mod}</span>
                  <span
                    className={`rounded px-1 text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <button
              type="button"
              onClick={expandAll}
              className="text-emerald-700 hover:underline cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-2.5">
          {visibleItems.map((item) => {
            const isOpen = Boolean(openQuestions[item.question]);
            return (
              <div
                key={item.question}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isOpen ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(item.question)}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left cursor-pointer"
                >
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.module}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 leading-snug">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-2.5 border-t border-slate-100 space-y-2 text-xs leading-relaxed">
                    <p className="text-rose-700">
                      <strong>Cause:</strong> {item.cause}
                    </p>
                    <p className="text-emerald-800">
                      <strong>Solution:</strong> {item.solution}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}
