"use client";

import { useState } from "react";
import { blogService } from "@/services/blog.service";
import { Save, Image as ImageIcon, X } from "lucide-react";

export default function BlogForm() {
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        blog: "",
    });

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

            // 2. Submit pure JSON containing R2 image URLs
            const blogData = {
                title: formData.title,
                author: formData.author,
                blog: formData.blog,
                images: imageUrls,
            };

            const newPost = await blogService.createBlog(blogData);
            alert(`Blog created successfully! ID: ${newPost.id}`);

            // Reset
            setSelectedFiles([]);
            setFormData({ title: "", author: "", blog: "" });
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

            <div>
                <label className="block text-xs font-semibold mb-1">Title</label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold mb-1">Author</label>
                <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

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

            <div>
                <label className="block text-xs font-semibold mb-1">Blog Content</label>
                <textarea
                    rows={6}
                    required
                    value={formData.blog}
                    onChange={(e) => setFormData({ ...formData, blog: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
        </form>
    );
}