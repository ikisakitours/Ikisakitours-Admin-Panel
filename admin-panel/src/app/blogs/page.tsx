import BlogForm from "./components/BlogForm";

export default function AddPackage() {
  return (
    <main className="w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Blog Post
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish new travel stories, guides, and updates for your audience.
          </p>
        </div>
      </div>

      {/* Package Form Component */}
      <BlogForm/>
    </main>
  );
}