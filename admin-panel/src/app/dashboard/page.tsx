import AnalyticsDashboard from "./components/AnalyticsDashboard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <AnalyticsDashboard />
      </div>
    </main>
  );
}