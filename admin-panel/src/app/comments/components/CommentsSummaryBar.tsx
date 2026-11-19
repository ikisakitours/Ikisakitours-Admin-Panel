"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Globe,
  MessageSquare,
  PackageCheck,
  Star,
} from "lucide-react";
import type { FeedbackItem } from "../types/comment.types";
import { isNewComment } from "../utils/commentFormatters";

interface CommentsSummaryBarProps {
  items: FeedbackItem[];
  selectedCategory: string;
  onSelectCategory: (category: "all" | "package-review" | "website") => void;
  selectedReplyFilter: string;
  onSelectReplyFilter: (filter: "all" | "pending" | "replied") => void;
}

export function CommentsSummaryBar({
  items,
  selectedCategory,
  onSelectCategory,
  selectedReplyFilter,
  onSelectReplyFilter,
}: CommentsSummaryBarProps) {
  const stats = useMemo(() => {
    let packageReviews = 0;
    let websiteFeedback = 0;
    let awaitingReply = 0;
    let publiclyVisible = 0;
    let new24h = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    for (const item of items) {
      if (item.itemType === "package-review") {
        packageReviews++;
      } else {
        websiteFeedback++;
      }

      if (typeof item.rating === "number" && item.rating > 0) {
        ratingSum += item.rating;
        ratingCount++;
      }

      if (
        item.itemType === "package-review" &&
        (!item.adminReply || !item.adminReply.trim())
      ) {
        awaitingReply++;
      }
      if (item.isPubliclyVisible) publiclyVisible++;
      if (isNewComment(item.createdAt, 24)) new24h++;
    }

    const averageRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : "5.0";

    return {
      total: items.length,
      averageRating,
      ratingCount,
      packageReviews,
      websiteFeedback,
      awaitingReply,
      publiclyVisible,
      new24h,
    };
  }, [items]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Total Reviews */}
      <button
        type="button"
        onClick={() => {
          onSelectCategory("all");
          onSelectReplyFilter("all");
        }}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedCategory === "all" && selectedReplyFilter === "all"
            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Total Reviews
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.total}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Tours &amp; Website</p>
      </button>

      {/* 2. Site Health & Average Rating */}
      <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 text-slate-800 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
            Site Health / CSAT
          </span>
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <p className="text-xl font-black text-amber-900">{stats.averageRating}</p>
          <span className="text-xs font-bold text-amber-600">/ 5.0</span>
        </div>
        <p className="text-[10px] text-amber-700/80 mt-0.5">
          {stats.ratingCount > 0 ? `${stats.ratingCount} reviews rated` : "Guest satisfaction"}
        </p>
      </div>

      {/* 3. Package Reviews */}
      <button
        type="button"
        onClick={() => onSelectCategory(selectedCategory === "package-review" ? "all" : "package-review")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedCategory === "package-review"
            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-purple-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Tour Reviews
          </span>
          <PackageCheck className="w-3.5 h-3.5 text-purple-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.packageReviews}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Specific tour experiences</p>
      </button>

      {/* 4. Website Feedback */}
      <button
        type="button"
        onClick={() => onSelectCategory(selectedCategory === "website" ? "all" : "website")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedCategory === "website"
            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Site Feedback
          </span>
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.websiteFeedback}</p>
        <p className="text-[10px] opacity-70 mt-0.5">General guest comments</p>
      </button>

      {/* 5. Awaiting Staff Reply */}
      <button
        type="button"
        onClick={() => onSelectReplyFilter(selectedReplyFilter === "pending" ? "all" : "pending")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedReplyFilter === "pending"
            ? "bg-rose-500 text-white border-rose-500 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-rose-300 hover:bg-rose-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Awaiting Reply
          </span>
          <Clock className="w-3.5 h-3.5 text-rose-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.awaitingReply}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Needs staff response</p>
      </button>

      {/* 6. Publicly Live */}
      <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-slate-800 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
            Publicly Live
          </span>
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <p className="text-xl font-black text-emerald-950 mt-1">{stats.publiclyVisible}</p>
        <p className="text-[10px] text-emerald-700/80 mt-0.5">Visible on ikisakitours.com</p>
      </div>
    </div>
  );
}
