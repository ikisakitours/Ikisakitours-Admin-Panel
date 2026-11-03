"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, X, ArrowUp, ArrowDown, Flag, Compass } from "lucide-react";
import { destinationService } from "@/services/destination.service";
import { DestinationSnapshot } from "../../types/package.types";

interface DestinationPreview {
  id: string;
  titleEn?: string;
  titleJa?: string;
  title?: Record<string, string> | string;
  slug: string;
  summaryEn?: string;
  summaryJa?: string;
  summary?: Record<string, string> | string;
  heroImage: string | null;
}

interface Props {
  selectedDestinations: DestinationSnapshot[];
  onChange: (destinations: DestinationSnapshot[]) => void;
  locale?: string;
}

export function PackageDestinationPicker({
  selectedDestinations,
  onChange,
  locale = "en",
}: Props) {
  const [allPreviews, setAllPreviews] = useState<DestinationPreview[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    destinationService
      .getPreviews()
      .then((data) => setAllPreviews(data as any))
      .catch((err) => console.error("Failed to load destination previews", err));
  }, []);

  // Safe helper to extract localized string from string or Record<string, string>
  const resolveLocalized = (val?: Record<string, string> | string): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[locale] || val["en"] || Object.values(val)[0] || "";
  };

  const getLocalizedTitle = (dest: DestinationPreview) => {
    if (dest.title) return resolveLocalized(dest.title);
    const enTitle = dest.titleEn || "";
    const jaTitle = dest.titleJa || "";
    return locale === "ja" ? jaTitle || enTitle : enTitle;
  };

  const getLocalizedSummary = (dest: DestinationPreview) => {
    if (dest.summary) return resolveLocalized(dest.summary);
    const enSummary = dest.summaryEn || "";
    const jaSummary = dest.summaryJa || "";
    return locale === "ja" ? jaSummary || enSummary : enSummary;
  };

  // Filter available previews matching the query (allows duplicates by NOT excluding selected ones)
  const filteredDestinations = allPreviews.filter((dest) => {
    const title = getLocalizedTitle(dest);
    const safeTitle = title ? title.toLowerCase() : "";
    const safeQuery = query ? query.toLowerCase() : "";
    return safeTitle.includes(safeQuery);
  });

  const getPreview = (id: string) => allPreviews.find((p) => p.id === id);

  const addDestination = (dest: DestinationPreview) => {
    // Build Record<string, string> objects for title and summary to satisfy backend validation
    const titleObj =
      typeof dest.title === "object" && dest.title !== null
        ? dest.title
        : { en: dest.titleEn || (typeof dest.title === "string" ? dest.title : ""), ja: dest.titleJa || "" };

    const summaryObj =
      typeof dest.summary === "object" && dest.summary !== null
        ? dest.summary
        : { en: dest.summaryEn || (typeof dest.summary === "string" ? dest.summary : ""), ja: dest.summaryJa || "" };

    onChange([
      ...selectedDestinations,
      {
        id: dest.id,
        slug: dest.slug,
        title: titleObj,
        summary: summaryObj,
      },
    ]);
    setQuery("");
    setIsOpen(false);
  };

  const removeDestinationAtIndex = (index: number) => {
    onChange(selectedDestinations.filter((_, idx) => idx !== index));
  };

  const moveDestination = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedDestinations.length) return;

    const updated = [...selectedDestinations];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    onChange(updated);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" /> Route Destinations Sequence ({locale.toUpperCase()})
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          Total Stops: {selectedDestinations.length}
        </span>
      </div>

      {/* Route Flow Timeline / Sequence List */}
      {selectedDestinations.length > 0 ? (
        <div className="space-y-2">
          {selectedDestinations.map((dest, idx) => {
            const preview = getPreview(dest.id);
            const displayTitle = preview ? getLocalizedTitle(preview) : dest.slug;
            const displaySummary = preview ? getLocalizedSummary(preview) : "";

            const isStart = idx === 0;
            const isEnd = idx === selectedDestinations.length - 1 && selectedDestinations.length > 1;

            return (
              <div
                key={`${dest.id}-${idx}`}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isStart
                    ? "bg-emerald-50/70 border-emerald-200"
                    : isEnd
                    ? "bg-indigo-50/70 border-indigo-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Sequence Badge / Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isStart
                        ? "bg-emerald-600 text-white"
                        : isEnd
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isStart ? (
                      <Flag className="w-3.5 h-3.5" />
                    ) : isEnd ? (
                      <Compass className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Hero Thumbnail */}
                  {preview?.heroImage ? (
                    <img
                      src={preview.heroImage}
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200/50"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                      {displayTitle ? displayTitle.charAt(0) : "?"}
                    </div>
                  )}

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {displayTitle}
                      </p>
                      {isStart && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase">
                          Start
                        </span>
                      )}
                      {isEnd && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
                          End
                        </span>
                      )}
                    </div>
                    {displaySummary && (
                      <p className="text-[11px] text-slate-500 truncate">
                        {displaySummary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ordering and Removal Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveDestination(idx, "up")}
                    className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                    title="Move Stop Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === selectedDestinations.length - 1}
                    onClick={() => moveDestination(idx, "down")}
                    className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                    title="Move Stop Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDestinationAtIndex(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                    title="Remove Stop"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
          No route stops added yet. Search below to add your starting destination.
        </div>
      )}

      {/* Search Dropdown Trigger / Input */}
      <div className="relative">
        <input
          type="text"
          placeholder={`Search & append stop to route (${locale.toUpperCase()})...`}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
        />

        {isOpen && filteredDestinations.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => addDestination(dest)}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 cursor-pointer text-xs border-b border-slate-50 last:border-none"
              >
                <span className="font-semibold text-slate-700">
                  {getLocalizedTitle(dest)}
                </span>
                <span className="flex items-center gap-1 text-indigo-600 font-medium text-[11px]">
                  <Plus className="w-3 h-3" /> Append Stop
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}