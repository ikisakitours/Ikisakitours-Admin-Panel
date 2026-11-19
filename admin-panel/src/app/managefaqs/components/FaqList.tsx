"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Loader2, Languages, HelpCircle, Copy, Check, Eye, EyeOff } from "lucide-react";
import type { FaqItem } from "@/services/faq.service";

interface FaqListProps {
  faqs: FaqItem[];
  deletingId: string | null;
  updatingId?: string | null;
  onDelete: (faq: FaqItem) => void;
  onToggleVisibility?: (faq: FaqItem) => void;
}

export default function FaqList({
  faqs,
  deletingId,
  updatingId,
  onDelete,
  onToggleVisibility,
}: FaqListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyQuestion = async (faq: FaqItem) => {
    const q = faq.question?.en || faq.question?.ja || "";
    if (!q) return;
    try {
      await navigator.clipboard.writeText(q);
      setCopiedId(faq.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  if (!faqs || faqs.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center shadow-xs space-y-2">
        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">
          No FAQs found
        </p>
        <p className="text-xs text-slate-500">
          Create a new question or clear your filters to view existing FAQs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isBusy = deletingId === faq.id;
        const isUpdating = updatingId === faq.id;
        const isLive = faq.isLive !== false;
        const hasEn = Boolean(faq.question?.en?.trim() && faq.answer?.en?.trim());
        const hasJa = Boolean(faq.question?.ja?.trim() && faq.answer?.ja?.trim());
        const isBilingual = hasEn && hasJa;

        return (
          <div
            key={faq.id}
            className={`bg-white border rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border-l-4 ${
              !isLive
                ? "border-l-slate-400 border-slate-200 opacity-90"
                : isBilingual
                ? "border-l-emerald-500 border-slate-200"
                : "border-l-amber-400 border-slate-200"
            }`}
          >
            {/* Top Bar: Category Badges & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{String(index + 1).padStart(2, "0")}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                  {faq.category?.en || "General"}
                </span>
                {faq.category?.ja && faq.category?.ja !== faq.category?.en && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                    🇯🇵 {faq.category.ja}
                  </span>
                )}
                {/* Visibility Button */}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onToggleVisibility?.(faq)}
                  className="cursor-pointer focus:outline-none"
                  title={isLive ? "Click to hide from public site" : "Click to publish live"}
                >
                  {isLive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors">
                      {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <Eye className="w-3 h-3 text-emerald-600" />}
                      <span>Live</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 rounded-full hover:bg-slate-200 transition-colors">
                      {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-slate-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                      <span>Hidden</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Edit & Delete Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyQuestion(faq)}
                  title="Copy Question"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer"
                >
                  {copiedId === faq.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <Link
                  href={`/managefaqs/${faq.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => onDelete(faq)}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Content Grid: English vs Japanese */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* English Column */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <Languages className="w-3.5 h-3.5 text-blue-500" />
                  <span>English (EN)</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {faq.question?.en || <span className="text-slate-400 italic">No English question</span>}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {faq.answer?.en || <span className="text-slate-400 italic">No English answer provided.</span>}
                </p>
              </div>

              {/* Japanese Column */}
              <div className="space-y-2 md:border-l md:border-slate-100 md:pl-6">
                <div className="flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <Languages className="w-3.5 h-3.5 text-rose-500" />
                  <span>Japanese (JA)</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {faq.question?.ja || <span className="text-slate-400 italic">No Japanese translation</span>}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {faq.answer?.ja || <span className="text-slate-400 italic">No Japanese answer provided.</span>}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
