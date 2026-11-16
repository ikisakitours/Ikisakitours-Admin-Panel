'use client';

import { useState } from 'react';
import { BlogList } from './components/BlogList';
import BlogForm from '@/app/blogs/components/sections/BlogForm';
import { Plus } from 'lucide-react';

export default function ManageBlogsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBlogCreated = () => {
    setShowCreateForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Blogs</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create, edit, or delete multilingual blog posts across all languages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? 'Cancel' : 'Add New Blog'}
        </button>
      </div>

      {showCreateForm && (
        <BlogForm onBlogCreated={handleBlogCreated} />
      )}

      <BlogList key={refreshKey} />
    </div>
  );
}