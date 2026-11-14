"use client";

import React, { useState } from "react";
import {
  Car,
  Compass,
  Plane,
  Plus,
  Save,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  ActivePricingTab,
  CharterRatesConfig,
  CustomTourConfig,
  TransferPricingConfig,
} from "../types/charterPricing.types";
import {
  INITIAL_CHARTER_RATES,
  INITIAL_CUSTOM_TOUR,
  INITIAL_TRANSFER_RATES,
} from "../data/mockData";
import CharterRatesForm from "./CharterRatesForm";
import CustomTourForm from "./CustomTourForm";
import TransferRatesForm from "./TransferRatesForm";

export default function CharterPricingManager() {
  const [activeTab, setActiveTab] = useState<ActivePricingTab>("charter");

  // Dynamic language management (matches PackageFormWrapper & FaqForm)
  const [locale, setLocale] = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  // Pure React state for all configurations
  const [charterData, setCharterData] = useState<CharterRatesConfig>(INITIAL_CHARTER_RATES);
  const [customData, setCustomData] = useState<CustomTourConfig>(INITIAL_CUSTOM_TOUR);
  const [transferData, setTransferData] = useState<TransferPricingConfig>(INITIAL_TRANSFER_RATES);

  // Save toast / feedback state
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const addCustomLanguage = () => {
    const lang = prompt("Enter new language code (e.g. fr, de, es, zh):")
      ?.toLowerCase()
      .trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setLocale(lang);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const label =
      activeTab === "charter"
        ? "Charter Service Price Note"
        : activeTab === "custom"
          ? "Custom Made Tour Service Price Note"
          : "Transfer Service Price Note";
    setSavedToast(`${label} (${locale.toUpperCase()}) configuration updated!`);
    setTimeout(() => setSavedToast(null), 3500);
  };

  const handleResetCurrent = () => {
    if (!confirm("Reset the current section back to initial mock defaults?")) return;
    if (activeTab === "charter") {
      setCharterData(INITIAL_CHARTER_RATES);
    } else if (activeTab === "custom") {
      setCustomData(INITIAL_CUSTOM_TOUR);
    } else {
      setTransferData(INITIAL_TRANSFER_RATES);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Charter, Custom &amp; Transfer Pricing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage Private Vehicle Charter rates, Tailor-made tour pricing, and Airport &amp; Intercity transfer notes across dynamic languages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dynamic Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
            {availableLanguages.map((langKey) => (
              <button
                key={langKey}
                type="button"
                onClick={() => setLocale(langKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase cursor-pointer ${locale === langKey
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {langKey}
              </button>
            ))}
            <button
              type="button"
              onClick={addCustomLanguage}
              className="p-1.5 text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-0.5 font-semibold cursor-pointer"
              title="Add new language code"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Success Toast Banner ─────────────────────────────────────────── */}
      {savedToast && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedToast(null)}
            className="text-emerald-600 hover:text-emerald-800 text-[11px] font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Multi-Section Switcher Tabs ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("charter")}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${activeTab === "charter"
              ? "bg-white border-indigo-500 ring-2 ring-indigo-100 shadow-sm"
              : "bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300"
            }`}
        >
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${activeTab === "charter"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500"
              }`}
          >
            <Car className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-900 truncate">
              01) Charter Service Price Note
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${activeTab === "custom"
              ? "bg-white border-indigo-500 ring-2 ring-indigo-100 shadow-sm"
              : "bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300"
            }`}
        >
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${activeTab === "custom"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500"
              }`}
          >
            <Compass className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-900 truncate">
              02) Custom Made Tour Service Price Note
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transfer")}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${activeTab === "transfer"
              ? "bg-white border-indigo-500 ring-2 ring-indigo-100 shadow-sm"
              : "bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300"
            }`}
        >
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${activeTab === "transfer"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500"
              }`}
          >
            <Plane className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-900 truncate">
              03) Transfer Service Price Note
            </p>
          </div>
        </button>
      </div>

      {/* ── Main Content: Editor Form ────────────────────────────────────── */}
      <form
        onSubmit={handleSave}
        className="w-full space-y-6 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs"
      >
        {/* Card Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {activeTab === "charter"
                ? "Charter Service Price Note"
                : activeTab === "custom"
                  ? "Custom Made Tour Service Price Note"
                  : "Transfer Service Price Note"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Editing in <span className="font-bold text-indigo-600 uppercase">{locale}</span> — switch or add languages using the selector above.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetCurrent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> Update Configuration
            </button>
          </div>
        </div>

        {activeTab === "charter" ? (
          <CharterRatesForm
            data={charterData}
            locale={locale}
            onChange={setCharterData}
          />
        ) : activeTab === "custom" ? (
          <CustomTourForm
            data={customData}
            locale={locale}
            onChange={setCustomData}
          />
        ) : (
          <TransferRatesForm
            data={transferData}
            locale={locale}
            onChange={setTransferData}
          />
        )}

        {/* Bottom Action Bar */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

