"use client";

import { useEffect, useState, useCallback } from "react";
import { blogService } from "@/services/blog.service";
import { Trash2, Clock, Tag, User, Globe } from "lucide-react";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";

interface BlogPreview {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  readTime: string;
  author: string;
  language: string;
  previewImage: string | null;
  likes: number;
  createdAt: string;
}

interface BlogListProps {
  refreshKey?: number; // Used to re-fetch when a new blog is published
}

export default function BlogList({ refreshKey }: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [blogToDelete, setBlogToDelete] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<AdminToastState | null>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogService.getPreviews(selectedLang);
      setBlogs(data);
    } catch (err: any) {
      notify(`Failed to load blogs: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchBlogs();
    });
  }, [refreshKey, selectedLang]);

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      setDeletingId(blogToDelete.id);
      await blogService.deleteBlog(blogToDelete.id);
      setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id));
      notify("Blog article deleted successfully!", "success");
      setBlogToDelete(null);
    } catch (err: any) {
      notify(`Failed to delete blog: ${err.message}`, "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
      {/* Header with Title and Language Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">All Published Blogs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your live blog posts or remove outdated articles.
          </p>
        </div>

        {/* Language Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-500" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs border rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
          >
            <option value="en">English (en)</option>
            <option value="ja">Japanese (ja)</option>
            <option value="fr">French (fr)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading blog posts...
        </div>
      ) : blogs.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          No blog posts found for <span className="font-semibold uppercase">{selectedLang}</span>. Create your first post using the form above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex flex-col justify-between border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50 hover:shadow-sm transition-shadow"
            >
              {/* Image Preview */}
              {blog.previewImage ? (
                <img
                  src={blog.previewImage}
                  alt={blog.title}
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="w-full h-36 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  No Preview Image
                </div>
              )}

              {/* Metadata & Content */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 gap-2 mb-1">
                    <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                      <Tag className="w-3 h-3" />
                      {blog.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.readTime}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {blog.summary}
                  </p>
                </div>

                {/* Footer / Author & Delete */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between mt-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <User className="w-3 h-3" />
                    {blog.author}
                  </span>

                  <button
                    type="button"
                    disabled={deletingId === blog.id}
                    onClick={() => setBlogToDelete({ id: blog.id, title: blog.title })}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unified Luxury AdminDeleteModal */}
      <AdminDeleteModal
        isOpen={Boolean(blogToDelete)}
        title="Delete Blog Article"
        description="Are you sure you want to permanently delete this blog post? This action will remove it from the database and cannot be undone."
        itemTitle={blogToDelete?.title}
        confirmLabel="Delete Blog"
        loading={Boolean(deletingId)}
        onClose={() => setBlogToDelete(null)}
        onConfirm={confirmDelete}
      />

      {/* Executive Toast Notification */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}