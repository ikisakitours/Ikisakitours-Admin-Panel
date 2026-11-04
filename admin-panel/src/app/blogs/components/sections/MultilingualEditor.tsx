"use client";

interface MultilingualEditorProps {
    formData: {
        title: Record<string, string>;
        slug: string;
        summary: Record<string, string>;
        category: Record<string, string>;
        readTime: Record<string, string>;
        author: string;
        blog: Record<string, string>;
    };
    onChange: (field: string, value: any) => void;
    activeLang: string;
    setActiveLang: (lang: string) => void;
    handleSlugChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTitleChange: (val: string) => void;
    availableLanguages?: string[];
}

export default function MultilingualEditor({
    formData,
    onChange,
    activeLang,
    setActiveLang,
    handleSlugChange,
    handleTitleChange,
    availableLanguages,
}: MultilingualEditorProps) {
    // Use passed availableLanguages prop, or fallback to keys from formData.title
    const availableLangs = availableLanguages && availableLanguages.length > 0
        ? availableLanguages
        : (Object.keys(formData.title).length > 0 ? Object.keys(formData.title) : ["en", "ja"]);

    return (
        <div className="space-y-6">
            {/* Dynamic Language Switcher Tabs based on available languages */}
            <div className="flex items-center justify-between border-b pb-2">
                <div className="flex gap-2 flex-wrap">
                    {availableLangs.map((lang) => (
                        <button
                            type="button"
                            key={lang}
                            onClick={() => setActiveLang(lang)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg uppercase transition-colors ${activeLang === lang
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-slate-400">
                    Editing language: <strong className="uppercase text-slate-600">{activeLang}</strong>
                </span>
            </div>

            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold mb-1">Title ({activeLang.toUpperCase()})</label>
                    <input
                        type="text"
                        required={activeLang === "en"}
                        value={formData.title[activeLang] || ""}
                        onChange={(e) => handleTitleChange(e.target.value)}
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
                        onChange={(e) => onChange("author", e.target.value)}
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold mb-1">Category ({activeLang.toUpperCase()})</label>
                    <input
                        type="text"
                        required={activeLang === "en"}
                        value={formData.category[activeLang] || ""}
                        onChange={(e) =>
                            onChange("category", {
                                ...formData.category,
                                [activeLang]: e.target.value,
                            })
                        }
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Travel, Engineering"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold mb-1">Read Time ({activeLang.toUpperCase()})</label>
                    <input
                        type="text"
                        required={activeLang === "en"}
                        value={formData.readTime[activeLang] || ""}
                        onChange={(e) =>
                            onChange("readTime", {
                                ...formData.readTime,
                                [activeLang]: e.target.value,
                            })
                        }
                        className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. 5 min read"
                    />
                </div>
            </div>

            {/* Summary */}
            <div>
                <label className="block text-xs font-semibold mb-1">Summary / Excerpt ({activeLang.toUpperCase()})</label>
                <textarea
                    rows={2}
                    required={activeLang === "en"}
                    value={formData.summary[activeLang] || ""}
                    onChange={(e) =>
                        onChange("summary", {
                            ...formData.summary,
                            [activeLang]: e.target.value,
                        })
                    }
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Brief overview of the blog post for preview cards..."
                />
            </div>

            {/* Content */}
            <div>
                <label className="block text-xs font-semibold mb-1">Blog Content ({activeLang.toUpperCase()})</label>
                <textarea
                    rows={8}
                    required={activeLang === "en"}
                    value={formData.blog[activeLang] || ""}
                    onChange={(e) =>
                        onChange("blog", {
                            ...formData.blog,
                            [activeLang]: e.target.value,
                        })
                    }
                    className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    placeholder="Write your blog content here..."
                />
            </div>
        </div>
    );
}