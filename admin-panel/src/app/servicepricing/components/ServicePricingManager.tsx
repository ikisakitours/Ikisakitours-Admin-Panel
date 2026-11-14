"use client";

import React, { useState, useEffect } from "react";
import {
  Car,
  Compass,
  Plane,
  Plus,
  Save,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  ActivePricingTab,
  CharterRatesConfig,
  CustomTourConfig,
  TransferPricingConfig,
  EMPTY_SERVICE_PRICING_CONFIG,
} from "../types/ServicePricing.types";
import {
  charterPricingService,
  ServicePricingAllData,
} from "@/services/servicepricing.service";
import CharterRatesForm from "./CharterServiceRatesForm";
import CustomTourForm from "./CustomTourForm";
import TransferRatesForm from "./TransferRatesForm";

export default function CharterPricingManager() {
  const [activeTab, setActiveTab] = useState<ActivePricingTab>("charter");

  // Dynamic language management (matches PackageFormWrapper & FaqForm)
  const [locale, setLocale] = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  // Pure React state for all configurations
  const [charterData, setCharterData] = useState<CharterRatesConfig>({ ...EMPTY_SERVICE_PRICING_CONFIG });
  const [customData, setCustomData] = useState<CustomTourConfig>({ ...EMPTY_SERVICE_PRICING_CONFIG });
  const [transferData, setTransferData] = useState<TransferPricingConfig>({ ...EMPTY_SERVICE_PRICING_CONFIG });

  // Loading & saving status
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  // Error alert state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Scan configurations to discover any newly added languages
  const discoverLanguages = (data: ServicePricingAllData) => {
    const discovered = new Set<string>(["en", "ja"]);
    const scan = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (!Array.isArray(obj)) {
        Object.keys(obj).forEach((k) => {
          if (typeof k === "string" && k.length <= 5) {
            discovered.add(k);
          }
        });
      }
    };

    Object.values(data.charter || {}).forEach(scan);
    Object.values(data.custom || {}).forEach(scan);
    Object.values(data.transfer || {}).forEach(scan);

    setAvailableLanguages(Array.from(discovered));
  };

  const loadPricingData = async () => {
    setLoading(true);
    try {
      const data = await charterPricingService.getAllPricing();
      if (data) {
        if (data.charter) setCharterData(data.charter);
        if (data.custom) setCustomData(data.custom);
        if (data.transfer) setTransferData(data.transfer);
        discoverLanguages(data);
      }
    } catch (err: any) {
      console.error("Failed to load charter pricing:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricingData();
  }, []);

  const addCustomLanguage = () => {
    const lang = prompt("Enter new language code (e.g. fr, de, es, zh):")
      ?.toLowerCase()
      .trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setLocale(lang);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const currentConfig =
        activeTab === "charter"
          ? charterData
          : activeTab === "custom"
            ? customData
            : transferData;

      await charterPricingService.savePricing(activeTab, currentConfig);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save pricing configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Charter, Custom &amp; Transfer Pricing
          </h1>
          <p className="text-xs text-slate-500 mt-1 w-full leading-relaxed">
            Manage Private Vehicle Charter rates, Tailor-made tour pricing, and Airport &amp; Intercity transfer notes across dynamic languages.
          </p>
        </div>

        {/* Actions placed below paragraph, aligned to the right */}
        <div className="flex items-center justify-end gap-2.5 w-full flex-wrap">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadPricingData}
            disabled={loading}
            className="flex items-center justify-center w-9 h-9 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            title="Reload from Server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Dynamic Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-xs flex-wrap">
            {availableLanguages.map((langKey) => (
              <button
                key={langKey}
                type="button"
                onClick={() => setLocale(langKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all uppercase cursor-pointer ${locale === langKey
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {langKey}
              </button>
            ))}
            <button
              type="button"
              onClick={addCustomLanguage}
              className="p-1.5 text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-0.5 font-semibold cursor-pointer rounded-lg hover:bg-slate-200 transition-all"
              title="Add new language code"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Error Alert Banner (only shown if an error occurs) ─────────── */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 text-[11px] font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Content Area with Loading Overlay ────────────────────────────── */}
      <div className="space-y-6 relative min-h-[400px]">

        {/* Loading overlay — exact same loader style as LegalDocManager */}
        {loading && (
          <div
            style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            className="absolute inset-0 bg-white/70 z-[999] rounded-2xl flex justify-center items-start pt-48"
          >
            <div className="sticky top-64 flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Loading pricing configuration...</span>
            </div>
          </div>
        )}

        {/* ── Multi-Section Switcher Tabs ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-0">
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
                type="submit"
                disabled={saving || loading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60 ${saved
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
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

          {/* Footer save reminder */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Remember to click <strong>Save Changes</strong> after editing.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
