"use client";

import { useState, useEffect } from "react";
import { blogService, BlogPayload } from "@/services/blog.service";
import { Save, Plus } from "lucide-react";
import JsonImporter from "./JsonImporter";
import MultilingualEditor from "./MultilingualEditor";
import ImageUploader from "./ImageUploader";

interface BlogFormProps {
    initialData?: BlogPayload | null;
    onSuccess?: () => void;
    onBlogCreated?: () => void;
}

export default function BlogForm({ initialData, onSuccess, onBlogCreated }: BlogFormProps) {
    const isEditMode = Boolean(initialData?.id);

    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isCustomSlug, setIsCustomSlug] = useState(false);

    // Dynamic language management
    const [activeLang, setActiveLang] = useState<string>("en");
    const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

    const [formData, setFormData] = useState({
        title: { en: "", ja: "" } as Record<string, string>,
        slug: "",
        summary: { en: "", ja: "" } as Record<string, string>,
        category: { en: "", ja: "" } as Record<string, string>,
        readTime: { en: "", ja: "" } as Record<string, string>,
        author: "",
        blog: { en: "", ja: "" } as Record<string, string>,
    });

    // Pre-fill form & sync language tabs when initialData is provided (Edit Mode)
    useEffect(() => {
        if (initialData) {
            const detectedLangs = Array.from(
                new Set([
                    "en",
                    "ja",
                    ...Object.keys(initialData.title || {}),
                    ...Object.keys(initialData.summary || {}),
                    ...Object.keys(initialData.category || {}),
                    ...Object.keys(initialData.readTime || {}),
                    ...Object.keys(initialData.blog || {}),
                ])
            );

            setAvailableLanguages(detectedLangs);
            setFormData({
                title: { en: "", ja: "", ...(initialData.title || {}) },
                slug: initialData.slug || "",
                summary: { en: "", ja: "", ...(initialData.summary || {}) },
                category: { en: "", ja: "", ...(initialData.category || {}) },
                readTime: { en: "", ja: "", ...(initialData.readTime || {}) },
                author: initialData.author || "",
                blog: { en: "", ja: "", ...(initialData.blog || {}) },
            });
            setIsCustomSlug(true);
        }
    }, [initialData]);

    const slugify = (text: string) => {
        return text
            .trim()
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const addCustomLanguage = () => {
        const lang = prompt("Enter new language code (e.g. fr, de, es, zh):")?.toLowerCase().trim();
        if (lang && !availableLanguages.includes(lang)) {
            setAvailableLanguages((prev) => [...prev, lang]);
            setActiveLang(lang);
            setFormData((prev) => ({
                ...prev,
                title: { ...prev.title, [lang]: "" },
                summary: { ...prev.summary, [lang]: "" },
                category: { ...prev.category, [lang]: "" },
                readTime: { ...prev.readTime, [lang]: "" },
                blog: { ...prev.blog, [lang]: "" },
            }));
        }
    };

    const handleLoadJson = (jsonContent: any) => {
        if (!jsonContent) return;

        const titleObj = typeof jsonContent.title === "object" && jsonContent.title !== null
            ? jsonContent.title
            : { en: jsonContent.title || "" };

        const detectedLangs = Object.keys(titleObj);
        if (detectedLangs.length > 0) {
            setAvailableLanguages((prev) => Array.from(new Set([...prev, ...detectedLangs])));
            setActiveLang(detectedLangs[0]);
        }

        setFormData((prev) => ({
            ...prev,
            slug: jsonContent.slug || prev.slug,
            author: jsonContent.author || prev.author,
            category: typeof jsonContent.category === "object" ? jsonContent.category : { en: jsonContent.category || "" },
            title: titleObj,
            summary: typeof jsonContent.summary === "object" ? jsonContent.summary : { en: jsonContent.summary || "" },
            readTime: typeof jsonContent.readTime === "object" ? jsonContent.readTime : { en: jsonContent.readTime || "" },
            blog: typeof jsonContent.blog === "object" ? jsonContent.blog : { en: jsonContent.blog || "" },
        }));
    };

    const handleFieldChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleTitleChange = (val: string) => {
        const updatedTitle = { ...formData.title, [activeLang]: val };
        const englishTitle = updatedTitle["en"] || Object.values(updatedTitle)[0] || "";

        setFormData((prev) => ({
            ...prev,
            title: updatedTitle,
            slug: isCustomSlug ? prev.slug : slugify(englishTitle),
        }));
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsCustomSlug(true);
        setFormData({ ...formData, slug: slugify(e.target.value) });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...filesArray]);
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

            if (selectedFiles.length > 0) {
                imageUrls = await blogService.uploadImages(selectedFiles, "blogs");
            }

            const englishTitle = formData.title["en"] || Object.values(formData.title)[0] || "";
            const finalSlug =
                slugify(formData.slug.trim() ? formData.slug : englishTitle) ||
                `blog-${Date.now()}`;

            const blogPayload = {
                title: formData.title,
                slug: finalSlug,
                summary: formData.summary,
                category: formData.category,
                readTime: formData.readTime,
                author: formData.author,
                blog: formData.blog,
                ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
            };

            if (isEditMode && initialData?.id) {
                await blogService.updateBlog(initialData.id, blogPayload);
                alert("Blog updated successfully!");
            } else {
                const newPost = await blogService.createBlog(blogPayload);
                alert(`Blog created successfully! ID: ${newPost.id}`);

                setSelectedFiles([]);
                setIsCustomSlug(false);
                setActiveLang("en");
                setAvailableLanguages(["en", "ja"]);
                setFormData({
                    title: { en: "", ja: "" },
                    slug: "",
                    summary: { en: "", ja: "" },
                    category: { en: "", ja: "" },
                    readTime: { en: "", ja: "" },
                    author: "",
                    blog: { en: "", ja: "" },
                });
            }

            if (onSuccess) onSuccess();
            if (onBlogCreated) onBlogCreated();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b flex-wrap gap-4">
                <div>
                    <h2 className="text-lg font-bold">
                        {isEditMode ? "Edit Multilingual Blog Post" : "Create Multilingual Blog Post"}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {isEditMode ? "Update blog fields and languages." : "Upload a JSON data file or fill out fields manually."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Dynamic Language Switcher with Add Button */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
                        {availableLanguages.map((langKey) => (
                            <button
                                key={langKey}
                                type="button"
                                onClick={() => setActiveLang(langKey)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase ${activeLang === langKey
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

            {/* Component 1: JSON Importer (Hidden or shown when creating) */}
            {!isEditMode && <JsonImporter onLoadJson={handleLoadJson} />}

            {/* Component 2: Multilingual Editor */}
            <MultilingualEditor
                formData={formData}
                onChange={handleFieldChange}
                activeLang={activeLang}
                setActiveLang={setActiveLang}
                handleSlugChange={handleSlugChange}
                handleTitleChange={handleTitleChange}
                availableLanguages={availableLanguages}
            />

            {/* Component 3: Image Uploader */}
            <ImageUploader
                selectedFiles={selectedFiles}
                onFilesSelected={handleFileSelect}
                onRemoveFile={removeFile}
            />
        </form>
    );
}