"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  MapPin,
  Copy,
  Check,
  Compass,
  Eye,
  EyeOff,
} from "lucide-react";
import type { DestinationPayload } from "@/services/destination.service";

interface DestinationCardListProps {
  destinations: DestinationPayload[];
  deletingId: string | null;
  updatingId?: string | null;
  onDelete: (dest: DestinationPayload) => void;
  onToggleVisibility?: (dest: DestinationPayload) => void;
}

export function DestinationCardList({
  destinations,
  deletingId,
  updatingId,
  onDelete,
  onToggleVisibility,
}: DestinationCardListProps) {
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

  const resolveText = (field: any, lang: "en" | "ja" = "en"): string => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field["en"] || Object.values(field)[0] || "";
  };

  if (destinations.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center shadow-xs space-y-2">
        <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No destinations found</p>
        <p className="text-xs text-slate-500">
          Try adjusting your search criteria or add a new travel destination.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {destinations.map((dest, index) => {
        const enTitle = resolveText(dest.title, "en") || "Untitled Destination";
        const jaTitle = resolveText(dest.title, "ja");
        const provinceStr = resolveText(dest.province, "en") || "Sri Lanka";
        const enSummary = resolveText(dest.summary, "en");
        const coverImage = dest.images?.[0];
        const isBusy = deletingId === dest.id;
        const isUpdating = updatingId === dest.id;
        const isLive = dest.isLive !== false;
        const hasJa = Boolean(jaTitle && jaTitle !== enTitle);

        return (
          <div
            key={dest.id || dest.slug || index}
            className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
              !isLive ? "border-slate-300 opacity-90" : "border-slate-200"
            }`}
          >
            <div>
              {/* Photo */}
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
                    <MapPin className="w-8 h-8" />
                  </div>
                )}
                {/* Province Pill */}
                <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold bg-white/90 backdrop-blur-xs text-indigo-700 rounded-lg border border-white/60 shadow-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  <span>{provinceStr}</span>
                </span>

                {/* Visibility Button Over Image */}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onToggleVisibility?.(dest)}
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
                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1 leading-snug" title={enTitle}>
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
                {dest.coordinates?.lat && dest.coordinates?.lng && (
                  <div className="flex items-center gap-1 pt-1 text-[10px] text-slate-400 font-mono">
                    <Compass className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>
                      {dest.coordinates.lat.toFixed(2)}°, {dest.coordinates.lng.toFixed(2)}°
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={`https://www.ikisakitours.com/en/destination/${dest.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Live Destination</span>
              </a>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/managedestinations/${dest.id}/edit`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onDelete(dest)}
                  className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Delete destination"
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
