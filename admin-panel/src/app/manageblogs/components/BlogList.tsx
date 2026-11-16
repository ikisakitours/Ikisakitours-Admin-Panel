'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { blogService, BlogPayload } from '@/services/blog.service';
import { Edit2, Trash2, RefreshCw, Eye } from 'lucide-react';

interface BlogListItem extends BlogPayload {
  id: string;
}

export function BlogList() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogService.getAdminBlogs();
      // Safely filter and cast data so TypeScript knows every item has a valid id string
      setBlogs(data.filter((blog): blog is BlogListItem => Boolean(blog.id)));
    } catch (err: any) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resolveTitle = (titleField: any): string => {
    if (!titleField) return 'Untitled Blog';
    if (typeof titleField === 'string') return titleField;
    return titleField['en'] || Object.values(titleField)[0] || 'Untitled Blog';
  };

  const handleDelete = async (id: string, rawTitle: any) => {
    const displayTitle = resolveTitle(rawTitle);
    if (!confirm(`Are you sure you want to delete "${displayTitle}"?`)) return;

    setDeletingId(id);
    try {
      await blogService.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(`Failed to delete blog: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          All Stored Blogs ({blogs.length})
        </span>
        <button
          type="button"
          onClick={fetchBlogs}
          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-all cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-xs text-slate-500">Loading stored blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400">
          No blogs found. Create one above!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Title, Author & Slug</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {blogs.map((blog) => {
                const titleString = resolveTitle(blog.title);
                return (
                  <tr key={blog.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{titleString}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 font-medium">By {blog.author}</span>
                        <span className="text-[11px] font-normal text-slate-400 font-mono">
                          /{blog.slug}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <a
                        href={`https://www.ikisakitours.com/en/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                      <Link
                        href={`/manageblogs/${blog.id}/edit`}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer inline-block"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === blog.id}
                        onClick={() => handleDelete(blog.id, blog.title)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === blog.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}