// components/destinations/DestinationForm.tsx
"use client";

import { useState } from "react";
import { destinationService, DestinationLanguage } from "@/services/destination.service";
import { Save } from "lucide-react";
import DestinationBasicInfo from "./DestinationBasicInfo";
import DestinationContent from "./DestinationContent";
import DestinationMedia from "./DestinationMedia";
import DestinationQuickFacts from "./DestinationQuickFacts";

interface DestinationFormProps {
    onSuccess?: () => void;
}

export default function DestinationForm({ onSuccess }: DestinationFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        language: "en" as DestinationLanguage,
        summary: "",
        description: "",
        province: "",
        bestTimeToVisit: "",
        climate: "",
        primaryLanguage: "",
        localCurrency: "",
        lat: 35.6762,
        lng: 139.6503,
    });

    const [highlights, setHighlights] = useState<string[]>([""]);

    // Unicode-aware slugify (supports English, Japanese, French accents)
    const slugify = (text: string) => {
        return text
            .trim()
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData((prev) => ({
            ...prev,
            title,
            slug: isCustomSlug ? prev.slug : slugify(title),
        }));
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsCustomSlug(true);
        setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
    };

    const handleQuickFactChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrls: string[] = [];

            if (selectedFiles.length > 0) {
                imageUrls = await destinationService.uploadImages(selectedFiles, "destinations");
            }

            const rawSlug = formData.slug.trim() !== "" ? formData.slug : formData.title;
            const computedSlug = slugify(rawSlug);
            const finalSlug = computedSlug.length > 0 ? computedSlug : `destination-${Date.now()}`;

            const destinationData = {
                title: formData.title,
                slug: finalSlug,
                language: formData.language,
                summary: formData.summary,
                description: formData.description,
                province: formData.province,
                highlights: highlights.filter((h) => h.trim() !== ""),
                images: imageUrls,
                bestTimeToVisit: formData.bestTimeToVisit,
                climate: formData.climate,
                primaryLanguage: formData.primaryLanguage,
                localCurrency: formData.localCurrency,
                coordinates: {
                    lat: Number(formData.lat),
                    lng: Number(formData.lng),
                },
            };

            const newDest = await destinationService.createDestination(destinationData);
            alert(`Destination created successfully! ID: ${newDest.id}`);

            // Reset Form
            setSelectedFiles([]);
            setIsCustomSlug(false);
            setFormData({
                title: "",
                slug: "",
                language: "en",
                summary: "",
                description: "",
                province: "",
                bestTimeToVisit: "",
                climate: "",
                primaryLanguage: "",
                localCurrency: "",
                lat: 35.6762,
                lng: 139.6503,
            });
            setHighlights([""]);

            if (onSuccess) onSuccess();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-lg font-bold">Create Travel Destination</h2>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Publish"}
                </button>
            </div>

            <DestinationBasicInfo
                title={formData.title}
                slug={formData.slug}
                language={formData.language}
                province={formData.province}
                onTitleChange={handleTitleChange}
                onSlugChange={handleSlugChange}
                onLanguageChange={(lang) => setFormData((prev) => ({ ...prev, language: lang as DestinationLanguage }))}
                onProvinceChange={(province) => setFormData((prev) => ({ ...prev, province }))}
            />

            <DestinationContent
                summary={formData.summary}
                description={formData.description}
                highlights={highlights}
                onSummaryChange={(summary) => setFormData((prev) => ({ ...prev, summary }))}
                onDescriptionChange={(description) => setFormData((prev) => ({ ...prev, description }))}
                onHighlightChange={(idx, val) => {
                    const newH = [...highlights];
                    newH[idx] = val;
                    setHighlights(newH);
                }}
                onAddHighlight={() => setHighlights([...highlights, ""])}
                onRemoveHighlight={(idx) => setHighlights(highlights.filter((_, i) => i !== idx))}
            />

            <DestinationMedia
                selectedFiles={selectedFiles}
                onFileSelect={(e) => {
                    if (e.target.files) {
                        setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)].slice(0, 6));
                    }
                }}
                onRemoveFile={(idx) => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
            />

            <DestinationQuickFacts
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