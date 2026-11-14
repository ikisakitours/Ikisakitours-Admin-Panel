"use client";

import React from "react";
import { Plane, Sparkles } from "lucide-react";
import { TransferPricingConfig } from "../types/charterPricing.types";
import DynamicListManager from "./DynamicListManager";

interface Props {
  data: TransferPricingConfig;
  locale: string;
  onChange: (updated: TransferPricingConfig) => void;
}

export default function TransferRatesForm({ data, locale, onChange }: Props) {
  const langLabel = locale.toUpperCase();

  const updateTextField = (
    field: Exclude<keyof TransferPricingConfig, "notes">,
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
          <Plane className="w-4 h-4 text-indigo-500" />
          Transfer Header &amp; Subtitle Configuration ({langLabel})
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
              placeholder={`e.g. Airport & Intercity (${langLabel})`}
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
              placeholder={`e.g. Transfer Rates (${langLabel})`}
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
              placeholder={`e.g. Fixed-rate private transfers with flight tracking (${langLabel})`}
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
              placeholder={`Describe airport and intercity transfer services (${langLabel})…`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white resize-y focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Popular Badge / Highlight Box ─────────────────────── */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Transfer Highlight Box ({langLabel})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/40 p-4 rounded-xl border border-amber-200/60">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Highlight Badge Label ({langLabel})
            </label>
            <input
              type="text"
              value={data.popularBadge?.[locale] ?? ""}
              onChange={(e) => updateTextField("popularBadge", e.target.value)}
              placeholder={`e.g. Airport Pick-up Guarantee (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Highlight Box Title ({langLabel})
            </label>
            <input
              type="text"
              value={data.popularTitle?.[locale] ?? ""}
              onChange={(e) => updateTextField("popularTitle", e.target.value)}
              placeholder={`e.g. VIP Meet & Greet in Arrivals Hall (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Highlight Box Description ({langLabel})
            </label>
            <textarea
              rows={2}
              value={data.popularDesc?.[locale] ?? ""}
              onChange={(e) => updateTextField("popularDesc", e.target.value)}
              placeholder={`Highlight details e.g. terminal meet & greet, flight delay grace period (${langLabel})…`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white resize-y focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Dynamic Transfer Pricing Notes ─────────────────────── */}
      <DynamicListManager
        title="Transfer Pricing Notes"
        description="Add, edit, reorder, or remove individual transfer pricing notes displayed to guests."
        items={data.notes?.[locale] ?? []}
        locale={locale}
        placeholder="Enter transfer pricing note"
        addLabel="Add Pricing Note"
        accentColor="amber"
        onChange={updateNotes}
      />
    </div>
  );
}

