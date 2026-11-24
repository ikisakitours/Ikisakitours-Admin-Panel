"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Package as PackageIcon,
  Copy,
  Check,
  ExternalLink,
  CalendarDays,
  Sun,
} from "lucide-react";
import type { PackageListItem } from "@/services/package.service";
import { HoverScrollText } from "@/components/HoverScrollText";

interface PackagesTableProps {
  packages: PackageListItem[];
  loading: boolean;
  deletingSlug: string | null;
  updatingSlug?: string | null;
  onEdit: (slug: string) => void;
  onDelete: (pkg: PackageListItem) => void;
  onToggleVisibility?: (pkg: PackageListItem) => void;
  viewMode?: "table" | "cards";
  locale?: string;
}

export function PackagesTable({
  packages,
  loading,
  deletingSlug,
  updatingSlug,
  onEdit,
  onDelete,
  onToggleVisibility,
  viewMode = "table",
  locale = "en",
}: PackagesTableProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopySlug = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(slug);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1800);
    } catch {
      // ignore
    }
  };

  const resolveTitle = (field: any, lang: string = "en"): string => {
    if (!field) return "Untitled Tour Package";
    if (typeof field === "string") return field;
    return field[lang] || field["en"] || Object.values(field)[0] || "Untitled Tour Package";
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
                <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-8 w-24 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-14 px-6 text-center space-y-2">
        <PackageIcon className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No tour packages found</p>
        <p className="text-xs text-slate-500">
          Try adjusting your search criteria or add a new package.
        </p>
      </div>
    );
  }

  // Cards View
  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg, index) => {
          const enTitle = resolveTitle(pkg.title, "en");
          const jaTitle = typeof pkg.title === "object" ? pkg.title?.ja : undefined;
          const isBusy = deletingSlug === pkg.slug;
          const isUpdating = updatingSlug === pkg.slug;
          const isMulti = pkg.type === "multiday";
          const isLive = pkg.isLive !== false;
          const publicUrl = `https://www.ikisakitours.com/en/booking/${
            isMulti ? "multi-days-tours" : "one-day-tours"
          }/${pkg.slug}`;

          return (
            <div
              key={pkg.slug || index}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border-l-4 ${
                !isLive
                  ? "border-l-slate-400 border-slate-200 opacity-90"
                  : isMulti
                  ? "border-l-purple-500 border-slate-200"
                  : "border-l-amber-500 border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isMulti
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {isMulti ? <CalendarDays className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                    <span>{isMulti ? "Multi-Day Tour" : "One-Day Excursion"}</span>
                  </span>

                  {/* Visibility Pill */}
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onToggleVisibility?.(pkg)}
                    className="cursor-pointer focus:outline-none"
                    title={isLive ? "Click to hide from public site" : "Click to make live on public site"}
                  >
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <Eye className="w-3 h-3 text-emerald-600" />}
                        <span>Live</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-colors">
                        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-slate-500" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                        <span>Hidden</span>
                      </span>
                    )}
                  </button>
                </div>

                <div className="mt-3 space-y-1.5">
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2" title={enTitle}>
                    {enTitle}
                  </h3>
                  {jaTitle && jaTitle !== enTitle && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-1" title={jaTitle}>
                      🇯🇵 {jaTitle}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono pt-1">
                    <span className="truncate max-w-[180px]">/{pkg.slug}</span>
                    <button
                      type="button"
                      onClick={() => handleCopySlug(pkg.slug)}
                      className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                      title="Copy slug"
                    >
                      {copiedSlug === pkg.slug ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Live Link</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(pkg.slug)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onDelete(pkg)}
                    className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete package"
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

  // Table View
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Top Meta Bar */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Tour Packages Catalog ({packages.length})
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
              <th className="py-3 pl-4 pr-3 w-[70px]">Ref</th>
              <th className="py-3 px-3 min-w-[240px] max-w-[300px]">Package Title &amp; Japanese</th>
              <th className="py-3 px-3 w-[170px]">Tour Type</th>
              <th className="py-3 px-3 w-[180px]">Slug Reference</th>
              <th className="py-3 px-3 w-[130px]">Visibility</th>
              <th className="py-3 pl-3 pr-4 text-right w-[180px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-xs">
            {packages.map((pkg, rowIndex) => {
              const enTitle = resolveTitle(pkg.title, "en");
              const jaTitle = typeof pkg.title === "object" ? pkg.title?.ja : undefined;
              const isMulti = pkg.type === "multiday";
              const isLive = pkg.isLive !== false;
              const isBusy = deletingSlug === pkg.slug;
              const isUpdating = updatingSlug === pkg.slug;
              const publicUrl = `https://www.ikisakitours.com/en/booking/${
                isMulti ? "multi-days-tours" : "one-day-tours"
              }/${pkg.slug}`;

              return (
                <tr
                  key={pkg.slug || rowIndex}
                  className={`border-l-[3px] ${
                    !isLive
                      ? "border-l-slate-400 opacity-90"
                      : isMulti
                      ? "border-l-purple-500"
                      : "border-l-amber-400"
                  } transition-colors odd:bg-white even:bg-slate-50/65 hover:bg-emerald-50/45`}
                >
                  {/* 1. Row # */}
                  <td className="py-3.5 pl-3.5 pr-3 align-middle whitespace-nowrap w-[70px]">
                    <span className="text-[10px] font-bold text-slate-400">
                      {String(rowIndex + 1).padStart(2, "0")}
                    </span>
                  </td>

                  {/* 2. Package Title (with Vercel-style hover auto-scroll) */}
                  <td className="py-3.5 px-3 align-middle min-w-[240px] max-w-[300px]">
                    <HoverScrollText
                      text={enTitle}
                      className="font-extrabold text-slate-900 text-xs"
                    />
                    {jaTitle && jaTitle !== enTitle && (
                      <HoverScrollText
                        text={`🇯🇵 ${jaTitle}`}
                        className="text-[11px] text-slate-500 font-medium mt-0.5"
                      />
                    )}
                  </td>

                  {/* 3. Tour Type */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap w-[170px]">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        isMulti
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {isMulti ? <CalendarDays className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                      <span>{isMulti ? "Multi Day Tour" : "One Day Excursion"}</span>
                    </span>
                  </td>

                  {/* 4. Slug */}
                  <td className="py-3.5 px-3 align-middle w-[180px]">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <span className="truncate max-w-[130px]" title={`/${pkg.slug}`}>
                        /{pkg.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySlug(pkg.slug)}
                        title="Copy slug"
                        className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                      >
                        {copiedSlug === pkg.slug ? (
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
                      onClick={() => onToggleVisibility?.(pkg)}
                      className="cursor-pointer focus:outline-none"
                      title={isLive ? "Click to hide from public website" : "Click to publish on public website"}
                    >
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                          ) : (
                            <Eye className="w-3 h-3 text-emerald-600" />
                          )}
                          <span>Live</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-colors">
                          {isUpdating ? (
                            <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-slate-400" />
                          )}
                          <span>Hidden</span>
                        </span>
                      )}
                    </button>
                  </td>

                  {/* 6. Actions */}
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right whitespace-nowrap w-[180px]">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                        title="View Public Booking Page"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => onEdit(pkg.slug)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onDelete(pkg)}
                        title="Delete tour package"
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
