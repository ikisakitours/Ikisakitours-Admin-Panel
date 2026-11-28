"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { destinationService, DestinationPayload } from "@/services/destination.service";
import { Save, Plus } from "lucide-react";
import { useFormDraft } from "@/hooks/useFormDraft";
import { DraftRecoveryBanner } from "@/components/DraftRecoveryBanner";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";
import { FormReadinessDrawer, FormReadinessItem } from "@/components/FormReadinessDrawer";
import { formatBackendErrorMessage } from "@/utils/errorHelper";
import DestinationBasicInfo from "./DestinationBasicInfo";
import DestinationContent from "./DestinationContent";
import DestinationMedia from "./DestinationMedia";
import DestinationQuickFacts from "./DestinationQuickFacts";
import DestinationJsonUploader from "./DestinationJsonUploader";

interface DestinationFormProps {
  initialData?: DestinationPayload | null;
  onSuccess?: () => void;
  onDestinationCreated?: () => void;
  hideImageUpload?: boolean;
}

export default function DestinationForm({
  initialData,
  onSuccess,
  onDestinationCreated,
  hideImageUpload = false,
}: DestinationFormProps) {
  const isEditMode = Boolean(initialData?.id);

  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(() => initialData?.images || []);
  const [isCustomSlug, setIsCustomSlug] = useState<boolean>(() => Boolean(initialData?.slug));
  const [slug, setSlug] = useState<string>(() => initialData?.slug || "");

  // Toast Notification System
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Active language tab selected in admin form
  const [activeLang, setActiveLang] = useState<string>("en");

  // Track languages detected from initialData or imported JSON or added manually
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(() => {
    if (initialData) {
      const langs = new Set<string>(["en", "ja"]);
      const checkObj = (obj?: Record<string, any>) => {
        if (obj) Object.keys(obj).forEach((k) => { if (k.length <= 5) langs.add(k); });
      };
      checkObj(initialData.title);
      checkObj(initialData.summary);
      checkObj(initialData.description);
      checkObj(initialData.province);
      return Array.from(langs);
    }
    return ["en", "ja"];
  });

  // Multilingual fields stored as Record<string, string> - initialized synchronously from initialData
  const [formData, setFormData] = useState<{
    title: Record<string, string>;
    summary: Record<string, string>;
    description: Record<string, string>;
    province: Record<string, string>;
    bestTimeToVisit: Record<string, string>;
    climate: Record<string, string>;
    primaryLanguage: Record<string, string>;
    localCurrency: Record<string, string>;
    lat: number;
    lng: number;
  }>(() => ({
    title: { en: "", ja: "", ...(initialData?.title || {}) },
    summary: { en: "", ja: "", ...(initialData?.summary || {}) },
    description: { en: "", ja: "", ...(initialData?.description || {}) },
    province: { en: "", ja: "", ...(initialData?.province || {}) },
    bestTimeToVisit: { en: "", ja: "", ...(initialData?.bestTimeToVisit || {}) },
    climate: { en: "", ja: "", ...(initialData?.climate || {}) },
    primaryLanguage: { en: "", ja: "", ...(initialData?.primaryLanguage || {}) },
    localCurrency: { en: "", ja: "", ...(initialData?.localCurrency || {}) },
    lat: initialData?.coordinates?.lat ?? 35.6762,
    lng: initialData?.coordinates?.lng ?? 139.6503,
  }));

  // Localized highlights map: Record<string, string[]> - initialized synchronously from initialData
  const [highlights, setHighlights] = useState<Record<string, string[]>>(() => {
    if (initialData?.highlights && Object.keys(initialData.highlights).length > 0) {
      return { en: [""], ja: [""], ...initialData.highlights };
    }
    return { en: [""], ja: [""] };
  });

  // Crash-resilient draft auto-save and recovery
  const draftKey = isEditMode && initialData?.id
    ? `ikisaki_draft_dest_edit_${initialData.id}`
    : "ikisaki_draft_dest_new";

  interface DestinationDraftState {
    formData: typeof formData;
    highlights: Record<string, string[]>;
    slug: string;
  }

  const currentDraftState: DestinationDraftState = {
    formData,
    highlights,
    slug,
  };

  const {
    hasDraft,
    draftSavedAt,
    lastSaved,
    isSaving,
    restoreDraft,
    discardDraft,
    saveDraftNow,
    clearDraft,
    showLeaveConfirm,
    cancelLeave,
    confirmLeave,
  } = useFormDraft<DestinationDraftState>({
    storageKey: draftKey,
    formData: currentDraftState,
    setFormData: (restored) => {
      if (restored.formData) {
        const langs = new Set<string>(["en", "ja"]);
        if (restored.formData.title && typeof restored.formData.title === "object") {
          Object.keys(restored.formData.title).forEach((k) => {
            if (k.length <= 5) langs.add(k);
          });
        }
        setAvailableLanguages(Array.from(langs));
        setFormData(restored.formData);
      }
      if (restored.highlights) setHighlights(restored.highlights);
      if (restored.slug !== undefined) setSlug(restored.slug);
    },
  });

  // Sync whenever initialData arrives (e.g. async fetch in EditDestinationPage)
  const prevInitialDataRef = useRef<DestinationPayload | null | undefined>(undefined);
  useEffect(() => {
    if (initialData && initialData !== prevInitialDataRef.current) {
      prevInitialDataRef.current = initialData;
      const detectedLangs = Array.from(
        new Set([
          "en",
          "ja",
          ...Object.keys(initialData.title || {}),
          ...Object.keys(initialData.summary || {}),
          ...Object.keys(initialData.description || {}),
          ...Object.keys(initialData.province || {}),
        ])
      );

      setAvailableLanguages(detectedLangs);
      setSlug(initialData.slug || "");
      setIsCustomSlug(Boolean(initialData.slug));

      setFormData({
        title: { en: "", ja: "", ...(initialData.title || {}) },
        summary: { en: "", ja: "", ...(initialData.summary || {}) },
        description: { en: "", ja: "", ...(initialData.description || {}) },
        province: { en: "", ja: "", ...(initialData.province || {}) },
        bestTimeToVisit: { en: "", ja: "", ...(initialData.bestTimeToVisit || {}) },
        climate: { en: "", ja: "", ...(initialData.climate || {}) },
        primaryLanguage: { en: "", ja: "", ...(initialData.primaryLanguage || {}) },
        localCurrency: { en: "", ja: "", ...(initialData.localCurrency || {}) },
        lat: initialData.coordinates?.lat ?? 35.6762,
        lng: initialData.coordinates?.lng ?? 139.6503,
      });

      if (initialData.highlights) {
        setHighlights({
          en: [""],
          ja: [""],
          ...initialData.highlights,
        });
      }

      setExistingImages(initialData.images || []);
      setSelectedFiles([]);
    }
  }, [initialData]);

  // Unicode-aware slugify (supports English, Japanese, French accents)
  const slugify = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Add custom language handler
  const addCustomLanguage = () => {
    const lang = prompt("Enter new language code (e.g. fr, de, es, zh):")?.toLowerCase().trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setActiveLang(lang);
      setFormData((prev) => ({
        ...prev,
        title: { ...prev.title, [lang]: "" },
        summary: { ...prev.summary, [lang]: "" },
        description: { ...prev.description, [lang]: "" },
        province: { ...prev.province, [lang]: "" },
        bestTimeToVisit: { ...prev.bestTimeToVisit, [lang]: "" },
        climate: { ...prev.climate, [lang]: "" },
        primaryLanguage: { ...prev.primaryLanguage, [lang]: "" },
        localCurrency: { ...prev.localCurrency, [lang]: "" },
      }));
      setHighlights((prev) => ({
        ...prev,
        [lang]: [""],
      }));
    }
  };

  // Handle JSON Import
  const handleJsonLoaded = (data: any) => {
    if (!data) return;

    const detectedLangs = data.title ? Object.keys(data.title) : ["en"];
    if (detectedLangs.length > 0) {
      setAvailableLanguages((prev) => Array.from(new Set([...prev, ...detectedLangs])));
      setActiveLang(detectedLangs[0]);
    }

    if (data.slug) {
      setSlug(slugify(data.slug));
      setIsCustomSlug(true);
    } else if (data.title?.en || (data.title && Object.values(data.title)[0])) {
      const sampleTitle = data.title.en || Object.values(data.title)[0];
      setSlug(slugify(String(sampleTitle)));
    }

    setFormData({
      title: data.title || { en: "" },
      summary: data.summary || { en: "" },
      description: data.description || { en: "" },
      province: data.province || { en: "" },
      bestTimeToVisit: data.bestTimeToVisit || { en: "" },
      climate: data.climate || { en: "" },
      primaryLanguage: data.primaryLanguage || { en: "" },
      localCurrency: data.localCurrency || { en: "" },
      lat: data.coordinates?.lat ?? 35.6762,
      lng: data.coordinates?.lng ?? 139.6503,
    });

    if (data.highlights) {
      setHighlights(data.highlights);
    }
  };

  // Field change handlers per active language
  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updatedTitle = { ...prev.title, [activeLang]: val };
      return {
        ...prev,
        title: updatedTitle,
      };
    });

    if (!isCustomSlug && activeLang === "en") {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlug(true);
    setSlug(slugify(e.target.value));
  };

  const handleFieldChange = (field: keyof typeof formData, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as Record<string, string>),
        [activeLang]: val,
      },
    }));
  };

  const handleQuickFactChange = (field: string, value: string | number) => {
    if (field === "lat" || field === "lng") {
      setFormData((prev) => ({ ...prev, [field]: Number(value) }));
    } else {
      handleFieldChange(field as keyof typeof formData, String(value));
    }
  };

  // Highlight actions for active language
  const handleHighlightChange = (index: number, val: string) => {
    setHighlights((prev) => {
      const currentList = [...(prev[activeLang] || [""])];
      currentList[index] = val;
      return { ...prev, [activeLang]: currentList };
    });
  };

  const handleAddHighlight = () => {
    setHighlights((prev) => {
      const currentList = [...(prev[activeLang] || [])];
      return { ...prev, [activeLang]: [...currentList, ""] };
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights((prev) => {
      const currentList = (prev[activeLang] || []).filter((_, i) => i !== index);
      return { ...prev, [activeLang]: currentList };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sampleTitle = formData.title.en?.trim() || Object.values(formData.title)[0]?.trim() || "";
    if (!sampleTitle) {
      notify("Please provide a destination title (English is required).", "warning");
      return;
    }

    const rawSlug = slug.trim() !== "" ? slug : sampleTitle;
    const computedSlug = slugify(rawSlug);
    const finalSlug = computedSlug.length > 0 ? computedSlug : `destination-${Date.now()}`;

    if (!finalSlug) {
      notify("Please provide a destination slug.", "warning");
      return;
    }

    if (existingImages.length + selectedFiles.length === 0) {
      notify("Please attach at least one photo for this destination.", "warning");
      return;
    }

    setLoading(true);

    try {
      let newUploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        newUploadedUrls = await destinationService.uploadImages(selectedFiles);
      }

      const finalImages = [...existingImages, ...newUploadedUrls];

      // Sanitize highlights per language
      const cleanedHighlights: Record<string, string[]> = {};
      Object.keys(highlights).forEach((lang) => {
        cleanedHighlights[lang] = (highlights[lang] || []).filter((h) => h.trim() !== "");
      });

      const payload: DestinationPayload = {
        title: formData.title,
        slug: finalSlug,
        summary: formData.summary,
        description: formData.description,
        province: formData.province,
        highlights: cleanedHighlights,
        images: finalImages,
        bestTimeToVisit: formData.bestTimeToVisit,
        climate: formData.climate,
        primaryLanguage: formData.primaryLanguage,
        localCurrency: formData.localCurrency,
        coordinates: {
          lat: Number(formData.lat),
          lng: Number(formData.lng),
        },
      };

      if (isEditMode && initialData?.id) {
        await destinationService.updateDestination(initialData.id, payload);
        clearDraft();
        notify("Destination updated successfully!", "success");
      } else {
        const newDest = await destinationService.createDestination(payload);
        clearDraft();
        notify(`Destination created successfully! ID: ${newDest.id}`, "success");

        // Reset Form
        setSelectedFiles([]);
        setExistingImages([]);
        setIsCustomSlug(false);
        setSlug("");
        setActiveLang("en");
        setAvailableLanguages(["en", "ja"]);
        setFormData({
          title: { en: "", ja: "" },
          summary: { en: "", ja: "" },
          description: { en: "", ja: "" },
          province: { en: "", ja: "" },
          bestTimeToVisit: { en: "", ja: "" },
          climate: { en: "", ja: "" },
          primaryLanguage: { en: "", ja: "" },
          localCurrency: { en: "", ja: "" },
          lat: 35.6762,
          lng: 139.6503,
        });
        setHighlights({ en: [""], ja: [""] });
      }

      if (onSuccess) onSuccess();
      if (onDestinationCreated) onDestinationCreated();
    } catch (err: any) {
      notify(formatBackendErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // Readiness checklist items tracking EVERY field
  const readinessItems: FormReadinessItem[] = [
    {
      id: "dest_title_en",
      label: "Title (English)",
      isComplete: Boolean(formData.title?.en?.trim()),
      elementId: "dest_input_title",
      targetLang: "en",
      hint: "English destination name",
    },
    {
      id: "dest_title_ja",
      label: "Title (Japanese)",
      isComplete: Boolean(formData.title?.ja?.trim()),
      elementId: "dest_input_title",
      targetLang: "ja",
      hint: "Japanese destination name",
    },
    {
      id: "dest_slug",
      label: "URL Slug",
      isComplete: Boolean(slug?.trim()),
      elementId: "dest_input_slug",
      hint: "Auto-generated destination slug",
    },
    {
      id: "dest_province_en",
      label: "Province / Region (English)",
      isComplete: Boolean(formData.province?.en?.trim()),
      elementId: "dest_input_province",
      targetLang: "en",
      hint: "Province or geographical zone (EN)",
    },
    {
      id: "dest_province_ja",
      label: "Province / Region (Japanese)",
      isComplete: Boolean(formData.province?.ja?.trim()),
      elementId: "dest_input_province",
      targetLang: "ja",
      hint: "Province or geographical zone (JA)",
    },
    {
      id: "dest_images",
      label: "Photos (≥ 1 Image)",
      isComplete: existingImages.length + selectedFiles.length > 0,
      elementId: "dest_input_images",
      hint: "Hero banner and gallery photos",
    },
    {
      id: "dest_summary_en",
      label: "Summary (English)",
      isComplete: Boolean(formData.summary?.en?.trim()),
      elementId: "dest_input_summary",
      targetLang: "en",
      hint: "Short introductory overview (EN)",
    },
    {
      id: "dest_summary_ja",
      label: "Summary (Japanese)",
      isComplete: Boolean(formData.summary?.ja?.trim()),
      elementId: "dest_input_summary",
      targetLang: "ja",
      hint: "Short introductory overview (JA)",
    },
    {
      id: "dest_description_en",
      label: "Detailed Description (English)",
      isComplete: Boolean(formData.description?.en?.trim()),
      elementId: "dest_input_description",
      targetLang: "en",
      hint: "Full destination guide & history (EN)",
    },
    {
      id: "dest_description_ja",
      label: "Detailed Description (Japanese)",
      isComplete: Boolean(formData.description?.ja?.trim()),
      elementId: "dest_input_description",
      targetLang: "ja",
      hint: "Full destination guide & history (JA)",
    },
    {
      id: "dest_highlights_en",
      label: "Key Highlights (English)",
      isComplete: (highlights?.en || []).filter((h) => h.trim() !== "").length > 0,
      elementId: "dest_input_highlights",
      targetLang: "en",
      hint: "Must-see attractions (EN)",
    },
    {
      id: "dest_highlights_ja",
      label: "Key Highlights (Japanese)",
      isComplete: (highlights?.ja || []).filter((h) => h.trim() !== "").length > 0,
      elementId: "dest_input_highlights",
      targetLang: "ja",
      hint: "Must-see attractions (JA)",
    },
    {
      id: "dest_best_time_en",
      label: "Best Time to Visit (English)",
      isComplete: Boolean(formData.bestTimeToVisit?.en?.trim()),
      elementId: "dest_input_best_time",
      targetLang: "en",
      hint: "Optimal travel months & seasons (EN)",
    },
    {
      id: "dest_best_time_ja",
      label: "Best Time to Visit (Japanese)",
      isComplete: Boolean(formData.bestTimeToVisit?.ja?.trim()),
      elementId: "dest_input_best_time",
      targetLang: "ja",
      hint: "Optimal travel months & seasons (JA)",
    },
    {
      id: "dest_climate_en",
      label: "Climate Info (English)",
      isComplete: Boolean(formData.climate?.en?.trim()),
      elementId: "dest_input_climate",
      targetLang: "en",
      hint: "Weather & temperature details (EN)",
    },
    {
      id: "dest_climate_ja",
      label: "Climate Info (Japanese)",
      isComplete: Boolean(formData.climate?.ja?.trim()),
      elementId: "dest_input_climate",
      targetLang: "ja",
      hint: "Weather & temperature details (JA)",
    },
    {
      id: "dest_language_en",
      label: "Primary Language (English)",
      isComplete: Boolean(formData.primaryLanguage?.en?.trim()),
      elementId: "dest_input_language",
      targetLang: "en",
      hint: "Spoken languages (EN)",
    },
    {
      id: "dest_language_ja",
      label: "Primary Language (Japanese)",
      isComplete: Boolean(formData.primaryLanguage?.ja?.trim()),
      elementId: "dest_input_language",
      targetLang: "ja",
      hint: "Spoken languages (JA)",
    },
    {
      id: "dest_currency_en",
      label: "Local Currency (English)",
      isComplete: Boolean(formData.localCurrency?.en?.trim()),
      elementId: "dest_input_currency",
      targetLang: "en",
      hint: "Currency code and notes (EN)",
    },
    {
      id: "dest_currency_ja",
      label: "Local Currency (Japanese)",
      isComplete: Boolean(formData.localCurrency?.ja?.trim()),
      elementId: "dest_input_currency",
      targetLang: "ja",
      hint: "Currency code and notes (JA)",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 space-y-6">
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
      <FormReadinessDrawer
        items={readinessItems}
        entityTitle="Destination"
        onNavigateToField={(item) => {
          if (item.targetLang) {
            setActiveLang(item.targetLang);
          }
        }}
      />
      <DraftRecoveryBanner
        hasDraft={hasDraft}
        draftSavedAt={draftSavedAt}
        onRestore={restoreDraft}
        onDiscard={discardDraft}
        lastSaved={lastSaved}
        isSaving={isSaving}
        onSaveNow={saveDraftNow}
        entityName={isEditMode ? "Destination Edit" : "New Destination"}
        showLeaveConfirm={showLeaveConfirm}
        onCancelLeave={cancelLeave}
        onConfirmLeave={confirmLeave}
      />

      <div className="flex justify-between items-center pb-4 border-b dark:border-gray-800 flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {isEditMode ? "Edit Travel Destination" : "Create Travel Destination"}
          </h2>
          <p className="text-xs text-slate-500">
            {isEditMode ? "Update destination fields and multilingual details." : "Upload a JSON data file or fill out fields manually."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Dynamic Language Switcher with Add Button */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-800 p-1 rounded-lg border border-slate-200 dark:border-gray-700 flex-wrap">
            {availableLanguages.map((langKey) => (
              <button
                key={langKey}
                type="button"
                onClick={() => setActiveLang(langKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase ${activeLang === langKey
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700"
                  }`}
              >
                {langKey}
              </button>
            ))}
            <button
              type="button"
              onClick={addCustomLanguage}
              className="p-1.5 text-slate-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs flex items-center gap-0.5 font-semibold cursor-pointer"
              title="Add new language code"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : isEditMode ? "Save Changes" : "Publish"}
          </button>
        </div>
      </div>

      {/* JSON File Uploader Section (Hidden in Edit Mode if desired, or kept) */}
      {!isEditMode && <DestinationJsonUploader onDataLoaded={handleJsonLoaded} />}

      {/* Basic Info (Title, Slug, Province & Language tabs) */}
      <div id="dest_section_basic">
        <DestinationBasicInfo
          title={formData.title}
          slug={slug}
          language={activeLang}
          availableLanguages={availableLanguages}
          province={formData.province}
          onTitleChange={handleTitleChange}
          onSlugChange={handleSlugChange}
          onLanguageChange={(lang) => setActiveLang(lang)}
          onProvinceChange={(val) => handleFieldChange("province", val)}
        />
      </div>

      {/* Content (Summary, Description, Highlights) */}
      <div id="dest_section_content">
        <DestinationContent
          language={activeLang}
          summary={formData.summary}
          description={formData.description}
          highlights={highlights}
          onSummaryChange={(val) => handleFieldChange("summary", val)}
          onDescriptionChange={(val) => handleFieldChange("description", val)}
          onHighlightChange={handleHighlightChange}
          onAddHighlight={handleAddHighlight}
          onRemoveHighlight={handleRemoveHighlight}
        />
      </div>

      {/* Media Files (Hidden when hideImageUpload prop is true) */}
      {!hideImageUpload && (
        <div id="dest_section_media">
          <DestinationMedia
            existingImages={existingImages}
            onRemoveExisting={handleRemoveExistingImage}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            disabled={loading}
            maxImages={6}
          />
        </div>
      )}

      {/* Quick Facts */}
      <div id="dest_section_quick_facts">
        <DestinationQuickFacts
          language={activeLang}
          bestTimeToVisit={formData.bestTimeToVisit}
          climate={formData.climate}
          primaryLanguage={formData.primaryLanguage}
          localCurrency={formData.localCurrency}
          lat={formData.lat}
          lng={formData.lng}
          onChange={handleQuickFactChange}
        />
      </div>
    </form>
  );
}