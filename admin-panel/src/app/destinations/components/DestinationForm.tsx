"use client";

import { useState } from "react";
import { destinationService } from "@/services/destination.service";
import { Save, X } from "lucide-react";

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
        summary: "",
        description: "",
        province: "",
        bestTimeToVisit: "",
        climate: "",
        primaryLanguage: "",
        localCurrency: "",
        lat: 7.2906,
        lng: 80.6337,
    });

    // Dynamic highlights state
    const [highlights, setHighlights] = useState<string[]>([""]);

    // Helper function to turn strings into URL-friendly slugs
    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    // Auto-update slug when title changes unless user manually edited slug
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
        setFormData({ ...formData, slug: slugify(e.target.value) });
    };

    // Highlights handlers
    const handleHighlightChange = (index: number, value: string) => {
        const newHighlights = [...highlights];
        newHighlights[index] = value;
        setHighlights(newHighlights);
    };

    const addHighlightField = () => setHighlights([...highlights, ""]);
    const removeHighlightField = (index: number) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Limit total images to 6 max (Index 0 = hero, up to 5 more)
            setSelectedFiles((prev) => [...prev, ...filesArray].slice(0, 6));
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrls: string[] = [];

            // 1. Upload files to Cloudflare R2 first
            if (selectedFiles.length > 0) {
                imageUrls = await destinationService.uploadImages(selectedFiles, "destinations");
            }

            // 2. Submit pure JSON containing R2 image URLs & metadata including province
            const destinationData = {
                title: formData.title,
                slug: formData.slug || slugify(formData.title),
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

            // Reset form
            setSelectedFiles([]);
            setIsCustomSlug(false);
            setFormData({
                title: "",
                slug: "",
                summary: "",
                description: "",
                province: "",
                bestTimeToVisit: "",
                climate: "",
                primaryLanguage: "",
                localCurrency: "",
                lat: 7.2906,
                lng: 80.6337,
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
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
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

            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold mb-1">Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleTitleChange}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Kandy"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold mb-1">
                        URL Slug <span className="text-slate-400 font-normal">(Auto-generated)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-600"
                        placeholder="kandy"
                    />
                </div>
            </div>

            {/* Province Field */}
            <div>
                <label className="block text-xs font-semibold mb-1">Province</label>
                <input
                    type="text"
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Central Province"
                />
            </div>

            {/* Summary & Description */}
            <div>
                <label className="block text-xs font-semibold mb-1">Summary / Small Description</label>
                <textarea
                    rows={2}
                    required
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Brief overview of the destination..."
                />
            </div>

            <div>
                <label className="block text-xs font-semibold mb-1">Detailed Description</label>
                <textarea
                    rows={5}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="In-depth information about culture, attractions, history..."
                />
            </div>

            {/* Highlights */}
            <div>
                <label className="block text-xs font-semibold mb-1">Key Highlights</label>
                {highlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={highlight}
                            onChange={(e) => handleHighlightChange(index, e.target.value)}
                            placeholder={`Highlight #${index + 1}`}
                            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {highlights.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeHighlightField(index)}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addHighlightField}
                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 mt-1"
                >
                    + Add Another Highlight
                </button>
            </div>

            {/* Images */}
            <div>
                <label className="block text-xs font-semibold mb-1">
                    Images <span className="text-slate-400 font-normal">(Index 0 = Hero Image, up to 6 max)</span>
                </label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />

                {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedFiles.map((file, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-slate-100 text-xs px-2 py-1 rounded">
                                {idx === 0 ? "★ Hero: " : ""}{file.name}
                                <button type="button" onClick={() => removeFile(idx)}>
                                    <X className="w-3 h-3 text-red-500" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold mb-1">Best Time to Visit</label>
                    <input
                        type="text"
                        required
                        value={formData.bestTimeToVisit}
                        onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. December to January"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1">Climate</label>
                    <input
                        type="text"
                        required
                        value={formData.climate}
                        onChange={(e) => setFormData({ ...formData, climate: e.target.value })}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Tropical, Cool highlands"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1">Primary Language</label>
                    <input
                        type="text"
                        required
                        value={formData.primaryLanguage}
                        onChange={(e) => setFormData({ ...formData, primaryLanguage: e.target.value })}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Sinhala, Tamil, English"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1">Local Currency</label>
                    <input
                        type="text"
                        required
                        value={formData.localCurrency}
                        onChange={(e) => setFormData({ ...formData, localCurrency: e.target.value })}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Sri Lankan Rupee (LKR)"
                    />
                </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold mb-1">Latitude</label>
                    <input
                        type="number"
                        step="any"
                        required
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1">Longitude</label>
                    <input
                        type="number"
                        step="any"
                        required
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
            </div>
        </form>
    );
}