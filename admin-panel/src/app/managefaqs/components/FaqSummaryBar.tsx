"use client";

import React from "react";
import { HelpCircle, FolderTree, BookOpen, Eye, EyeOff } from "lucide-react";
import type { FaqItem } from "@/services/faq.service";

interface FaqSummaryBarProps {
  faqs: FaqItem[];
}

export function FaqSummaryBar({ faqs }: FaqSummaryBarProps) {
  const totalCount = faqs.length;

  // Distinct categories count
  const distinctCategories = new Set<string>();
  let liveCount = 0;
  let hiddenCount = 0;

  for (const faq of faqs) {
    const enCat = faq.category?.en?.trim();
    const jaCat = faq.category?.ja?.trim();
    if (enCat) distinctCategories.add(enCat);
    if (jaCat) distinctCategories.add(jaCat);

    if (faq.isLive === false) {
      hiddenCount++;
    } else {
      liveCount++;
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Total FAQs (Hero Card) */}
      <div className="col-span-2 sm:col-span-1 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Total FAQs
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight">{totalCount}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Across {distinctCategories.size} categories
        </p>
      </div>

      {/* 2. Categories */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Categories
          </span>
          <FolderTree className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{distinctCategories.size}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Topics &amp; Services
        </p>
      </div>

      {/* 3. Knowledge Base */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Support Q&amp;A
          </span>
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{totalCount}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Answer guides
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
          Public Help Center
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
          {hiddenCount > 0 ? "Offline / Staged" : "All FAQs live"}
        </p>
      </div>
    </div>
  );
}
