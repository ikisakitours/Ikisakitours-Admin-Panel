"use client";

import React from "react";
import { Compass } from "lucide-react";
import { CustomTourConfig } from "../types/charterPricing.types";
import DynamicListManager from "./DynamicListManager";

interface Props {
  data: CustomTourConfig;
  locale: string;
  onChange: (updated: CustomTourConfig) => void;
}

export default function CustomTourForm({ data, locale, onChange }: Props) {
  const langLabel = locale.toUpperCase();

  const updateTextField = (
    field: Exclude<keyof CustomTourConfig, "inclusions" | "exclusions" | "pricingNotes">,
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

  const updateListField = (
    field: "inclusions" | "exclusions" | "pricingNotes",
    items: string[]
  ) => {
    onChange({
      ...data,
      [field]: {
        ...(data[field] ?? {}),
        [locale]: items,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1: Titles & Descriptions ─────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-500" />
          Tailor-Made Tour Header &amp; Overview ({langLabel})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Title Base ({langLabel})
            </label>
            <input
              type="text"
              value={data.titleBase?.[locale] ?? ""}
              onChange={(e) => updateTextField("titleBase", e.target.value)}
              placeholder={`e.g. Custom-Made (${langLabel})`}
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
              placeholder={`e.g. Bespoke Journeys (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Badge Label ({langLabel})
            </label>
            <input
              type="text"
              value={data.badgeText?.[locale] ?? ""}
              onChange={(e) => updateTextField("badgeText", e.target.value)}
              placeholder={`e.g. 100% Tailor-Made Itinerary (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Subtitle ({langLabel})
            </label>
            <input
              type="text"
              value={data.subtitle?.[locale] ?? ""}
              onChange={(e) => updateTextField("subtitle", e.target.value)}
              placeholder={`Short lead subtitle (${langLabel})…`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Detailed Description ({langLabel})
            </label>
            <textarea
              rows={3}
              value={data.description?.[locale] ?? ""}
              onChange={(e) => updateTextField("description", e.target.value)}
              placeholder={`Explain how tailor-made tours work (${langLabel})…`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white resize-y focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Dynamic Custom Tour Pricing Notes ─────────────────── */}
      <DynamicListManager
        title="Custom Tour Pricing Notes"
        description="Add, edit, reorder, or remove individual custom tour pricing notes displayed to guests."
        items={data.pricingNotes?.[locale] ?? []}
        locale={locale}
        placeholder="Enter custom tour pricing note"
        addLabel="Add Pricing Note"
        accentColor="amber"
        onChange={(items) => updateListField("pricingNotes", items)}
      />
    </div>
  );
}

