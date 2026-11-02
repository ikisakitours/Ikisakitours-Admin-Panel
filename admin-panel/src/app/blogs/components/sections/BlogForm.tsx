"use client";

import { useState } from "react";
import { blogService } from "@/services/blog.service";
import { Save } from "lucide-react";
import JsonImporter from "./JsonImporter";
import MultilingualEditor from "./MultilingualEditor";
import ImageUploader from "./ImageUploader";

interface BlogFormProps {
    onSuccess?: () => void;
}

export default function BlogForm({ onSuccess }: BlogFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [activeLang, setActiveLang] = useState<string>("en");

    const [formData, setFormData] = useState({
        title: { en: "", ja: "" } as Record<string, string>,
        slug: "",
        summary: { en: "", ja: "" } as Record<string, string>,
        category: "",
        readTime: { en: "", ja: "" } as Record<string, string>,
        author: "",
        blog: { en: "", ja: "" } as Record<string, string>,
    });

    const slugify = (text: string) => {
        return text
            .trim()
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleLoadJson = (jsonContent: any) => {
        setFormData((prev) => ({
            ...prev,
            slug: jsonContent.slug || prev.slug,
            category: jsonContent.category || prev.category,
            author: jsonContent.author || prev.author,
            title: typeof jsonContent.title === "object" ? jsonContent.title : { en: jsonContent.title || "" },
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
                images: imageUrls,
            };

            const newPost = await blogService.createBlog(blogPayload);
            alert(`Blog created successfully! ID: ${newPost.id}`);

            if (onSuccess) {
                onSuccess();
            }

            setSelectedFiles([]);
            setIsCustomSlug(false);
            setFormData({
                title: { en: "", ja: "" },
                slug: "",
                summary: { en: "", ja: "" },
                category: "",
                readTime: { en: "", ja: "" },
                author: "",
                blog: { en: "", ja: "" },
            });
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b">
                <div>
                    <h2 className="text-lg font-bold">Create Multilingual Blog Post</h2>
                    <p className="text-xs text-slate-500">Upload a JSON data file or fill out fields manually.</p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Publish"}
                </button>
            </div>

            {/* Component 1: JSON Importer */}
            <JsonImporter onLoadJson={handleLoadJson} />

            {/* Component 2: Multilingual Editor */}
            <MultilingualEditor
                formData={formData}
                onChange={handleFieldChange}
                activeLang={activeLang}
                setActiveLang={setActiveLang}
                handleSlugChange={handleSlugChange}
                handleTitleChange={handleTitleChange}
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