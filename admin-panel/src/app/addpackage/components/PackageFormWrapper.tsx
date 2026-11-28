"use client";

import { useState, useCallback } from "react";
import { packageService } from "@/services/package.service";
import { PackageFormData } from "../types/package.types";
import { JsonUploaderSection } from "./sections/JsonUploaderSection";
import { BasicOverviewSection } from "./sections/BasicOverviewSection";
import { PricingSection, DEFAULT_STANDARD_PRICING_NOTES } from "./sections/PricingSection";
import { GallerySection } from "./sections/GallerySection";
import { PackageDestinationPicker } from "./sections/PackageDestinationPicker";
import { ActivitiesSection } from "./sections/ActivitiesSection";
import { ItinerarySection } from "./sections/ItinerarySection";
import { HighlightsAndExtras } from "./sections/HighlightsAndExtras";
import { Save, Layers, Plus } from "lucide-react";
import { useFormDraft } from "@/hooks/useFormDraft";
import { DraftRecoveryBanner } from "@/components/DraftRecoveryBanner";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";
import { formatBackendErrorMessage } from "@/utils/errorHelper";
import FormReadinessDrawer, { FormReadinessItem } from "@/components/FormReadinessDrawer";

const INITIAL_FORM_STATE: PackageFormData = {
  type: "multiday",
  category: { en: "", ja: "" },
  origin: { en: "", ja: "" },
  duration: { en: "", ja: "" },
  badge: "new_arrival",
  slug: "",
  price: "",
  discount: "0",
  provider: "",
  destinations: [],

  // ── Unified Dynamic Group Pricing & Custom Add-ons Configuration (Single JSONB Object) ──
  pricingConfig: {
    tiers: [
      { minPax: 1, maxPax: 1, pricePerPerson: 100, label: "Solo (1 Person)" },
      { minPax: 2, maxPax: 2, pricePerPerson: 65, label: "Couple (2 Persons)" },
      { minPax: 3, maxPax: 4, pricePerPerson: 45, label: "Small Group (3-4 Persons)" },
      { minPax: 5, maxPax: 7, pricePerPerson: 35, label: "Medium Group (5-7 Persons)" },
      { minPax: 8, maxPax: 15, pricePerPerson: 30, label: "Large Group (8+ Persons)" },
    ],
    passengerPricing: {
      couplePricingType: "auto_tier",
      coupleFixedPrice: 130,
      childRateType: "percentage",
      childRateValue: 50,
      infantPrice: 0,
    },
    options: [],
    pricingNotes: DEFAULT_STANDARD_PRICING_NOTES,
  },
  pricingNotes: DEFAULT_STANDARD_PRICING_NOTES,

  // Multilingual JSONB Text Fields (Records)
  title: { en: "", ja: "" },
  titleEmphasis: { en: "", ja: "" },
  leadTitle: { en: "", ja: "" },
  leadDescription: { en: "", ja: "" },
  description: { en: "", ja: "" },

  // Multilingual JSONB Array Fields (Records of string arrays)
  highlights: { en: [""], ja: [""] },
  includes: { en: [""], ja: [""] },
  excludes: { en: [""], ja: [""] },

  // Nested JSONB Structures
  activityDetails: [
    {
      title: { en: "", ja: "" },
      description: { en: "", ja: "" },
    },
  ],

  itinerary: [
    {
      day: 1,
      travelTime: { en: "", ja: "" },
      title: { en: "", ja: "" },
      locations: { en: [""], ja: [""] },
      route: { en: [""], ja: [""] },
      details: { en: [""], ja: [""] },
      scenicStops: { en: [""], ja: [""] },
      activities: { en: [""], ja: [""] },
      meals: { en: "", ja: "" },
      accommodation: { en: "", ja: "" },
    },
  ],
};

export default function PackageFormWrapper() {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Toast Notification System
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  // Dynamic language management
  const [locale, setLocale] = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  const [formData, setFormData] = useState<PackageFormData>(INITIAL_FORM_STATE);

  // Industry-Standard Auto-Save & Crash-Resilient Draft Engine
  const draft = useFormDraft<PackageFormData>({
    storageKey: "ikisaki_draft_package_new",
    formData,
    setFormData: (restored) => {
      const langs = new Set<string>(["en", "ja"]);
      const scan = (obj: any) => {
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          Object.keys(obj).forEach((k) => {
            if (k.length <= 5) langs.add(k);
          });
        }
      };
      scan(restored.title);
      scan(restored.description);
      scan(restored.leadTitle);
      setAvailableLanguages(Array.from(langs));
      setFormData(restored);
    },
  });

  const handleRecordChange = (field: "leadTitle" | "leadDescription" | "description", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [locale]: value,
      },
    }));
  };

  const addCustomLanguage = () => {
    const lang = prompt("Enter new language code (e.g. fr, de, es, zh):")?.toLowerCase().trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setLocale(lang);
    }
  };

  // Dynamic Comprehensive Form Readiness Items for Tour Packages
  const readinessItems: FormReadinessItem[] = [
    {
      id: "pkg-title-en",
      label: "Package Title (English)",
      isComplete: Boolean(formData.title?.en?.trim()),
      elementId: "pkg_input_title",
      targetLang: "en",
      hint: "Primary package headline in English",
    },
    {
      id: "pkg-title-ja",
      label: "Package Title (Japanese)",
      isComplete: Boolean(formData.title?.ja?.trim()),
      elementId: "pkg_input_title",
      targetLang: "ja",
      hint: "Japanese translation of the title",
    },
    {
      id: "pkg-emphasis-en",
      label: "Title Highlight Words (English)",
      isComplete: Boolean(formData.titleEmphasis?.en?.trim()),
      elementId: "pkg_input_emphasis",
      targetLang: "en",
      hint: "Words displayed in gold emphasis (EN)",
    },
    {
      id: "pkg-emphasis-ja",
      label: "Title Highlight Words (Japanese)",
      isComplete: Boolean(formData.titleEmphasis?.ja?.trim()),
      elementId: "pkg_input_emphasis",
      targetLang: "ja",
      hint: "Words displayed in gold emphasis (JA)",
    },
    {
      id: "pkg-slug",
      label: "URL Slug",
      isComplete: Boolean(formData.slug?.trim()),
      elementId: "pkg_input_slug",
      hint: "Auto-generated web address slug",
    },
    {
      id: "pkg-category-en",
      label: "Category (English)",
      isComplete: Boolean(formData.category?.en?.trim()),
      elementId: "pkg_input_category",
      targetLang: "en",
      hint: "Tour category e.g. Adventure, Wildlife (EN)",
    },
    {
      id: "pkg-category-ja",
      label: "Category (Japanese)",
      isComplete: Boolean(formData.category?.ja?.trim()),
      elementId: "pkg_input_category",
      targetLang: "ja",
      hint: "Tour category (JA)",
    },
    {
      id: "pkg-origin-en",
      label: "Origin / Departure (English)",
      isComplete: Boolean(formData.origin?.en?.trim()),
      elementId: "pkg_input_origin",
      targetLang: "en",
      hint: "Starting point e.g. Colombo (EN)",
    },
    {
      id: "pkg-origin-ja",
      label: "Origin / Departure (Japanese)",
      isComplete: Boolean(formData.origin?.ja?.trim()),
      elementId: "pkg_input_origin",
      targetLang: "ja",
      hint: "Starting point (JA)",
    },
    {
      id: "pkg-duration-en",
      label: "Duration (English)",
      isComplete: Boolean(formData.duration?.en?.trim()),
      elementId: "pkg_input_duration",
      targetLang: "en",
      hint: "e.g. 5 Days / 4 Nights (EN)",
    },
    {
      id: "pkg-duration-ja",
      label: "Duration (Japanese)",
      isComplete: Boolean(formData.duration?.ja?.trim()),
      elementId: "pkg_input_duration",
      targetLang: "ja",
      hint: "Duration in Japanese (JA)",
    },
    {
      id: "pkg-provider",
      label: "Tour Provider",
      isComplete: Boolean(formData.provider?.trim()),
      elementId: "pkg_input_provider",
      hint: "Operator name (e.g. Ikisaki Tours)",
    },
    {
      id: "pkg-price",
      label: "Base Starting Price ($)",
      isComplete: Number(formData.price) >= 0 && formData.price !== "",
      elementId: "pkg_input_price",
      hint: "Starting rate per adult in USD",
    },
    {
      id: "pkg-gallery",
      label: "Gallery Photos (≥ 1 Photo)",
      isComplete: selectedFiles.length > 0,
      elementId: "pkg_input_gallery",
      hint: "At least one showcase tour photo",
    },
    {
      id: "pkg-destinations",
      label: "Destinations Sequence (≥ 1)",
      isComplete: Boolean(formData.destinations && formData.destinations.length > 0),
      elementId: "pkg_input_destinations",
      hint: "Ordered list of tour stops",
    },
    {
      id: "pkg-lead-title-en",
      label: "Lead Title (English)",
      isComplete: Boolean(formData.leadTitle?.en?.trim()),
      elementId: "pkg_input_lead_title",
      targetLang: "en",
      hint: "Short hero card teaser headline (EN)",
    },
    {
      id: "pkg-lead-title-ja",
      label: "Lead Title (Japanese)",
      isComplete: Boolean(formData.leadTitle?.ja?.trim()),
      elementId: "pkg_input_lead_title",
      targetLang: "ja",
      hint: "Short hero card teaser headline (JA)",
    },
    {
      id: "pkg-lead-desc-en",
      label: "Lead Description (English)",
      isComplete: Boolean(formData.leadDescription?.en?.trim()),
      elementId: "pkg_input_lead_desc",
      targetLang: "en",
      hint: "Teaser description for listings (EN)",
    },
    {
      id: "pkg-lead-desc-ja",
      label: "Lead Description (Japanese)",
      isComplete: Boolean(formData.leadDescription?.ja?.trim()),
      elementId: "pkg_input_lead_desc",
      targetLang: "ja",
      hint: "Teaser description for listings (JA)",
    },
    {
      id: "pkg-itinerary",
      label: "Itinerary Schedule (Day 1)",
      isComplete: Boolean(
        formData.itinerary &&
        formData.itinerary.length > 0 &&
        (formData.itinerary[0]?.title?.en?.trim() || formData.itinerary[0]?.title?.[locale]?.trim())
      ),
      elementId: "package-itinerary-section",
      hint: "Day-by-day itinerary schedule and locations",
    },
    {
      id: "pkg-activities",
      label: "Activities & Experiences (≥ 1)",
      isComplete: Boolean(
        formData.activityDetails &&
        formData.activityDetails.length > 0 &&
        (formData.activityDetails[0]?.title?.en?.trim() || formData.activityDetails[0]?.title?.[locale]?.trim())
      ),
      elementId: "package-activities-section",
      hint: "Key activities included in tour",
    },
    {
      id: "pkg-highlights-en",
      label: "Key Highlights (English)",
      isComplete: (formData.highlights?.en || []).filter((h) => h.trim() !== "").length > 0,
      elementId: "package-highlights-section",
      targetLang: "en",
      hint: "Bullet points of top attractions (EN)",
    },
    {
      id: "pkg-highlights-ja",
      label: "Key Highlights (Japanese)",
      isComplete: (formData.highlights?.ja || []).filter((h) => h.trim() !== "").length > 0,
      elementId: "package-highlights-section",
      targetLang: "ja",
      hint: "Bullet points of top attractions (JA)",
    },
    {
      id: "pkg-includes-en",
      label: "Inclusions (English)",
      isComplete: (formData.includes?.en || []).filter((i) => i.trim() !== "").length > 0,
      elementId: "package-highlights-section",
      targetLang: "en",
      hint: "What is included in this package (EN)",
    },
    {
      id: "pkg-includes-ja",
      label: "Inclusions (Japanese)",
      isComplete: (formData.includes?.ja || []).filter((i) => i.trim() !== "").length > 0,
      elementId: "package-highlights-section",
      targetLang: "ja",
      hint: "What is included in this package (JA)",
    },
    {
      id: "pkg-excludes-en",
      label: "Exclusions (English)",
      isComplete: (formData.excludes?.en || []).filter((e) => e.trim() !== "").length > 0,
      elementId: "package-highlights-section",
      targetLang: "en",
      hint: "What is excluded from package (EN)",
    },
    {
      id: "pkg-excludes-ja",
      label: "Exclusions (Japanese)",
      isComplete: (formData.excludes?.ja || []).filter((e) => e.trim() !== "").length > 0,
      elementId: "package-highlights-section",
      targetLang: "ja",
      hint: "What is excluded from package (JA)",
    },
    {
      id: "pkg-description-en",
      label: "Detailed Description (English)",
      isComplete: Boolean(formData.description?.en?.trim()),
      elementId: "pkg_input_description",
      targetLang: "en",
      hint: "Full background narrative (EN)",
    },
    {
      id: "pkg-description-ja",
      label: "Detailed Description (Japanese)",
      isComplete: Boolean(formData.description?.ja?.trim()),
      elementId: "pkg_input_description",
      targetLang: "ja",
      hint: "Full background narrative (JA)",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Smart Validation: Only enforce core required fields
    const englishTitle = formData.title?.en?.trim() || Object.values(formData.title || {})[0]?.trim();
    if (!englishTitle) {
      notify("Please provide a title for the package (English title is required).", "warning");
      return;
    }

    if (!formData.slug?.trim()) {
      notify("Please provide a package URL slug (e.g. 'sigiriya-dambulla-tour').", "warning");
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      notify("Please enter a valid base price (greater than or equal to 0).", "warning");
      return;
    }

    if (selectedFiles.length === 0) {
      notify("Please attach at least one gallery image for this tour package.", "warning");
      return;
    }

    setLoading(true);
    try {
      // Direct-to-Cloudflare R2 WebP pipeline + pure JSON creation
      const result = await packageService.createPackage(formData, selectedFiles);
      notify(`Success! Package "${result.slug || formData.slug}" published successfully to Cloudflare R2!`, "success");

      // Reset form data and uploaded files
      setSelectedFiles([]);
      setFormData(INITIAL_FORM_STATE);
      draft.clearDraft();
    } catch (err: any) {
      notify(formatBackendErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast System */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />

      {/* Form Completion & Readiness Assistant */}
      <FormReadinessDrawer
        items={readinessItems}
        entityTitle={formData.title?.[locale] || formData.title?.en || "Tour Package"}
        onNavigateToField={(item) => {
          if (item.targetLang) {
            setLocale(item.targetLang);
          }
        }}
      />

      {/* 1. Dynamic JSON Uploader & Language Navigation Hub */}
      <JsonUploaderSection
        formData={formData}
        setFormData={setFormData}
        activeLang={locale}
        setActiveLang={setLocale}
        availableLanguages={availableLanguages}
        setAvailableLanguages={setAvailableLanguages}
      />

      {/* Draft Recovery & Auto-Save Notification */}
      <DraftRecoveryBanner
        hasDraft={draft.hasDraft}
        draftSavedAt={draft.draftSavedAt}
        onRestore={draft.restoreDraft}
        onDiscard={draft.discardDraft}
        lastSaved={draft.lastSaved}
        isSaving={draft.isSaving}
        onSaveNow={draft.saveDraftNow}
        entityName="Tour Package"
        showLeaveConfirm={draft.showLeaveConfirm}
        onCancelLeave={draft.cancelLeave}
        onConfirmLeave={draft.confirmLeave}
      />

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-8 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs"
      >
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">New Tour Package Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill in all details below to publish your tour package.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Dynamic Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
              {availableLanguages.map((langKey) => (
                <button
                  key={langKey}
                  type="button"
                  onClick={() => setLocale(langKey)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase ${
                    locale === langKey ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
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

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" /> {loading ? "Optimizing & Uploading to R2..." : "Save Package"}
            </button>
          </div>
        </div>

        {/* Basic Overview & Metadata */}
        <div id="package-basic-overview">
          <BasicOverviewSection formData={formData} setFormData={setFormData} locale={locale} />
        </div>

        {/* Lead Header Info */}
        <div id="package-lead-header" className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Lead Header Information(For User Attraction) ({locale.toUpperCase()})
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lead Title ({locale.toUpperCase()})
              </label>
              <input
                id="pkg_input_lead_title"
                type="text"
                required={locale === "en"}
                value={formData.leadTitle?.[locale] || ""}
                onChange={(e) => handleRecordChange("leadTitle", e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lead Description ({locale.toUpperCase()})
              </label>
              <textarea
                id="pkg_input_lead_desc"
                required={locale === "en"}
                value={formData.leadDescription?.[locale] || ""}
                onChange={(e) => handleRecordChange("leadDescription", e.target.value)}
                rows={2}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none resize-y min-h-10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Gallery Sections */}
        <div id="package-pricing-section">
          <PricingSection formData={formData} setFormData={setFormData} locale={locale} />
        </div>

        {/* Direct-to-Cloudflare R2 Gallery Section */}
        <div id="package-gallery-section">
          <GallerySection
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            disabled={loading}
          />
        </div>

        {/* Destination Sequence Picker */}
        <div id="package-destination-picker">
          <PackageDestinationPicker
            selectedDestinations={formData.destinations}
            onChange={(destinations) => setFormData({ ...formData, destinations })}
            locale={locale}
          />
        </div>

        {/* Multilingual Sub-sections */}
        <div id="package-activities-section">
          <ActivitiesSection formData={formData} setFormData={setFormData} locale={locale} />
        </div>
        <div id="package-itinerary-section">
          <ItinerarySection formData={formData} setFormData={setFormData} locale={locale} />
        </div>
        <div id="package-highlights-section">
          <HighlightsAndExtras formData={formData} setFormData={setFormData} locale={locale} />
        </div>

        {/* Detailed Description */}
        <div id="package-description-section" className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-600">
            Detailed Description ({locale.toUpperCase()})
          </label>
          <textarea
            id="pkg_input_description"
            rows={4}
            required={locale === "en"}
            value={formData.description?.[locale] || ""}
            onChange={(e) => handleRecordChange("description", e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none resize-y focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </form>
    </div>
  );
}
