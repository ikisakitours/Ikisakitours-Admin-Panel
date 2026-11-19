"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Inbox,
  LayoutGrid,
  RefreshCw,
  Search,
  Sparkles,
  Table2,
  X,
} from "lucide-react";
import { contactService, type ContactItem } from "@/services/contact.service";
import type { ContactInquiry } from "./types/contact.types";
import { ContactSummaryBar } from "./components/ContactSummaryBar";
import { ContactTable } from "./components/ContactTable";
import ContactInquiryCard from "./components/ContactInquiryCard";
import { ContactDetailsModal } from "./components/ContactDetailsModal";
import {
  AdminToast,
  type AdminToastState,
  type ToastVariant,
} from "@/components/AdminToast";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";
import {
  getDisplayContactReference,
  isNewContact,
  toLocalDateKey,
} from "./utils/contactFormatters";

type DatePreset = "all" | "new24h" | "today" | "last7d" | "last30d";
type SortOption = "newest" | "oldest";

export default function ContactPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Selection & Actions
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<AdminToastState | null>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contactService.getContacts();
      const formatted: ContactInquiry[] = (data || []).map((item: ContactItem) => ({
        id: item.id,
        inquiryType: item.inquiryType || "General Inquiry",
        fullName: item.fullName || "Guest",
        email: item.email || "—",
        phone: item.phone || "—",
        subject: item.subject || "No Subject",
        message: item.message || "",
        tourInterest: item.tourInterest,
        status: item.status || "pending",
        createdAt: item.createdAt || item.date || new Date().toISOString(),
      }));
      setInquiries(formatted);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load contact inquiries.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchInquiries();
    });
  }, [fetchInquiries]);

  // Extract all distinct inquiry types from live data
  const distinctTypes = useMemo(() => {
    const set = new Set<string>();
    for (const inq of inquiries) {
      if (inq.inquiryType && inq.inquiryType.trim()) {
        set.add(inq.inquiryType.trim());
      }
    }
    return Array.from(set);
  }, [inquiries]);

  const new24hCount = useMemo(
    () => inquiries.filter((i) => isNewContact(i.createdAt, 24)).length,
    [inquiries]
  );

  const filteredInquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();
    const todayKey = toLocalDateKey(now.toISOString()) || "";
    const nowMs = now.getTime();

    const filtered = inquiries.filter((inq) => {
      if (typeFilter !== "all" && inq.inquiryType.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      if (statusFilter !== "all" && (inq.status || "pending").toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Quick Recency
      if (datePreset !== "all") {
        const createdKey = toLocalDateKey(inq.createdAt);
        const createdMs = inq.createdAt ? new Date(inq.createdAt).getTime() : NaN;

        if (datePreset === "new24h" && !isNewContact(inq.createdAt, 24)) return false;
        if (datePreset === "today" && createdKey !== todayKey) return false;
        if (datePreset === "last7d") {
          if (Number.isNaN(createdMs) || nowMs - createdMs > 7 * 24 * 60 * 60 * 1000) return false;
        }
        if (datePreset === "last30d") {
          if (Number.isNaN(createdMs) || nowMs - createdMs > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      // Custom Date Range
      if (dateFrom || dateTo) {
        const dateKey = toLocalDateKey(inq.createdAt);
        if (!dateKey) return false;
        if (dateFrom && dateKey < dateFrom) return false;
        if (dateTo && dateKey > dateTo) return false;
      }

      if (q) {
        const ref = getDisplayContactReference(inq).toLowerCase();
        const name = (inq.fullName || "").toLowerCase();
        const email = (inq.email || "").toLowerCase();
        const phone = (inq.phone || "").toLowerCase();
        const subject = (inq.subject || "").toLowerCase();
        const message = (inq.message || "").toLowerCase();
        const inqType = (inq.inquiryType || "").toLowerCase();

        const matches =
          ref.includes(q) ||
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          subject.includes(q) ||
          message.includes(q) ||
          inqType.includes(q);
        if (!matches) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [inquiries, searchQuery, typeFilter, statusFilter, datePreset, dateFrom, dateTo, sortBy]);

  const handleUpdated = useCallback((updated: ContactInquiry) => {
    setInquiries((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
    setSelectedInquiry((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      setUpdatingId(inquiryId);
      await contactService.updateContactStatus(inquiryId, newStatus);
      handleUpdated({ id: inquiryId, status: newStatus } as ContactInquiry);
      notify(`Inquiry updated to ${newStatus.toUpperCase()}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update inquiry status";
      notify(msg, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const [inquiryToDelete, setInquiryToDelete] = useState<ContactInquiry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const promptDeleteInquiry = async (inquiry: ContactInquiry) => {
    setInquiryToDelete(inquiry);
  };

  const confirmDeleteInquiry = async () => {
    if (!inquiryToDelete) return;
    const ref = getDisplayContactReference(inquiryToDelete);
    try {
      setDeleteLoading(true);
      await contactService.deleteContact(inquiryToDelete.id);
      setInquiries((prev) => prev.filter((i) => i.id !== inquiryToDelete.id));
      if (selectedInquiry?.id === inquiryToDelete.id) setSelectedInquiry(null);
      notify(`Deleted inquiry ${ref}`, "info");
      setInquiryToDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete inquiry";
      notify(msg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    datePreset !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    sortBy !== "newest";

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDatePreset("all");
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Contact Inquiries &amp; Messages
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review guest inquiries from the public website, manage follow-up states, and dispatch email replies.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Table / Card View Switcher */}
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
                title="Card View"
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

            <button
              type="button"
              disabled={loading}
              onClick={() => void fetchInquiries()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-700 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Top KPI & Summary Strip */}
        <ContactSummaryBar
          inquiries={inquiries}
          selectedStatus={statusFilter}
          onSelectStatus={(st) => setStatusFilter(st)}
          selectedType={typeFilter}
          onSelectType={(tp) => setTypeFilter(tp)}
        />

        {/* Search, Filter Toolbar */}
        <div className="rounded-2xl bg-white border border-slate-200 mb-5 shadow-2xs overflow-hidden">
          {/* Top Row: Search + Type + Status + Sort Dropdowns */}
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, guest, subject, email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8.5 pr-8 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                aria-label="Filter by inquiry type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer transition-colors"
              >
                <option value="all">All Inquiry Types</option>
                {distinctTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="contacted">Contacted</option>
                <option value="completed">Resolved</option>
              </select>

              {/* Sort Order */}
              <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white pl-2.5 pr-1 transition-colors focus-within:border-emerald-500 focus-within:bg-white">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  aria-label="Sort inquiries"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent py-2 pr-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Row: Recency Pills + Date Picker */}
          <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            {/* Quick Recency Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "new24h", label: "New (24h)", badge: new24hCount },
                  { id: "today", label: "Today" },
                  { id: "last7d", label: "Last 7 Days" },
                  { id: "last30d", label: "Last 30 Days" },
                ] as { id: DatePreset; label: string; badge?: number }[]
              ).map((preset) => {
                const active = datePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setDatePreset(preset.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer border ${
                      active
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    {preset.id === "new24h" && (
                      <Sparkles
                        className={`w-3 h-3 ${active ? "text-emerald-100" : "text-emerald-600"}`}
                      />
                    )}
                    <span>{preset.label}</span>
                    {typeof preset.badge === "number" && preset.badge > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {preset.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-600">Date:</span>
                <input
                  type="date"
                  aria-label="Filter from date"
                  title="From date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent text-[11px] font-semibold text-slate-700 outline-none cursor-pointer"
                />
                <span className="text-[10px] font-bold text-slate-400">to</span>
                <input
                  type="date"
                  aria-label="Filter to date"
                  title="To date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent text-[11px] font-semibold text-slate-700 outline-none cursor-pointer"
                />
                {(dateFrom || dateTo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    title="Clear date range"
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Reset ({filteredInquiries.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 mb-5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">Error loading contact inquiries</span>
              {error}
            </div>
            <button
              type="button"
              onClick={() => void fetchInquiries()}
              className="ml-auto px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content: Table or Cards */}
        {!error && viewMode === "table" && (
          <ContactTable
            inquiries={filteredInquiries}
            loading={loading}
            updatingId={updatingId}
            deletingId={deletingId}
            onViewDetails={(inq) => setSelectedInquiry(inq)}
            onStatusChange={handleStatusChange}
            onDelete={promptDeleteInquiry}
            onCopyReference={(ref) => notify(`Copied reference ${ref}`, "info")}
          />
        )}

        {!error && viewMode === "cards" && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-56 rounded-2xl bg-white border border-slate-200 animate-pulse p-5"
                  />
                ))}
              </div>
            ) : filteredInquiries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInquiries.map((inquiry) => (
                  <ContactInquiryCard
                    key={inquiry.id}
                    {...inquiry}
                    onViewDetails={(inq) => setSelectedInquiry(inq)}
                    onStatusChange={handleStatusChange}
                    onDelete={promptDeleteInquiry}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-300">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No contact inquiries match your filters</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try clearing your search query or switching filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedInquiry && (
        <ContactDetailsModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onUpdated={handleUpdated}
          onNotify={notify}
        />
      )}

      {/* Unified Luxury Delete Modal */}
      <AdminDeleteModal
        isOpen={!!inquiryToDelete}
        title="Delete Contact Inquiry?"
        description="This will permanently delete this customer contact inquiry from the operations database. This action cannot be undone."
        itemTitle={inquiryToDelete ? `${getDisplayContactReference(inquiryToDelete)} — ${inquiryToDelete.fullName}` : undefined}
        itemSubtitle={inquiryToDelete ? `${inquiryToDelete.inquiryType} • ${inquiryToDelete.email} • ${inquiryToDelete.phone || "No Phone"}` : undefined}
        loading={deleteLoading}
        onClose={() => setInquiryToDelete(null)}
        onConfirm={confirmDeleteInquiry}
      />

      {/* Toast */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
