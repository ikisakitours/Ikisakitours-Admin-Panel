"use client";

import { useState } from "react";
import { blogService } from "@/services/blog.service";
import { Save, Image as ImageIcon, X } from "lucide-react";

interface BlogFormProps {
  onSuccess?: () => void;
}

export default function BlogForm({ onSuccess }: BlogFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isCustomSlug, setIsCustomSlug] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        summary: "",
        category: "",
        readTime: "",
        author: "",
        blog: "",
    });

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

            // 1. Upload files to Cloudflare R2 first
            if (selectedFiles.length > 0) {
                imageUrls = await blogService.uploadImages(selectedFiles, "blogs");
            }

            // 2. Submit pure JSON containing R2 image URLs & metadata
            const blogData = {
                title: formData.title,
                slug: formData.slug || slugify(formData.title),
                summary: formData.summary,
                category: formData.category,
                readTime: formData.readTime,
                author: formData.author,
                blog: formData.blog,
                images: imageUrls,
            };

            const newPost = await blogService.createBlog(blogData);
            alert(`Blog created successfully! ID: ${newPost.id}`);

            // Reset form
            setSelectedFiles([]);
            setIsCustomSlug(false);
            setFormData({
                title: "",
                slug: "",
                summary: "",
                category: "",
                readTime: "",
                author: "",
                blog: "",
            });
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-lg font-bold">Create Blog Post</h2>
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
                        placeholder="e.g. Getting Started with Next.js & NestJS"
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
                        placeholder="getting-started-with-nextjs-nestjs"
                    />
                </div>
            </div>

            {/* Author, Category, Read Time Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold mb-1">Author</label>
                    <input
                        type="text"
                        required
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold mb-1">Category</label>
                    <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Travel, Engineering"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold mb-1">Read Time</label>
                    <input
                        type="text"
                        required
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. 5 min read"
                    />
                </div>
            </div>

            {/* Summary */}
            <div>
                <label className="block text-xs font-semibold mb-1">Summary / Excerpt</label>
                <textarea
                    rows={2}
                    required
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Brief overview of the blog post for preview cards..."
                />
            </div>

            {/* Images */}
            <div>
                <label className="block text-xs font-semibold mb-1">Images</label>
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
                                {file.name}
                                <button type="button" onClick={() => removeFile(idx)}>
                                    <X className="w-3 h-3 text-red-500" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div>
                <label className="block text-xs font-semibold mb-1">Blog Content</label>
                <textarea
                    rows={8}
                    required
                    value={formData.blog}
                    onChange={(e) => setFormData({ ...formData, blog: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Write your blog content here..."
                />
            </div>
        </form>
    );
}