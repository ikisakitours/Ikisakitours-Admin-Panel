"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Globe,
  ImageIcon,
  Loader2,
  MessageSquare,
  PackageCheck,
  Star,
  Trash2,
} from "lucide-react";
import type { FeedbackItem } from "../types/comment.types";
import {
  formatCommentRelativeTime,
  getDisplayCommentReference,
  isNewComment,
} from "../utils/commentFormatters";

interface CommentsTableProps {
  items: FeedbackItem[];
  loading: boolean;
  togglingId: string | null;
  deletingId: string | null;
  onViewDetails: (item: FeedbackItem) => void;
  onToggleVisibility: (item: FeedbackItem) => Promise<void>;
  onDelete: (item: FeedbackItem) => Promise<void>;
  onCopyReference: (reference: string) => void;
}

export function CommentsTable({
  items,
  loading,
  togglingId,
  deletingId,
  onViewDetails,
  onToggleVisibility,
  onDelete,
  onCopyReference,
}: CommentsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (item: FeedbackItem) => {
    const ref = getDisplayCommentReference(item);
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedId(item.id);
      onCopyReference(ref);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      onCopyReference(ref);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="divide-y divide-slate-200/70">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-44 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="space-y-2 flex-1 hidden md:block">
                <div className="h-4 w-52 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-36 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-7 w-24 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-14 px-6 text-center space-y-2">
        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No reviews or comments match your filters</p>
        <p className="text-xs text-slate-500">
          Try adjusting your search query, star rating, or reply filters.
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
            Reviews &amp; Guest Feedback ({items.length})
          </span>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Public
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> Hidden
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-500" /> Tour Review
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> Website Feedback
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-4 pr-3">Ref &amp; Date</th>
              <th className="py-3 px-3">Type &amp; Tour</th>
              <th className="py-3 px-3">Author / Guest</th>
              <th className="py-3 px-3">Rating &amp; Feedback</th>
              <th className="py-3 px-3 text-center">Visibility</th>
              <th className="py-3 px-3">Staff Reply</th>
              <th className="py-3 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-xs">
            {items.map((item, rowIndex) => {
              const refCode = getDisplayCommentReference(item);
              const isPackageReview = item.itemType === "package-review";
              const isNew = isNewComment(item.createdAt, 24);
              const hasReplied = Boolean(item.adminReply && item.adminReply.trim());
              const imageCount = item.imageUrls?.length || 0;
              const isBusy = togglingId === item.id || deletingId === item.id;

              const borderAccent = isPackageReview ? "border-l-purple-500" : "border-l-indigo-500";

              return (
                <tr
                  key={item.id}
                  className={`border-l-[3px] ${borderAccent} transition-colors odd:bg-white even:bg-slate-50/65 hover:bg-emerald-50/45`}
                >
                  {/* 1. Row # + Reference + Date */}
                  <td className="py-3.5 pl-3.5 pr-3 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 w-5">
                        {String(rowIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="inline-flex items-center rounded-lg border border-emerald-200/90 bg-emerald-50/80 px-2 py-0.5 font-mono text-[11px] font-extrabold text-emerald-900">
                        {refCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        title="Copy reference"
                        className={`p-1 rounded-md border transition-colors cursor-pointer ${
                          copiedId === item.id
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-400 hover:text-emerald-700 hover:border-emerald-300"
                        }`}
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      {isNew && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse" />
                          New
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 pl-6 text-[10px] text-slate-400">
                      {formatCommentRelativeTime(item.createdAt)}
                    </div>
                  </td>

                  {/* 2. Type & Tour Package */}
                  <td className="py-3.5 px-3 align-middle max-w-[210px]">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                        isPackageReview
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      {isPackageReview ? (
                        <PackageCheck className="w-3 h-3" />
                      ) : (
                        <MessageSquare className="w-3 h-3" />
                      )}
                      <span>{isPackageReview ? "Package Review" : "Website Feedback"}</span>
                    </span>

                    {item.source ? (
                      <p
                        className="text-xs font-bold text-slate-900 truncate mt-1"
                        title={item.source}
                      >
                        {item.source}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">General Feedback</p>
                    )}
                  </td>

                  {/* 3. Author / Guest (Overview Only) */}
                  <td className="py-3 px-3 align-middle max-w-[170px] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 font-bold text-slate-950 text-[10px] shadow-2xs">
                        {item.authorName?.charAt(0).toUpperCase() || "G"}
                      </div>
                      <p className="font-extrabold text-slate-900 truncate text-xs" title={`${item.authorName || "Guest"} ${item.country ? `(${item.country})` : ""}`}>
                        {item.authorName || "Guest"}
                      </p>
                    </div>
                  </td>

                  {/* 4. Rating & Feedback (Overview Only) */}
                  <td className="py-3 px-3 align-middle max-w-[240px]">
                    <div className="flex items-center gap-1.5">
                      {typeof item.rating === "number" && item.rating > 0 ? (
                        <div className="inline-flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{item.rating}.0</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}

                      {imageCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 text-slate-600 px-1.5 py-0.2 text-[9px] font-bold">
                          <ImageIcon className="w-2.5 h-2.5" />
                          <span>{imageCount}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate italic mt-0.5" title={item.content}>
                      &quot;{item.content}&quot;
                    </p>
                  </td>

                  {/* 5. Visibility Toggle */}
                  <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onToggleVisibility(item)}
                      title={item.isPubliclyVisible ? "Hide from website" : "Make public on website"}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold border transition-all cursor-pointer ${
                        item.isPubliclyVisible
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>{item.isPubliclyVisible ? "Public" : "Hidden"}</span>
                      {togglingId === item.id && (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      )}
                    </button>
                  </td>

                  {/* 6. Staff Reply Status */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    {!isPackageReview ? (
                      <span
                        className="inline-flex items-center text-slate-400 font-mono text-xs px-2 py-0.5"
                        title="Website feedback does not take staff replies"
                      >
                        —
                      </span>
                    ) : hasReplied ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Replied</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                        <Clock className="w-3 h-3" />
                        <span>Needs Reply</span>
                      </span>
                    )}
                  </td>

                  {/* 7. Actions */}
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isPackageReview && !hasReplied ? "Reply" : "View"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onDelete(item)}
                        title="Delete review"
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {deletingId === item.id ? (
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
