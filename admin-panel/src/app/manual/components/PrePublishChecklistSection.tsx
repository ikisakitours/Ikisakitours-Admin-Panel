"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, RotateCcw } from "lucide-react";
import { PRE_PUBLISH_CHECKLIST_ITEMS } from "../data/manualMockData";
import { SectionCard } from "./SectionCard";

export function PrePublishChecklistSection() {
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});

  const toggleTask = (idx: number) => {
    setCheckedTasks((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(checkedTasks).filter(Boolean).length;
  const percent = Math.round((completedCount / PRE_PUBLISH_CHECKLIST_ITEMS.length) * 100);

  return (
    <SectionCard
      id="checklist"
      number="13"
      title="Interactive Pre-Publish Tour Checklist"
      subtitle="Tick off every quality check below before publishing a tour package to guarantee a flawless customer experience."
      icon="shieldCheck"
    >
      <div className="space-y-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Verification Progress: {completedCount} / {PRE_PUBLISH_CHECKLIST_ITEMS.length} Completed
              </span>
              <span
                className={`font-extrabold ${
                  percent === 100 ? "text-emerald-600" : "text-indigo-600"
                }`}
              >
                {percent}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  percent === 100 ? "bg-emerald-500" : "bg-indigo-600"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCheckedTasks({})}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Checklist Items */}
        <div className="space-y-2">
          {PRE_PUBLISH_CHECKLIST_ITEMS.map((task, idx) => {
            const checked = Boolean(checkedTasks[idx]);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleTask(idx)}
                className={`w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  checked
                    ? "border-emerald-300 bg-emerald-50/70 text-emerald-950"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    checked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {checked && <Check className="w-3.5 h-3.5 stroke-3" />}
                </span>
                <span
                  className={`text-xs leading-relaxed ${
                    checked ? "line-through opacity-75 font-medium" : "font-semibold"
                  }`}
                >
                  {task}
                </span>
              </button>
            );
          })}
        </div>

        {percent === 100 && (
          <div className="rounded-xl bg-emerald-600 text-white px-4 py-3 text-xs font-bold flex items-center justify-between">
            <span>All checks passed! Your tour package is ready to go live.</span>
            <Link href="/addpackage" className="underline whitespace-nowrap ml-2">
              Open Add Package →
            </Link>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
