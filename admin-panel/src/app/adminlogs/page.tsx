import AdminLogSection from "./components/AdminLogSection";


export default function Logs() {
  return (
    <div className="min-h-screen bg-slate-100/40 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            Admin Operations Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily work notes, driver/guide allocations, and tour updates.
          </p>
        </div>

        {/* Embedded Log Component */}
        <AdminLogSection />

      </div>
    </div>
  );
}