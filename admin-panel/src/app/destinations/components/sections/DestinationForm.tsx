"use client";

import { useState, useEffect } from "react";
import { destinationService, DestinationPayload } from "@/services/destination.service";
import { Save, Plus } from "lucide-react";
import DestinationBasicInfo from "./DestinationBasicInfo";
import DestinationContent from "./DestinationContent";
import DestinationMedia from "./DestinationMedia";
import DestinationQuickFacts from "./DestinationQuickFacts";
import DestinationJsonUploader from "./DestinationJsonUploader";

interface DestinationFormProps {
  initialData?: DestinationPayload | null;
  onSuccess?: () => void;
  onDestinationCreated?: () => void;
}

export default function DestinationForm({ initialData, onSuccess, onDestinationCreated }: DestinationFormProps) {
  const isEditMode = Boolean(initialData?.id);

  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [slug, setSlug] = useState("");

  // Active language tab selected in admin form
  const [activeLang, setActiveLang] = useState<string>("en");

  // Track languages detected from imported JSON or added manually
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  // Multilingual fields stored as Record<string, string>
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
  }>({
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

  // Localized highlights map: Record<string, string[]>
  const [highlights, setHighlights] = useState<Record<string, string[]>>({
    en: [""],
    ja: [""],
  });

  // Pre-fill form when initialData is provided (Edit Mode)
  useEffect(() => {
    if (initialData) {
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
      setIsCustomSlug(true);

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
    setLoading(true);

    try {
      let imageUrls: string[] = [];

      if (selectedFiles.length > 0) {
        imageUrls = await destinationService.uploadImages(selectedFiles, "destinations");
      }

      const sampleTitle = formData.title.en || Object.values(formData.title)[0] || "";
      const rawSlug = slug.trim() !== "" ? slug : sampleTitle;
      const computedSlug = slugify(rawSlug);
      const finalSlug = computedSlug.length > 0 ? computedSlug : `destination-${Date.now()}`;

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
        ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
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
        alert("Destination updated successfully!");
      } else {
        const newDest = await destinationService.createDestination(payload);
        alert(`Destination created successfully! ID: ${newDest.id}`);

        // Reset Form
        setSelectedFiles([]);
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
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 space-y-6">
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

      {/* Content (Summary, Description, Highlights) */}
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

      {/* Media Files */}
      <DestinationMedia
        selectedFiles={selectedFiles}
        onFileSelect={(e) => {
          if (e.target.files) {
            setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)].slice(0, 6));
          }
        }}
        onRemoveFile={(idx) => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
      />

      {/* Quick Facts */}
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
    </form>
  );
}