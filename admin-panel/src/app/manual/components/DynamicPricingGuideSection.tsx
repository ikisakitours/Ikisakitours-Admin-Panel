"use client";

import React from "react";
import { AlertTriangle, Car, Lightbulb } from "lucide-react";
import {
  ADDON_TYPES_GUIDE,
  PASSENGER_RULES_GUIDE,
  VEHICLE_TIER_GUIDE,
} from "../data/manualMockData";
import { SectionCard } from "./SectionCard";

export function DynamicPricingGuideSection() {
  return (
    <SectionCard
      id="pricing"
      number="05"
      title="Dynamic Group Pricing Tiers, Passenger Rules & Add-Ons"
      subtitle="Sri Lanka private tour pricing structured around vehicle capacity, room sharing, and customizable extras."
      icon="dollar"
    >
      <div className="space-y-6">
        {/* Vehicle Capacity Table */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-600" /> Industry-Standard Group Discount Tiers
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-600">
                  <th className="py-2.5 px-3 font-extrabold">Tier Label</th>
                  <th className="py-2.5 px-3 font-extrabold text-center">Min</th>
                  <th className="py-2.5 px-3 font-extrabold text-center">Max</th>
                  <th className="py-2.5 px-3 font-extrabold">Sri Lanka Vehicle Class</th>
                  <th className="py-2.5 px-3 font-extrabold">Cost Economics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {VEHICLE_TIER_GUIDE.map((row) => (
                  <tr key={row.tier} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">{row.tier}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">{row.min}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700">{row.max}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{row.vehicle}</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Gaps Warning */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-rose-900">
              Golden Rule: Zero Gaps &amp; Zero Overlaps Between Tiers
            </p>
            <p className="text-xs text-rose-800/90 leading-relaxed">
              Every row&apos;s <strong>Min Pax</strong> must equal the previous row&apos;s{" "}
              <strong>Max Pax + 1</strong> (e.g., <code>8–15</code> → <code>16–30</code>). Clicking{" "}
              <strong>+ Add Tier</strong> auto-fills a +3 placeholder range so there is never a gap — feel free to
              adjust <code>Max Pax</code> and <code>Tier Label</code>. Calculations strictly use{" "}
              <code>Min Pax</code>, <code>Max Pax</code>, and <code>Per-Person ($)</code>.
            </p>
          </div>
        </div>

        {/* Passenger Category Rules */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
            Passenger Category Rules
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PASSENGER_RULES_GUIDE.map((rule) => (
              <div
                key={rule.title}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-slate-900">{rule.title}</p>
                </div>
                <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {rule.badge}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tour Add-Ons */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
            Tour Add-Ons &amp; Supplements (Booking Review Modal)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ADDON_TYPES_GUIDE.map((addon) => (
              <div
                key={addon.code}
                className={`rounded-xl border p-3.5 space-y-1.5 ${addon.styleClass}`}
              >
                <span
                  className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${addon.badgeClass}`}
                >
                  {addon.code}
                </span>
                <p className="text-xs font-bold text-slate-900">{addon.title}</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">{addon.behavior}</p>
                <p className="text-[10px] text-slate-500 pt-1">
                  <strong>Examples:</strong> {addon.examples}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tip */}
        <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-3.5 flex items-start gap-2.5 text-xs text-indigo-950">
          <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            <strong>Pro Tip:</strong> Always test your tier brackets and optional extras using the{" "}
            <strong>Live Pricing Preview Simulator</strong> at the bottom of the Pricing section before clicking Save.
          </span>
        </div>
      </div>
    </SectionCard>
  );
}
