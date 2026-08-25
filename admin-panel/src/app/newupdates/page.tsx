import AvailabilityManager from "./components/AvailabilityManager";

export default function NewUpdates() {
  return (
    <main className="w-full py-8 px-4 sm:px-6 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tour Availability & Date Controls
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage closed booking dates for web applications and client calendars.
          </p>
        </div>
      </div>

      {/* Render Component */}
      <AvailabilityManager />
    </main>
  );
}