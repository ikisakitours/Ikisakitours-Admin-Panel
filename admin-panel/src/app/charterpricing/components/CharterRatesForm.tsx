"use client";

import React from "react";
import { Car, Sparkles } from "lucide-react";
import { CharterRatesConfig } from "../types/charterPricing.types";
import DynamicListManager from "./DynamicListManager";

interface Props {
  data: CharterRatesConfig;
  locale: string;
  onChange: (updated: CharterRatesConfig) => void;
}

export default function CharterRatesForm({ data, locale, onChange }: Props) {
  const langLabel = locale.toUpperCase();

  const updateTextField = (
    field: Exclude<keyof CharterRatesConfig, "notes">,
    value: string
  ) => {
    onChange({
      ...data,
      [field]: {
        ...(data[field] ?? {}),
        [locale]: value,
      },
    });
  };

  const updateNotes = (updatedNotes: string[]) => {
    onChange({
      ...data,
      notes: {
        ...(data.notes ?? {}),
        [locale]: updatedNotes,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1: Titles & Subtitles ────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Car className="w-4 h-4 text-indigo-500" />
          Header &amp; Subtitle Configuration ({langLabel})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Title Base ({langLabel})
            </label>
            <input
              type="text"
              value={data.titleBase?.[locale] ?? ""}
              onChange={(e) => updateTextField("titleBase", e.target.value)}
              placeholder={`e.g. Private Vehicle (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Title Accent ({langLabel})
            </label>
            <input
              type="text"
              value={data.titleAccent?.[locale] ?? ""}
              onChange={(e) => updateTextField("titleAccent", e.target.value)}
              placeholder={`e.g. Charter Rates (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Subtitle Strong / Lead ({langLabel})
            </label>
            <input
              type="text"
              value={data.subtitleStrong?.[locale] ?? ""}
              onChange={(e) => updateTextField("subtitleStrong", e.target.value)}
              placeholder={`e.g. Transparent daily & transfer pricing (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Subtitle Description ({langLabel})
            </label>
            <textarea
              rows={2}
              value={data.subtitle?.[locale] ?? ""}
              onChange={(e) => updateTextField("subtitle", e.target.value)}
              placeholder={`Describe what is included in charter rates (${langLabel})…`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white resize-y focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Popular Badge Box ─────────────────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Popular Highlight Box ({langLabel})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/40 p-4 rounded-xl border border-amber-200/60">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Popular Badge Label ({langLabel})
            </label>
            <input
              type="text"
              value={data.popularBadge?.[locale] ?? ""}
              onChange={(e) => updateTextField("popularBadge", e.target.value)}
              placeholder={`e.g. Most Popular Choice (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Popular Box Title ({langLabel})
            </label>
            <input
              type="text"
              value={data.popularTitle?.[locale] ?? ""}
              onChange={(e) => updateTextField("popularTitle", e.target.value)}
              placeholder={`e.g. Chauffeur + Licensed Tour Guide (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Popular Box Description ({langLabel})
            </label>
            <textarea
              rows={2}
              value={data.popularDesc?.[locale] ?? ""}
              onChange={(e) => updateTextField("popularDesc", e.target.value)}
              placeholder={`Short highlight description (${langLabel})…`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white resize-y focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Dynamic Charter Pricing Notes ─────────────────────── */}
      <DynamicListManager
        title="Charter Pricing Notes"
        description="Add, edit, reorder, or remove individual charter rate notes displayed to guests."
        items={data.notes?.[locale] ?? []}
        locale={locale}
        placeholder="Enter charter pricing note"
        addLabel="Add Pricing Note"
        accentColor="amber"
        onChange={updateNotes}
      />
    </div>
  );
}

