"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  Loader2,
  HelpCircle,
  Languages,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import type { FaqItem } from "@/services/faq.service";
import { HoverScrollText } from "@/components/HoverScrollText";

interface FaqTableProps {
  faqs: FaqItem[];
  loading: boolean;
  deletingId: string | null;
  updatingId?: string | null;
  onDelete: (faq: FaqItem) => void;
  onToggleVisibility?: (faq: FaqItem) => void;
}

export function FaqTable({
  faqs,
  loading,
  deletingId,
  updatingId,
  onDelete,
  onToggleVisibility,
}: FaqTableProps) {
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

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="divide-y divide-slate-200/70">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-64 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-14 px-6 text-center space-y-2">
        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No FAQs match your search or filter</p>
        <p className="text-xs text-slate-500">
          Try clearing search filters or add a new question to the knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Top Meta Bar */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Frequently Asked Questions ({faqs.length})
          </span>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live on Site
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> Hidden / Draft
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-4 pr-3 w-[150px]">Ref &amp; Order</th>
              <th className="py-3 px-3 w-[150px]">Category</th>
              <th className="py-3 px-3 min-w-[240px] max-w-[320px]">Question (EN / JA)</th>
              <th className="py-3 px-3 min-w-[260px] max-w-[360px]">Answer Summary</th>
              <th className="py-3 px-3 w-[120px]">Visibility</th>
              <th className="py-3 pl-3 pr-4 text-right w-[140px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-xs">
            {faqs.map((faq, rowIndex) => {
              const hasEn = Boolean(faq.question?.en?.trim() && faq.answer?.en?.trim());
              const hasJa = Boolean(faq.question?.ja?.trim() && faq.answer?.ja?.trim());
              const isBilingual = hasEn && hasJa;
              const isBusy = deletingId === faq.id;
              const isUpdating = updatingId === faq.id;
              const isLive = faq.isLive !== false;

              return (
                <tr
                  key={faq.id}
                  className={`border-l-[3px] ${
                    !isLive
                      ? "border-l-slate-400 opacity-90"
                      : isBilingual
                      ? "border-l-emerald-500"
                      : "border-l-amber-400"
                  } transition-colors odd:bg-white even:bg-slate-50/65 hover:bg-emerald-50/45`}
                >
                  {/* 1. Row # + Copy */}
                  <td className="py-3.5 pl-3.5 pr-3 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 w-5">
                        {String(rowIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                        {faq.referenceId && faq.referenceId.trim()
                          ? faq.referenceId.trim()
                          : `FAQ-${faq.id.substring(0, 6).toUpperCase()}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyQuestion(faq)}
                        title="Copy Question Text"
                        className={`p-1 rounded-md border transition-colors cursor-pointer ${
                          copiedId === faq.id
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-400 hover:text-emerald-700 hover:border-emerald-300"
                        }`}
                      >
                        {copiedId === faq.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* 2. Category */}
                  <td className="py-3.5 px-3 align-middle max-w-[170px]">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-indigo-50/80 text-indigo-700 border-indigo-200 w-fit">
                        {faq.category?.en || "General Support"}
                      </span>
                      {faq.category?.ja && faq.category?.ja !== faq.category?.en && (
                        <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-semibold border bg-slate-100 text-slate-600 border-slate-200 w-fit">
                          {faq.category.ja}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. Question (with Vercel-style hover auto-scroll) */}
                  <td className="py-3.5 px-3 align-middle min-w-[240px] max-w-[320px]">
                    <HoverScrollText
                      text={faq.question?.en || "—"}
                      className="font-extrabold text-slate-900 text-xs"
                    />
                    {faq.question?.ja && (
                      <HoverScrollText
                        text={`🇯🇵 ${faq.question.ja}`}
                        className="text-[11px] text-slate-500 font-medium mt-0.5"
                      />
                    )}
                  </td>

                  {/* 4. Answer Preview (with Vercel-style hover auto-scroll) */}
                  <td className="py-3.5 px-3 align-middle min-w-[260px] max-w-[360px]">
                    <HoverScrollText
                      text={faq.answer?.en || faq.answer?.ja || "—"}
                      className="text-xs text-slate-600 font-normal leading-relaxed"
                    />
                  </td>

                  {/* 5. Live Visibility Toggle */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap w-[120px]">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onToggleVisibility?.(faq)}
                      className="cursor-pointer focus:outline-none"
                      title={isLive ? "Click to hide FAQ from public site" : "Click to publish FAQ live on public site"}
                    >
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <Eye className="w-3 h-3 text-emerald-600" />}
                          <span>Live</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 transition-colors">
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-slate-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                          <span>Hidden</span>
                        </span>
                      )}
                    </button>
                  </td>

                  {/* 6. Actions */}
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <Link
                        href={`/managefaqs/${faq.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onDelete(faq)}
                        title="Delete FAQ"
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
