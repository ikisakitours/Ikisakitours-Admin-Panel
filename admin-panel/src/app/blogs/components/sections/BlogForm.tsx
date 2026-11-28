"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { blogService, BlogPayload } from "@/services/blog.service";
import { Save, Plus } from "lucide-react";
import { useFormDraft } from "@/hooks/useFormDraft";
import { DraftRecoveryBanner } from "@/components/DraftRecoveryBanner";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";
import { FormReadinessDrawer, FormReadinessItem } from "@/components/FormReadinessDrawer";
import { formatBackendErrorMessage } from "@/utils/errorHelper";
import JsonImporter from "./JsonImporter";
import MultilingualEditor from "./MultilingualEditor";
import ImageUploader from "./ImageUploader";

interface BlogFormProps {
    initialData?: BlogPayload | null;
    onSuccess?: () => void;
    onBlogCreated?: () => void;
    hideImageUpload?: boolean;
}

export default function BlogForm({
    initialData,
    onSuccess,
    onBlogCreated,
    hideImageUpload = false,
}: BlogFormProps) {
    const isEditMode = Boolean(initialData?.id);

    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>(() => initialData?.images || []);
    const [isCustomSlug, setIsCustomSlug] = useState<boolean>(() => Boolean(initialData?.slug));

    // Toast Notification System
    const [toast, setToast] = useState<AdminToastState | null>(null);
    const notify = useCallback((message: string, variant: ToastVariant = "info") => {
        setToast({ id: Date.now(), message, variant });
    }, []);

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Dynamic language management
    const [activeLang, setActiveLang] = useState<string>("en");
    const [availableLanguages, setAvailableLanguages] = useState<string[]>(() => {
        if (initialData) {
            const langs = new Set<string>(["en", "ja"]);
            const checkObj = (obj?: Record<string, any>) => {
                if (obj) Object.keys(obj).forEach((k) => { if (k.length <= 5) langs.add(k); });
            };
            checkObj(initialData.title);
            checkObj(initialData.summary);
            checkObj(initialData.category);
            checkObj(initialData.readTime);
            checkObj(initialData.blog);
            return Array.from(langs);
        }
        return ["en", "ja"];
    });

    const [formData, setFormData] = useState<{
        title: Record<string, string>;
        slug: string;
        summary: Record<string, string>;
        category: Record<string, string>;
        readTime: Record<string, string>;
        author: string;
        blog: Record<string, string>;
    }>(() => ({
        title: { en: "", ja: "", ...(initialData?.title || {}) },
        slug: initialData?.slug || "",
        summary: { en: "", ja: "", ...(initialData?.summary || {}) },
        category: { en: "", ja: "", ...(initialData?.category || {}) },
        readTime: { en: "", ja: "", ...(initialData?.readTime || {}) },
        author: initialData?.author || "",
        blog: { en: "", ja: "", ...(initialData?.blog || {}) },
    }));

    // Crash-resilient draft auto-save and recovery
    const draftKey = isEditMode && initialData?.id
        ? `ikisaki_draft_blog_edit_${initialData.id}`
        : "ikisaki_draft_blog_new";

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
    } = useFormDraft<typeof formData>({
        storageKey: draftKey,
        formData,
        setFormData: (restored) => {
            const langs = new Set<string>(["en", "ja"]);
            if (restored.title && typeof restored.title === "object") {
                Object.keys(restored.title).forEach((k) => {
                    if (k.length <= 5) langs.add(k);
                });
            }
            setAvailableLanguages(Array.from(langs));
            setFormData(restored);
        },
    });

    // Sync whenever initialData arrives (e.g. async fetch in EditBlogPage)
    const prevInitialDataRef = useRef<BlogPayload | null | undefined>(undefined);
    useEffect(() => {
        if (initialData && initialData !== prevInitialDataRef.current) {
            prevInitialDataRef.current = initialData;
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
            setIsCustomSlug(Boolean(initialData.slug));
            setFormData({
                title: { en: "", ja: "", ...(initialData.title || {}) },
                slug: initialData.slug || "",
                summary: { en: "", ja: "", ...(initialData.summary || {}) },
                category: { en: "", ja: "", ...(initialData.category || {}) },
                readTime: { en: "", ja: "", ...(initialData.readTime || {}) },
                author: initialData.author || "",
                blog: { en: "", ja: "", ...(initialData.blog || {}) },
            });
            setExistingImages(initialData.images || []);
            setSelectedFiles([]);
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
            const currentTotal = existingImages.length + selectedFiles.length;
            const remainingSlots = Math.max(0, 6 - currentTotal);
            const incoming = Array.from(e.target.files).slice(0, remainingSlots);
            if (incoming.length > 0) {
                setSelectedFiles((prev) => [...prev, ...incoming]);
            }
            e.target.value = "";
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Form Readiness checklist tracking every single blog field
    const readinessItems: FormReadinessItem[] = [
        {
            id: "blog_title_en",
            label: "Title (English)",
            isComplete: Boolean(formData.title?.en?.trim()),
            elementId: "blog_input_title",
            targetLang: "en",
            hint: "English blog article headline",
        },
        {
            id: "blog_title_ja",
            label: "Title (Japanese)",
            isComplete: Boolean(formData.title?.ja?.trim()),
            elementId: "blog_input_title",
            targetLang: "ja",
            hint: "Japanese blog article headline",
        },
        {
            id: "blog_slug",
            label: "URL Slug",
            isComplete: Boolean(formData.slug?.trim()),
            elementId: "blog_input_slug",
            hint: "SEO-friendly article slug",
        },
        {
            id: "blog_author",
            label: "Author",
            isComplete: Boolean(formData.author?.trim()),
            elementId: "blog_input_author",
            hint: "Article author name",
        },
        {
            id: "blog_category_en",
            label: "Category (English)",
            isComplete: Boolean(formData.category?.en?.trim()),
            elementId: "blog_input_category",
            targetLang: "en",
            hint: "Travel category in English",
        },
        {
            id: "blog_category_ja",
            label: "Category (Japanese)",
            isComplete: Boolean(formData.category?.ja?.trim()),
            elementId: "blog_input_category",
            targetLang: "ja",
            hint: "Travel category in Japanese",
        },
        {
            id: "blog_read_time_en",
            label: "Read Time (English)",
            isComplete: Boolean(formData.readTime?.en?.trim()),
            elementId: "blog_input_read_time",
            targetLang: "en",
            hint: "e.g. 5 min read",
        },
        {
            id: "blog_read_time_ja",
            label: "Read Time (Japanese)",
            isComplete: Boolean(formData.readTime?.ja?.trim()),
            elementId: "blog_input_read_time",
            targetLang: "ja",
            hint: "e.g. 読了時間 5分",
        },
        {
            id: "blog_summary_en",
            label: "Summary / Excerpt (English)",
            isComplete: Boolean(formData.summary?.en?.trim()),
            elementId: "blog_input_summary",
            targetLang: "en",
            hint: "Preview excerpt for blog card & meta description",
        },
        {
            id: "blog_summary_ja",
            label: "Summary / Excerpt (Japanese)",
            isComplete: Boolean(formData.summary?.ja?.trim()),
            elementId: "blog_input_summary",
            targetLang: "ja",
            hint: "Japanese excerpt for preview cards",
        },
        {
            id: "blog_content_en",
            label: "Blog Content (English)",
            isComplete: Boolean(formData.blog?.en?.trim()),
            elementId: "blog_input_content",
            targetLang: "en",
            hint: "Full story and insider advice in English",
        },
        {
            id: "blog_content_ja",
            label: "Blog Content (Japanese)",
            isComplete: Boolean(formData.blog?.ja?.trim()),
            elementId: "blog_input_content",
            targetLang: "ja",
            hint: "Full story and travel advice in Japanese",
        },
        {
            id: "blog_images",
            label: "Article Images (≥ 1 Photo)",
            isComplete: existingImages.length + selectedFiles.length > 0,
            elementId: "blog_input_images",
            hint: "Featured banner and gallery photos",
        },
    ];

    // Track any additional custom languages
    availableLanguages.forEach((lang) => {
        if (lang !== "en" && lang !== "ja") {
            readinessItems.push({
                id: `blog_title_${lang}`,
                label: `Title (${lang.toUpperCase()})`,
                isComplete: Boolean(formData.title?.[lang]?.trim()),
                elementId: "blog_input_title",
                targetLang: lang,
                hint: `Blog headline in ${lang.toUpperCase()}`,
            });
            readinessItems.push({
                id: `blog_content_${lang}`,
                label: `Content (${lang.toUpperCase()})`,
                isComplete: Boolean(formData.blog?.[lang]?.trim()),
                elementId: "blog_input_content",
                targetLang: lang,
                hint: `Blog content in ${lang.toUpperCase()}`,
            });
        }
    });

    const handleNavigateToField = (item: FormReadinessItem) => {
        if (item.targetLang && availableLanguages.includes(item.targetLang)) {
            setActiveLang(item.targetLang);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const englishTitle = formData.title["en"]?.trim() || Object.values(formData.title)[0]?.trim() || "";
        if (!englishTitle) {
            notify("Please enter a blog title (English is required).", "warning");
            return;
        }

        const finalSlug = slugify(formData.slug.trim() ? formData.slug : englishTitle) || `blog-${Date.now()}`;
        if (!finalSlug) {
            notify("Blog slug is required.", "warning");
            return;
        }

        if (existingImages.length + selectedFiles.length === 0) {
            notify("Please attach at least one photo for this blog article.", "warning");
            return;
        }

        setLoading(true);

        try {
            let newUploadedUrls: string[] = [];
            if (selectedFiles.length > 0) {
                newUploadedUrls = await blogService.uploadImages(selectedFiles, "blog-images");
            }

            const finalImages = [...existingImages, ...newUploadedUrls];

            const blogPayload: BlogPayload = {
                title: formData.title,
                slug: finalSlug,
                summary: formData.summary,
                category: formData.category,
                readTime: formData.readTime,
                author: formData.author,
                blog: formData.blog,
                images: finalImages,
            };

            if (isEditMode && initialData?.id) {
                await blogService.updateBlog(initialData.id, blogPayload);
                clearDraft();
                notify("Blog article updated successfully!", "success");
            } else {
                const newPost = await blogService.createBlog(blogPayload);
                clearDraft();
                notify(`Blog article created successfully! ID: ${newPost.id}`, "success");

                setSelectedFiles([]);
                setExistingImages([]);
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
            notify(formatBackendErrorMessage(err), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-8 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <AdminToast toast={toast} onDismiss={() => setToast(null)} />
            <DraftRecoveryBanner
                hasDraft={hasDraft}
                draftSavedAt={draftSavedAt}
                onRestore={restoreDraft}
                onDiscard={discardDraft}
                lastSaved={lastSaved}
                isSaving={isSaving}
                onSaveNow={saveDraftNow}
                entityName={isEditMode ? "Blog Edit" : "New Blog Post"}
                showLeaveConfirm={showLeaveConfirm}
                onCancelLeave={cancelLeave}
                onConfirmLeave={confirmLeave}
            />

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

            {/* Component 3: Image Uploader (Hidden when hideImageUpload is true) */}
            {!hideImageUpload && (
                <ImageUploader
                    existingImages={existingImages}
                    onRemoveExisting={handleRemoveExistingImage}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    disabled={loading}
                />
            )}

            {/* Form Completion & Readiness Assistant */}
            <FormReadinessDrawer
                items={readinessItems}
                entityTitle={isEditMode ? "Blog Article (Edit)" : "Blog Article"}
                onNavigateToField={handleNavigateToField}
            />
        </form>
    );
}