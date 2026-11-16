"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaqItem, faqService } from "@/services/faq.service";
import FaqList from "./components/FaqList";

export default function ManageFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await faqService.getAdminFaqs();
      setFaqs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Remove deleted FAQ from state instantly without re-fetching
  const handleFaqDeleted = (deletedId: string) => {
    setFaqs((prev) => prev.filter((faq) => faq.id !== deletedId));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manage FAQs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, edit, and organize multilingual frequently asked questions.
          </p>
        </div>
        <Link
          href="/managefaqs/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          + Create New FAQ
        </Link>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Loading FAQs...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={fetchFaqs}
            className="mt-3 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : (
        <FaqList faqs={faqs} onFaqDeleted={handleFaqDeleted} />
      )}
    </div>
  );
}