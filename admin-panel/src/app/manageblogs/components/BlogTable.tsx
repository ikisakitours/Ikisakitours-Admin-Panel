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

interface BlogTableProps {
  blogs: BlogPayload[];
  loading: boolean;
  deletingId: string | null;
  updatingId?: string | null;
  onDelete: (blog: BlogPayload) => void;
  onToggleVisibility?: (blog: BlogPayload) => void;
}

export function BlogTable({
  blogs,
  loading,
  deletingId,
  updatingId,
  onDelete,
  onToggleVisibility,
}: BlogTableProps) {
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

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="divide-y divide-slate-200/70">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-14 h-11 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="h-8 w-24 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-14 px-6 text-center space-y-2">
        <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No blog articles found</p>
        <p className="text-xs text-slate-500">
          Try adjusting your search criteria or add a new article.
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
            Published Articles ({blogs.length})
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
              <th className="py-3 pl-4 pr-3 w-[80px]">Ref</th>
              <th className="py-3 px-3 w-[70px]">Cover</th>
              <th className="py-3 px-3">Title &amp; Author</th>
              <th className="py-3 px-3 w-[200px]">Category &amp; Slug</th>
              <th className="py-3 px-3 w-[130px]">Visibility</th>
              <th className="py-3 pl-3 pr-4 text-right w-[180px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-xs">
            {blogs.map((blog, rowIndex) => {
              const enTitle = resolveTitle(blog.title, "en") || "Untitled Article";
              const jaTitle = resolveTitle(blog.title, "ja");
              const hasEn = Boolean(enTitle);
              const hasJa = Boolean(jaTitle && jaTitle !== enTitle);
              const isBilingual = hasEn && hasJa;
              const categoryStr = resolveCategory(blog.category);
              const coverImage = blog.images?.[0];
              const isBusy = deletingId === blog.id;
              const isUpdating = updatingId === blog.id;
              const isLive = blog.isLive !== false;

              return (
                <tr
                  key={blog.id || blog.slug || rowIndex}
                  className={`border-l-[3px] ${
                    !isLive
                      ? "border-l-slate-400 opacity-90"
                      : isBilingual
                      ? "border-l-emerald-500"
                      : "border-l-amber-400"
                  } transition-colors odd:bg-white even:bg-slate-50/65 hover:bg-emerald-50/45`}
                >
                  {/* 1. Row # */}
                  <td className="py-3.5 pl-3.5 pr-3 align-middle whitespace-nowrap w-[80px]">
                    <span className="text-[10px] font-bold text-slate-400">
                      {String(rowIndex + 1).padStart(2, "0")}
                    </span>
                  </td>

                  {/* 2. Cover Thumbnail */}
                  <td className="py-3.5 px-3 align-middle w-[70px]">
                    {coverImage ? (
                      <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-200 relative shrink-0">
                        <Image
                          src={coverImage}
                          alt={enTitle}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    )}
                  </td>

                  {/* 3. Title & Author */}
                  <td className="py-3.5 px-3 align-middle max-w-[280px]">
                    <p className="font-extrabold text-slate-900 text-xs line-clamp-1" title={enTitle}>
                      {enTitle}
                    </p>
                    {jaTitle && jaTitle !== enTitle && (
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5" title={jaTitle}>
                        🇯🇵 {jaTitle}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{blog.author || "Ikisaki Editorial"}</span>
                      </span>
                      {blog.readTime && (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{resolveTitle(blog.readTime, "en") || "5 min read"}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 4. Category & Slug */}
                  <td className="py-3.5 px-3 align-middle w-[200px]">
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-indigo-50/80 text-indigo-700 border-indigo-200 w-fit">
                      {categoryStr}
                    </span>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                      <span className="truncate max-w-[140px]" title={`/${blog.slug}`}>
                        /{blog.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySlug(blog.slug)}
                        title="Copy slug"
                        className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                      >
                        {copiedSlug === blog.slug ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* 5. Live Visibility Toggle */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap w-[130px]">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onToggleVisibility?.(blog)}
                      className="cursor-pointer focus:outline-none"
                      title={isLive ? "Click to hide article from public site" : "Click to publish article live on public site"}
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
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right whitespace-nowrap w-[180px]">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <a
                        href={`https://www.ikisakitours.com/en/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                        title="View Public Article"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View</span>
                      </a>

                      <Link
                        href={`/manageblogs/${blog.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onDelete(blog)}
                        title="Delete article"
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
