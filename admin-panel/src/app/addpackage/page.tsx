import PackageFormWrapper from "./components/PackageFormWrapper";

export default function AddPackagePage() {
  return (
    <div className="w-full py-8 px-4 sm:px-6 space-y-6">
      {/* Page Title & Subtitle */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Tour Package Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create and configure comprehensive tour packages, attach Cloudflare R2 images, and map database destination snapshots.
        </p>
      </div>

      {/* Main Modular Form Wrapper */}
      <PackageFormWrapper />
    </div>
  );
}