"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Clock,
  User,
} from "lucide-react";
import type { BlogPayload } from "@/services/blog.service";

interface BlogCardListProps {
  blogs: BlogPayload[];
  deletingId: string | null;
  updatingId?: string | null;
  onDelete: (blog: BlogPayload) => void;
  onToggleVisibility?: (blog: BlogPayload) => void;
}

export function BlogCardList({
  blogs,
  deletingId,
  updatingId,
  onDelete,
  onToggleVisibility,
}: BlogCardListProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopySlug = async (slug?: string) => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(slug);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1800);
    } catch {
      // ignore
    }
  };

  const resolveTitle = (field: any, lang: "en" | "ja" = "en"): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field["en"] || Object.values(field)[0] || "";
  };

  const resolveCategory = (field: any): string => {
    if (!field) return "Travel & Culture";
    if (typeof field === "string") return field;
    return field["en"] || Object.values(field)[0] || "Travel & Culture";
  };

  if (blogs.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center shadow-xs space-y-2">
        <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No blog articles found</p>
        <p className="text-xs text-slate-500">
          Try adjusting your search criteria or add a new article.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {blogs.map((blog, index) => {
        const enTitle = resolveTitle(blog.title, "en") || "Untitled Article";
        const jaTitle = resolveTitle(blog.title, "ja");
        const enSummary = resolveTitle(blog.summary, "en");
        const categoryStr = resolveCategory(blog.category);
        const coverImage = blog.images?.[0];
        const isBusy = deletingId === blog.id;
        const isUpdating = updatingId === blog.id;
        const isLive = blog.isLive !== false;
        const hasJa = Boolean(jaTitle && jaTitle !== enTitle);

        return (
          <div
            key={blog.id || blog.slug || index}
            className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
              !isLive ? "border-slate-300 opacity-90" : "border-slate-200"
            }`}
          >
            <div>
              {/* Cover Image */}
              <div className="h-40 w-full relative bg-slate-100 overflow-hidden">
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt={enTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
                {/* Category Pill Over Image */}
                <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold bg-white/90 backdrop-blur-xs text-indigo-700 rounded-lg border border-white/60 shadow-xs">
                  {categoryStr}
                </span>

                {/* Visibility Pill Over Image */}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onToggleVisibility?.(blog)}
                  className="absolute top-3 right-3 cursor-pointer focus:outline-none"
                  title={isLive ? "Click to hide from public site" : "Click to publish live"}
                >
                  {isLive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold bg-emerald-600/90 text-white backdrop-blur-xs rounded-full shadow-xs hover:bg-emerald-700 transition-colors">
                      {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Eye className="w-3 h-3 text-white" />}
                      <span>Live</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-slate-900/80 text-slate-200 backdrop-blur-xs rounded-full shadow-xs hover:bg-slate-900 transition-colors">
                      {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-slate-300" /> : <EyeOff className="w-3 h-3 text-slate-300" />}
                      <span>Hidden</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug" title={enTitle}>
                  {enTitle}
                </h3>
                {jaTitle && jaTitle !== enTitle && (
                  <p className="text-xs text-slate-500 font-medium line-clamp-1" title={jaTitle}>
                    🇯🇵 {jaTitle}
                  </p>
                )}
                {enSummary && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {enSummary}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{blog.author || "Ikisaki Editorial"}</span>
                  </span>
                  {blog.readTime && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{resolveTitle(blog.readTime, "en") || "5 min"}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={`https://www.ikisakitours.com/en/blog/${blog.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Article</span>
              </a>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/manageblogs/${blog.id}/edit`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onDelete(blog)}
                  className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete article"
                >
                  {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
