"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  RefreshCw,
  Search,
  Table2,
  LayoutGrid,
  Filter,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { FaqItem, faqService } from "@/services/faq.service";
import FaqList from "./components/FaqList";
import { FaqTable } from "./components/FaqTable";
import { FaqSummaryBar } from "./components/FaqSummaryBar";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";

export default function ManageFaqsPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [translationFilter, setTranslationFilter] = useState<"all" | "bilingual" | "en-only" | "ja-only">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "live" | "hidden">("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Deletion Modal & State
  const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await faqService.getAdminFaqs();
      setFaqs(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load FAQs");
      notify(err.message || "Failed to load FAQs", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Extract all distinct categories for filter dropdown
  const distinctCategories = useMemo(() => {
    const set = new Set<string>();
    for (const f of faqs) {
      const en = f.category?.en?.trim();
      if (en) set.add(en);
    }
    return Array.from(set).sort();
  }, [faqs]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return faqs.filter((faq) => {
      // 1. Search Query
      if (q) {
        const enQ = (faq.question?.en || "").toLowerCase();
        const jaQ = (faq.question?.ja || "").toLowerCase();
        const enA = (faq.answer?.en || "").toLowerCase();
        const jaA = (faq.answer?.ja || "").toLowerCase();
        const enCat = (faq.category?.en || "").toLowerCase();
        const jaCat = (faq.category?.ja || "").toLowerCase();
        const matches =
          enQ.includes(q) ||
          jaQ.includes(q) ||
          enA.includes(q) ||
          jaA.includes(q) ||
          enCat.includes(q) ||
          jaCat.includes(q);
        if (!matches) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== "all") {
        const cat = faq.category?.en?.trim();
        if (cat !== categoryFilter) return false;
      }

      // 3. Translation Coverage Filter
      const hasEn = Boolean(faq.question?.en?.trim() && faq.answer?.en?.trim());
      const hasJa = Boolean(faq.question?.ja?.trim() && faq.answer?.ja?.trim());

      if (translationFilter === "bilingual" && !(hasEn && hasJa)) return false;
      if (translationFilter === "en-only" && (!hasEn || hasJa)) return false;
      if (translationFilter === "ja-only" && (!hasJa || hasEn)) return false;

      // 4. Visibility Filter
      const isLive = faq.isLive !== false;
      if (visibilityFilter === "live" && !isLive) return false;
      if (visibilityFilter === "hidden" && isLive) return false;

      return true;
    });
  }, [faqs, searchQuery, categoryFilter, translationFilter, visibilityFilter]);

  // Toggle Visibility Action
  const handleToggleVisibility = async (faq: FaqItem) => {
    if (!faq.id) return;
    const currentIsLive = faq.isLive !== false;
    const newIsLive = !currentIsLive;

    try {
      setUpdatingId(faq.id);
      await faqService.toggleVisibility(faq.id, newIsLive);
      setFaqs((prev) =>
        prev.map((item) => (item.id === faq.id ? { ...item, isLive: newIsLive } : item))
      );
      notify(
        newIsLive
          ? "FAQ is now LIVE in public Help Center."
          : "FAQ is now HIDDEN (draft mode).",
        newIsLive ? "success" : "info"
      );
    } catch (err: any) {
      notify(err.message || "Failed to update FAQ visibility", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Execute Deletion
  const confirmDelete = async () => {
    if (!faqToDelete) return;

    try {
      setDeletingId(faqToDelete.id);
      await faqService.deleteFaq(faqToDelete.id);
      setFaqs((prev) => prev.filter((item) => item.id !== faqToDelete.id));
      notify("FAQ question successfully deleted.", "info");
      setFaqToDelete(null);
    } catch (err: any) {
      notify(err.message || "Failed to delete FAQ", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "all" ||
    translationFilter !== "all" ||
    visibilityFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setTranslationFilter("all");
    setVisibilityFilter("all");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Manage FAQs &amp; Help
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create, curate, and localize multilingual questions and answers for guests.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                title="Cards View"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
            </div>

            {/* Refresh */}
            <button
              type="button"
              disabled={loading}
              onClick={fetchFaqs}
              title="Reload FAQs"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Create New Link */}
            <Link
              href="/faqs"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </Link>
          </div>
        </div>

        {/* Executive KPI Stat Bar */}
        <FaqSummaryBar faqs={faqs} />

        {/* Filter & Search Bar */}
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, answers, or categories..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Categories ({faqs.length})</option>
                {distinctCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Translation Status Filter */}
              <select
                aria-label="Filter by translation coverage"
                value={translationFilter}
                onChange={(e) => setTranslationFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Translations</option>
                <option value="bilingual">Fully Bilingual (EN + JA)</option>
                <option value="en-only">English Only</option>
                <option value="ja-only">Japanese Only</option>
              </select>

              {/* Visibility Filter */}
              <select
                aria-label="Filter by visibility"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Visibility</option>
                <option value="live">Live on Site</option>
                <option value="hidden">Hidden / Drafts</option>
              </select>

              {/* Reset Filter Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchFaqs}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : viewMode === "table" ? (
          <FaqTable
            faqs={filteredFaqs}
            loading={loading}
            deletingId={deletingId}
            updatingId={updatingId}
            onDelete={(faq) => setFaqToDelete(faq)}
            onToggleVisibility={handleToggleVisibility}
          />
        ) : (
          <FaqList
            faqs={filteredFaqs}
            deletingId={deletingId}
            updatingId={updatingId}
            onDelete={(faq) => setFaqToDelete(faq)}
            onToggleVisibility={handleToggleVisibility}
          />
        )}

        {/* Unified Luxury AdminDeleteModal */}
        <AdminDeleteModal
          isOpen={Boolean(faqToDelete)}
          title="Delete FAQ Question?"
          description="This action will permanently remove this question from your public FAQ knowledge base."
          itemTitle={faqToDelete?.question?.en || faqToDelete?.question?.ja || "Untitled Question"}
          itemSubtitle={faqToDelete?.category?.en ? `Category: ${faqToDelete.category.en}` : undefined}
          loading={Boolean(deletingId)}
          onClose={() => setFaqToDelete(null)}
          onConfirm={confirmDelete}
        />

        {/* Global AdminToast */}
        <AdminToast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </div>
  );
}
