import PackageForm from "./components/PackageForm";

export default function AddPackage() {
  return (
    <main className="w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            One-Day & Multi-Day Tour Ad Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct bookings originating from specific published tour package advertisements.
          </p>
        </div>
      </div>

      {/* Package Form Component */}
      <PackageForm />
    </main>
  );
}