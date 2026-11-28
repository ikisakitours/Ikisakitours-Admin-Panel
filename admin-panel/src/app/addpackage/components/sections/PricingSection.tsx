"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Users,
  Plus,
  Trash2,
  Sparkles,
  Bed,
  Compass,
  RotateCcw,
  Info,
  Percent,
  Car,
} from "lucide-react";
import {
  PackageFormData,
  PricingConfig,
  GroupPricingTier,
  PackageOptionItem,
  PassengerCategoryPricing,
  ImportantPricingNote,
} from "../../types/package.types";
import { calculateLivePackagePrice } from "../../utils/pricingCalculator";

interface Props {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
  locale?: string;
}

const DEFAULT_STANDARD_TIERS: GroupPricingTier[] = [
  { minPax: 1, maxPax: 1, pricePerPerson: 100, label: "Solo Traveler (1 Person)" },
  { minPax: 2, maxPax: 2, pricePerPerson: 65, label: "Couple / Pair (2 Persons)" },
  { minPax: 3, maxPax: 4, pricePerPerson: 45, label: "Small Group (3-4 Persons)" },
  { minPax: 5, maxPax: 7, pricePerPerson: 35, label: "Medium Group (5-7 Persons)" },
  { minPax: 8, maxPax: 15, pricePerPerson: 30, label: "Large Group (8+ Persons)" },
];

export const DEFAULT_STANDARD_PRICING_NOTES: ImportantPricingNote[] = [
  {
    id: "note-1",
    title: {
      en: "DYNAMIC GROUP PRICING",
      ja: "ダイナミックグループ料金",
    },
    description: {
      en: "Rates per person decrease automatically as your party size increases to match vehicle capacity tiers.",
      ja: "参加人数が増えるにつれて、車両定員に合わせたグループ割引が自動的に適用され、1名あたりの料金がお得になります。",
    },
  },
  {
    id: "note-2",
    title: {
      en: "TRAVELER CATEGORIES",
      ja: "旅行者区分と料金",
    },
    description: {
      en: "Couple rates apply to 2 adults sharing a room. Child rates (with applicable discount) apply for ages 2–11. Infants under 2 travel free.",
      ja: "カップル料金は同室2名様に適用されます。子供料金（割引適用）は2〜11歳が対象です。2歳未満の幼児は無料です。",
    },
  },
  {
    id: "note-3",
    title: {
      en: "COMPREHENSIVE INCLUSIONS",
      ja: "充実のパッケージ内容",
    },
    description: {
      en: "Includes private AC luxury vehicle, dedicated chauffeur-guide, fuel, highway tolls, accommodations, and itinerary-specified meal plans.",
      ja: "専用エアコン完備の専用車、専属ドライバーガイド、燃料代、高速道路料金、宿泊費、日程表に記載されたお食事プランが含まれています。",
    },
  },
];

export function PricingSection({ formData, setFormData, locale = "en" }: Props) {
  // Safely extract from unified pricingConfig (with fallback to legacy fields or defaults)
  const tiers: GroupPricingTier[] =
    formData.pricingConfig?.tiers || formData.pricingTiers || DEFAULT_STANDARD_TIERS;
  const passengerPricing: PassengerCategoryPricing =
    formData.pricingConfig?.passengerPricing ||
    formData.passengerPricing || {
      couplePricingType: "auto_tier",
      coupleFixedPrice: 130,
      childRateType: "percentage",
      childRateValue: 50,
      infantPrice: 0,
    };
  const options: PackageOptionItem[] =
    formData.pricingConfig?.options || formData.options || [];

  const pricingNotes: ImportantPricingNote[] =
    formData.pricingConfig?.pricingNotes ||
    formData.pricingNotes ||
    DEFAULT_STANDARD_PRICING_NOTES;

  // Helper to update the unified pricingConfig object
  const updatePricingConfig = (newConfig: Partial<PricingConfig>) => {
    setFormData((prev) => {
      const currentConfig: PricingConfig = prev.pricingConfig || {
        tiers,
        passengerPricing,
        options,
        pricingNotes,
      };
      const mergedConfig: PricingConfig = {
        ...currentConfig,
        ...newConfig,
      };
      return {
        ...prev,
        pricingConfig: mergedConfig,
        pricingNotes: mergedConfig.pricingNotes,
        pricingTiers: mergedConfig.tiers,
        passengerPricing: mergedConfig.passengerPricing,
        options: mergedConfig.options,
      };
    });
  };

  // ── Handlers for Important Pricing Notes (Traveler Modal) ──
  const updatePricingNotes = (newNotes: ImportantPricingNote[]) => {
    updatePricingConfig({ pricingNotes: newNotes });
  };

  const handleNoteTitleChange = (index: number, val: string) => {
    const updated = [...pricingNotes];
    updated[index] = {
      ...updated[index],
      title: {
        ...(updated[index].title || {}),
        [locale]: val,
      },
    };
    updatePricingNotes(updated);
  };

  const handleNoteDescChange = (index: number, val: string) => {
    const updated = [...pricingNotes];
    updated[index] = {
      ...updated[index],
      description: {
        ...(updated[index].description || {}),
        [locale]: val,
      },
    };
    updatePricingNotes(updated);
  };

  const addPricingNote = () => {
    const newNote: ImportantPricingNote = {
      id: `note-${Date.now()}`,
      title: { [locale]: "" },
      description: { [locale]: "" },
    };
    updatePricingNotes([...pricingNotes, newNote]);
  };

  const removePricingNote = (index: number) => {
    const updated = pricingNotes.filter((_, i) => i !== index);
    updatePricingNotes(updated);
  };

  const resetStandardNotes = () => {
    if (confirm("Reset pricing notes back to Ikisaki standard defaults?")) {
      updatePricingNotes(DEFAULT_STANDARD_PRICING_NOTES);
    }
  };

  // Interactive Live Preview Simulation State (matching user booking widget: Adult, Couple, Child, Infant)
  const [testAdults, setTestAdults] = useState<number>(0);
  const [testCouples, setTestCouples] = useState<number>(0); // Default to 0 (matching Adult, Child, Infant)
  const [testChildren, setTestChildren] = useState<number>(0);
  const [testInfants, setTestInfants] = useState<number>(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  // ── Handlers for Base Price & Discount ──
  const handleBasePriceChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      price: val,
    }));
  };

  const handleDiscountChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      discount: val,
    }));
  };

  // ── Handlers for Group Tiers ──
  const updateTier = (index: number, updatedFields: Partial<GroupPricingTier>) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], ...updatedFields };
    updatePricingConfig({ tiers: updated });
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier ? lastTier.maxPax + 1 : 1;
    const newTier: GroupPricingTier = {
      minPax: newMin,
      maxPax: newMin + 2,
      pricePerPerson: lastTier ? Math.max(10, lastTier.pricePerPerson - 5) : 50,
      label: `${newMin}-${newMin + 2} Persons`,
    };
    updatePricingConfig({ tiers: [...tiers, newTier] });
  };

  const removeTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    updatePricingConfig({ tiers: updated });
  };

  const resetToStandardTiers = () => {
    if (confirm("Reset group discount tiers to standard 5-tier template?")) {
      updatePricingConfig({ tiers: DEFAULT_STANDARD_TIERS });
    }
  };

  // ── Handlers for Passenger Category Rules ──
  const updatePassengerPricing = (fields: Partial<PassengerCategoryPricing>) => {
    updatePricingConfig({
      passengerPricing: {
        ...passengerPricing,
        ...fields,
      },
    });
  };

  // ── Handlers for Tour Options & Add-ons (Room Supplement, Activities) ──
  const addOption = () => {
    const newOption: PackageOptionItem = {
      id: `opt_${Date.now()}`,
      name: { en: "", ja: "", [locale]: "" },
      price: 0,
      calculationType: "per_person",
      description: { en: "", ja: "", [locale]: "" },
    };
    updatePricingConfig({ options: [...options, newOption] });
  };

  const updateOption = (id: string, fields: Partial<PackageOptionItem>) => {
    const updated = options.map((opt) => (opt.id === id ? { ...opt, ...fields } : opt));
    updatePricingConfig({ options: updated });
  };

  const updateOptionName = (id: string, text: string) => {
    const updated = options.map((opt) => {
      if (opt.id !== id) return opt;
      const currentName =
        typeof opt.name === "object" && opt.name !== null ? opt.name : { en: String(opt.name || "") };
      return {
        ...opt,
        name: {
          ...currentName,
          [locale]: text,
        },
      };
    });
    updatePricingConfig({ options: updated });
  };

  const updateOptionDescription = (id: string, text: string) => {
    const updated = options.map((opt) => {
      if (opt.id !== id) return opt;
      const currentDesc =
        typeof opt.description === "object" && opt.description !== null
          ? opt.description
          : { en: String(opt.description || "") };
      return {
        ...opt,
        description: {
          ...currentDesc,
          [locale]: text,
        },
      };
    });
    updatePricingConfig({ options: updated });
  };

  const removeOption = (id: string) => {
    const updated = options.filter((opt) => opt.id !== id);
    updatePricingConfig({ options: updated });
  };

  // ── Live Calculation Logic for Preview (Modularized) ──
  const {
    effectiveAdults,
    totalTravelers,
    matchedTier,
    adultRate,
    twoPaxRate,
    twoPaxTotal,
    coupleRate,
    childRate,
    baseTotal,
    optionsTotal,
    grandTotal,
    breakdownSummary,
  } = calculateLivePackagePrice({
    tiers,
    passengerPricing,
    options,
    fallbackBasePrice: Number(formData.price) || 0,
    testAdults,
    testCouples,
    testChildren,
    testInfants,
    selectedOptionIds,
  });

  return (
    <div className="space-y-8 pt-6 border-t border-slate-200">
      {/* ── Section Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <DollarSign className="w-4 h-4" />
            </span>
            Package Pricing, Group Discounts &amp; Optional Add-ons
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic group discounts, traveler categories, and customizable add-ons matching industry standards.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BLOCK 0: IMPORTANT PRICING NOTES (POP-UP MODAL FOR TRAVELERS)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200/60">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                Important Pricing Notes
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 normal-case">
                  Active Tab: {locale.toUpperCase()}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                These notes display inside the &quot;Important Pricing Notes&quot; modal on the customer website to guide travelers on dynamic rates, group discounts, and booking policies.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={resetStandardNotes}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-all cursor-pointer shadow-2xs"
              title="Reset back to standard Ikisaki travel notes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={addPricingNote}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>
        </div>

        {/* Notes Items List */}
        <div className="space-y-3">
          {pricingNotes.map((note, idx) => (
            <div
              key={note.id || idx}
              className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-700 text-[10px] font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {note.title?.[locale] || note.title?.en || `Note #${idx + 1}`}
                  </span>
                </div>
                {pricingNotes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePricingNote(idx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Note Title ({locale.toUpperCase()}) *
                  </label>
                  <input
                    type="text"
                    required
                    value={note.title?.[locale] || ""}
                    onChange={(e) => handleNoteTitleChange(idx, e.target.value)}
                    placeholder={locale === "ja" ? "例: ダイナミックグループ料金" : "e.g. DYNAMIC GROUP PRICING"}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Note Description ({locale.toUpperCase()}) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={note.description?.[locale] || ""}
                    onChange={(e) => handleNoteDescChange(idx, e.target.value)}
                    placeholder={
                      locale === "ja"
                        ? "例: 参加人数が増えるにつれて、車両定員に合わせたグループ割引が自動的に適用されます。"
                        : "e.g. Rates per person decrease automatically as your party size increases to match vehicle capacity tiers."
                    }
                    className="w-full text-xs font-normal px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Tip underneath (Requested by user: "ytin note ekk dann podi note ekak pode title description dann pluwn trm kiyl") */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Admin Guidelines:</strong> Please keep note titles concise and descriptions limited to 1–2 short sentences. Short, clear guidelines ensure the modal on the customer booking page looks elegant and is comfortable for international guests to read on mobile and desktop devices. Remember to complete translations for both <strong>EN</strong> and <strong>JA</strong> tabs.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BLOCK 1: BASE STARTING PRICE & DISPLAY DISCOUNT
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Base Starting Price (Display Rate)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Shown as <strong className="text-indigo-600">From ${formData.price || "0"}</strong> on catalog cards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Starting Price Per Person ($) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                $
              </span>
              <input
                id="pkg_input_price"
                type="number"
                min="0"
                step="any"
                required
                value={formData.price}
                onChange={(e) => handleBasePriceChange(e.target.value)}
                placeholder="e.g. 150"
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Minimum per-person price (usually the lowest tier for large groups).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 items-center justify-between">
              <span>Display Discount (%)</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                <Percent className="w-3.5 h-3.5" />
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder="e.g. 10 (0 for no discount)"
                className="w-full text-xs font-semibold pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Shown as strike-through original price on package cards.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BLOCK 2: GROUP SIZE TIERED PRICING (GROUP DISCOUNT APPLIES)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                2. Group Discount Tiers (Per-Person Rates)
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 tracking-wide">
                  Group Discount Applies
                </span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetToStandardTiers}
              className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset to 5-tier standard template"
            >
              <RotateCcw className="w-3 h-3" /> Reset Template
            </button>
            <button
              type="button"
              onClick={addTier}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tier
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Price per person decreases as group size increases because fixed private vehicle &amp; chauffeur guide costs are shared across travelers.
        </p>

        {/* Tiers List / Table */}
        <div className="space-y-2 overflow-x-auto">
          <div className="min-w-125">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 bg-slate-50 rounded-lg">
              <div className="col-span-5">Tier Label</div>
              <div className="col-span-2 text-center">Min Pax</div>
              <div className="col-span-2 text-center">Max Pax</div>
              <div className="col-span-2 text-center">Per Person ($)</div>
              <div className="col-span-1 text-right pr-2">Action</div>
            </div>

            {/* Table Rows */}
            <div className="space-y-2 mt-2">
              {tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-3 items-center p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-all text-xs"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={tier.label || ""}
                      onChange={(e) => updateTier(idx, { label: e.target.value })}
                      placeholder="e.g. Couple (2 Persons)"
                      style={{ width: `${Math.max(16, (tier.label || "").length + 3)}ch` }}
                      className="text-xs font-semibold px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 max-w-full transition-all"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <input
                      type="number"
                      min="1"
                      value={tier.minPax}
                      onChange={(e) => updateTier(idx, { minPax: parseInt(e.target.value, 10) || 1 })}
                      className="w-14 text-xs font-bold text-center py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <input
                      type="number"
                      min={tier.minPax}
                      value={tier.maxPax}
                      onChange={(e) => updateTier(idx, { maxPax: parseInt(e.target.value, 10) || tier.minPax })}
                      className="w-14 text-xs font-bold text-center py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <div className="relative w-full max-w-30">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={tier.pricePerPerson}
                        onChange={(e) => updateTier(idx, { pricePerPerson: parseFloat(e.target.value) || 0 })}
                        className="w-full text-xs font-bold pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-indigo-700 bg-indigo-50/30 text-center"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center justify-end pr-2">
                    <button
                      type="button"
                      disabled={tiers.length <= 1}
                      onClick={() => removeTier(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove Tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BLOCK 3: PASSENGER CATEGORY PRICING (COUPLE, CHILD & INFANT RULES)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
            <Users className="w-3.5 h-3.5" />
          </span>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            3. Passenger Category Rules (Couple, Child &amp; Infant Pricing)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Couple (2 Adults) Rule */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Couple (2 Adults)</span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                2 Adults (1 Room)
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Pricing Method
                </label>
                <select
                  value={passengerPricing.couplePricingType || "auto_tier"}
                  onChange={(e) =>
                    updatePassengerPricing({
                      couplePricingType: e.target.value as "auto_tier" | "fixed",
                    })
                  }
                  className="w-full text-xs font-semibold p-2 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer"
                >
                  <option value="auto_tier">Auto (2 × 2-Pax Tier Rate)</option>
                  <option value="fixed">Custom Fixed Couple Rate ($)</option>
                </select>
              </div>

              {passengerPricing.couplePricingType === "fixed" && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    Fixed Couple Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={passengerPricing.coupleFixedPrice || 0}
                      onChange={(e) =>
                        updatePassengerPricing({
                          coupleFixedPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g. 130"
                      className="w-full text-xs font-bold pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-lg outline-none text-indigo-700"
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400">
              {passengerPricing.couplePricingType === "fixed"
                ? `Couples pay a fixed total of $${passengerPricing.coupleFixedPrice || 0} (instead of standard tier $${twoPaxRate} × 2 = $${twoPaxTotal}).`
                : `Automatically charges 2 × 2-Person Tier rate ($${twoPaxRate} × 2 = $${twoPaxTotal}).`}
            </p>
          </div>

          {/* Child Pricing Rule */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Child (Age 2-12)</span>
              <span className="text-[10px] text-slate-500">Covers seat &amp; meals</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Calculation Basis
                </label>
                <select
                  value={passengerPricing.childRateType}
                  onChange={(e) =>
                    updatePassengerPricing({
                      childRateType: e.target.value as "percentage" | "fixed",
                    })
                  }
                  className="w-full text-xs font-semibold p-2 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer"
                >
                  <option value="percentage">% of Adult Rate</option>
                  <option value="fixed">Fixed Price ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  {passengerPricing.childRateType === "percentage" ? "Percentage (%)" : "Fixed Amount ($)"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={passengerPricing.childRateValue}
                  onChange={(e) =>
                    updatePassengerPricing({
                      childRateValue: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder={passengerPricing.childRateType === "percentage" ? "50" : "25"}
                  className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              {passengerPricing.childRateType === "percentage"
                ? `Child pays ${passengerPricing.childRateValue}% of the active adult tier rate.`
                : `Child pays a flat fee of $${passengerPricing.childRateValue} regardless of group tier.`}
            </p>
          </div>

          {/* Infant Pricing Rule */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Infant (Under 2)</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Usually Free ($0)
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Infant Fee ($)
              </label>
              <input
                type="number"
                min="0"
                value={passengerPricing.infantPrice}
                onChange={(e) =>
                  updatePassengerPricing({
                    infantPrice: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-lg outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                Set to 0 for free infant travel. Charge only if baby car seat rental or infant gear is required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BLOCK 4: CUSTOM TOUR ADD-ONS & OPTIONS (ROOM SUPPLEMENT, ACTIVITIES)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
              <Compass className="w-3.5 h-3.5" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                4. Tour Add-ons &amp; Supplements (Optional Extras)
                <span className="text-[10px] font-bold text-slate-400">
                  ({options.length} configured)
                </span>
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Tour Option
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Allow clients to customize their booking with extras such as Single Room Supplements, Gregory Lake Boat Rides, Elephant Experiences, or Safari upgrades.
        </p>

        {/* Pricing Type Guide Cards (Clean, Professional 3-Column Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: Per Person */}
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-emerald-300 transition-all shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-100/70 text-emerald-700 border border-emerald-200">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-800">Per Person</span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                × Travelers
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Multiplied by the number of travelers (e.g. Boat Ride, Elephant Safari, Entry Tickets).
            </p>
          </div>

          {/* Card 2: Per Room */}
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-indigo-300 transition-all shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-100/70 text-indigo-700 border border-indigo-200">
                  <Bed className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-800">Per Room</span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                Flat Fee
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Fixed rate per room regardless of group size (e.g. Single Room Supplement, Extra Bed).
            </p>
          </div>

          {/* Card 3: Per Booking */}
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-purple-300 transition-all shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-purple-100/70 text-purple-700 border border-purple-200">
                  <Car className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-800">Per Booking</span>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                One-Time
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              One-time fixed charge for the entire trip (e.g. VIP Airport Van Upgrade, Photography).
            </p>
          </div>
        </div>

        {options.length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50 space-y-2">
            <Bed className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">No optional add-ons configured yet.</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Click &quot;Add New Tour Option&quot; above to create extras like Single Room Supplement or Activity Upgrades.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((opt) => {
              const optName =
                typeof opt.name === "object" && opt.name !== null
                  ? opt.name[locale] || ""
                  : locale === "en"
                  ? String(opt.name || "")
                  : "";
              const optDesc =
                typeof opt.description === "object" && opt.description !== null
                  ? opt.description[locale] || ""
                  : locale === "en"
                  ? String(opt.description || "")
                  : "";

              return (
                <div
                  key={opt.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-indigo-200 transition-all space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    {/* Option Title */}
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Option Name ({locale.toUpperCase()}) *
                      </label>
                      <input
                        type="text"
                        value={optName}
                        onChange={(e) => updateOptionName(opt.id, e.target.value)}
                        placeholder="e.g. Single room supplement / Gregory Lake boat ride"
                        className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Price */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Extra Price ($) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={opt.price}
                          onChange={(e) => updateOption(opt.id, { price: parseFloat(e.target.value) || 0 })}
                          placeholder="e.g. 50"
                          className="w-full text-xs font-bold pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-indigo-700"
                        />
                      </div>
                    </div>

                    {/* Calculation Type */}
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Pricing Type
                      </label>
                      <select
                        value={opt.calculationType}
                        onChange={(e) =>
                          updateOption(opt.id, {
                            calculationType: e.target.value as "per_person" | "per_room" | "per_booking",
                          })
                        }
                        className="w-full text-xs font-semibold px-2 py-2 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer"
                      >
                        <option value="per_person">Per Person (x pax)</option>
                        <option value="per_room">Per Room (Flat)</option>
                        <option value="per_booking">Per Booking (Flat)</option>
                      </select>
                    </div>

                    {/* Delete Option */}
                    <div className="sm:col-span-1 flex items-center justify-end sm:pt-6">
                      <button
                        type="button"
                        onClick={() => removeOption(opt.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Delete this option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description / Detail */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Option Details / Description ({locale.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={optDesc}
                      onChange={(e) => updateOptionDescription(opt.id, e.target.value)}
                      placeholder="e.g. Private single room accommodation or 30-minute boat ride with life jackets"
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-slate-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BLOCK 5: LIVE BOOKING SIMULATOR (ADMIN PREVIEW TOOL)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-600 text-white shadow-2xs">
              <Info className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Live Price Simulator (Instant Verification)
            </h4>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-full border border-indigo-200">
            {effectiveAdults === 0
              ? `Starting Tier: ${matchedTier.label || `${matchedTier.minPax}-${matchedTier.maxPax} Pax`} ($${matchedTier.pricePerPerson}/adult)`
              : `Active Tier: ${matchedTier.label || `${matchedTier.minPax}-${matchedTier.maxPax} Pax`} ($${matchedTier.pricePerPerson}/adult)`}
          </span>
        </div>

        {/* Simulator Controls (matching frontend widget: Adults, Couple, Child, Infant) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Adult (Single):</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTestAdults(Math.max(0, testAdults - 1))}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-slate-900 w-4 text-center">
                {testAdults}
              </span>
              <button
                type="button"
                onClick={() => setTestAdults(testAdults + 1)}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">Couple:</span>
              <span className="text-[9px] text-indigo-500 font-medium">2 Adults</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTestCouples(Math.max(0, testCouples - 1))}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-slate-900 w-4 text-center">
                {testCouples}
              </span>
              <button
                type="button"
                onClick={() => setTestCouples(testCouples + 1)}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Child (2-12):</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTestChildren(Math.max(0, testChildren - 1))}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-slate-900 w-4 text-center">
                {testChildren}
              </span>
              <button
                type="button"
                onClick={() => setTestChildren(testChildren + 1)}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Infant (&lt;2):</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTestInfants(Math.max(0, testInfants - 1))}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-slate-900 w-4 text-center">
                {testInfants}
              </span>
              <button
                type="button"
                onClick={() => setTestInfants(testInfants + 1)}
                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Simulator Options Checkboxes */}
        {options.length > 0 && (
          <div className="pt-2 border-t border-indigo-100/60">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block mb-2">
              Test Add-on Selections:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {options.map((opt) => {
                const isChecked = selectedOptionIds.includes(opt.id);
                const optName = typeof opt.name === "object" ? opt.name[locale] || opt.name["en"] || "Option" : String(opt.name);
                return (
                  <label
                    key={opt.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      isChecked
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOptionIds((prev) => [...prev, opt.id]);
                        } else {
                          setSelectedOptionIds((prev) => prev.filter((id) => id !== opt.id));
                        }
                      }}
                      className="hidden"
                    />
                    <span>{optName}</span>
                    <span className={isChecked ? "text-indigo-200" : "text-slate-400"}>
                      (+${opt.price})
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Calculation Result Summary Bar */}
        <div className="p-3.5 bg-white rounded-xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="text-xs text-slate-600 space-y-0.5">
            <div>
              <strong>Base ({breakdownSummary}) = </strong>
              <span className="font-mono font-bold text-slate-900">${baseTotal.toFixed(2)}</span>
            </div>
            {optionsTotal > 0 && (
              <div className="text-[11px] text-purple-700">
                + Selected Add-ons: <span className="font-mono font-bold">${optionsTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="text-right flex items-center gap-3 sm:justify-end">
            <span className="text-xs font-bold text-slate-500 uppercase">Estimated Total:</span>
            <span className="text-xl font-extrabold text-indigo-700 font-mono tracking-tight">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
