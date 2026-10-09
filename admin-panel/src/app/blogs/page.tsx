"use client";

import { useState } from "react";
import BlogForm from "./components/BlogForm";
import BlogList from "./components/BlogList";

export default function BlogsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBlogCreated = () => {
    // Incrementing key forces BlogList to refetch fresh data
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="w-full py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Blogs Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish new travel articles and manage existing content.
        </p>
      </div>

      {/* Creation Form */}
      <BlogForm onSuccess={handleBlogCreated} />

      {/* Live Previews & Delete List */}
      <BlogList refreshKey={refreshKey} />
    </main>
  );
}