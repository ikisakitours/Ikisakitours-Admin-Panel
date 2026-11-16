// managefaqs/components/FaqList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { FaqItem, faqService } from "@/services/faq.service";

interface FaqListProps {
  faqs: FaqItem[];
  onFaqDeleted?: (deletedId: string) => void;
}

export default function FaqList({ faqs, onFaqDeleted }: FaqListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this FAQ? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await faqService.deleteFaq(id);
      if (onFaqDeleted) {
        onFaqDeleted(id);
      }
    } catch (error: any) {
      alert(error.message || "Failed to delete FAQ");
    } finally {
      setDeletingId(null);
    }
  };

  if (!faqs || faqs.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          No FAQs found. Create your first FAQ to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
        >
          {/* Top Bar: Category Badges & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                EN: {faq.category?.en || "Uncategorized"}
              </span>
              {faq.category?.ja && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  JA: {faq.category.ja}
                </span>
              )}
            </div>

            {/* Edit & Delete Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href={`/managefaqs/${faq.id}/edit`}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                Edit
              </Link>

              <button
                type="button"
                onClick={() => handleDelete(faq.id)}
                disabled={deletingId === faq.id}
                className="px-3.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deletingId === faq.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          {/* Content Grid: English vs Japanese */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Column */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                English (EN)
              </span>
              <h3 className="text-sm font-bold text-slate-800">
                {faq.question?.en || "—"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {faq.answer?.en || "—"}
              </p>
            </div>

            {/* Japanese Column */}
            <div className="space-y-1.5 md:border-l md:border-slate-100 md:pl-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Japanese (JA)
              </span>
              <h3 className="text-sm font-bold text-slate-800">
                {faq.question?.ja || "—"}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {faq.answer?.ja || "—"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}