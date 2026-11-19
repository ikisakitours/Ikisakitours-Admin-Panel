"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  LayoutGrid,
  RefreshCw,
  Search,
  Sparkles,
  Table2,
  X,
} from "lucide-react";
import {
  packageBookingService,
  type BookingStatus,
  type PackageBooking,
  type PaymentStatus,
} from "@/services/package-booking.service";
import { BookingsSummaryBar } from "./components/BookingsSummaryBar";
import { BookingsTable } from "./components/BookingsTable";
import { BookingDetailsModal } from "./components/BookingDetailsModal";
import {
  AdminToast,
  type AdminToastState,
  type ToastVariant,
} from "@/components/AdminToast";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";
import FixedTourCard from "./components/FixedTourRequestCard";
import {
  getDisplayReference,
  isNewBooking,
  toLocalDateKey,
  toNumber,
} from "./utils/bookingFormatters";

type DatePreset = "all" | "new24h" | "today" | "last7d" | "last30d" | "upcoming";
type DateFieldMode = "createdAt" | "journeyDate";
type SortOption = "newest" | "oldest" | "journey_asc" | "amount_desc";

export default function ToursPage() {
  const [bookings, setBookings] = useState<PackageBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & View Controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "oneday" | "multiday">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [dateField, setDateField] = useState<DateFieldMode>("journeyDate");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [tamperedOnly, setTamperedOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Row Actions & Modal State
  const [selectedBooking, setSelectedBooking] = useState<PackageBooking | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<AdminToastState | null>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await packageBookingService.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load package bookings.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  const new24hCount = useMemo(
    () => bookings.filter((b) => isNewBooking(b.createdAt, 24)).length,
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();
    const todayKey = toLocalDateKey(now.toISOString()) || "";
    const nowMs = now.getTime();

    const filtered = bookings.filter((b) => {
      const normalizedType = b.type || b.packageType;
      if (typeFilter !== "all" && normalizedType !== typeFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (paymentFilter !== "all" && (b.paymentStatus || "unpaid") !== paymentFilter) return false;
      if (tamperedOnly && !b.isPriceTampered) return false;

      // Quick New / Recency / Upcoming Presets
      if (datePreset !== "all") {
        const createdKey = toLocalDateKey(b.createdAt);
        const journeyKey = toLocalDateKey(b.journeyDate);
        const createdMs = b.createdAt ? new Date(b.createdAt).getTime() : NaN;

        if (datePreset === "new24h" && !isNewBooking(b.createdAt, 24)) return false;
        if (datePreset === "today" && createdKey !== todayKey) return false;
        if (datePreset === "last7d") {
          if (Number.isNaN(createdMs) || nowMs - createdMs > 7 * 24 * 60 * 60 * 1000) return false;
        }
        if (datePreset === "last30d") {
          if (Number.isNaN(createdMs) || nowMs - createdMs > 30 * 24 * 60 * 60 * 1000) return false;
        }
        if (datePreset === "upcoming") {
          if (!journeyKey || journeyKey < todayKey) return false;
        }
      }

      // Custom Date / Date Range Filter (Booked Date or Journey Date)
      if (dateFrom || dateTo) {
        const targetKey =
          dateField === "createdAt"
            ? toLocalDateKey(b.createdAt)
            : toLocalDateKey(b.journeyDate);
        if (!targetKey) return false;
        if (dateFrom && targetKey < dateFrom) return false;
        if (dateTo && targetKey > dateTo) return false;
      }

      if (q) {
        const ref = getDisplayReference(b).toLowerCase();
        const fullName = `${b.firstname} ${b.lastname}`.toLowerCase();
        const createdKey = (toLocalDateKey(b.createdAt) || "").toLowerCase();
        const journeyKey = (toLocalDateKey(b.journeyDate) || b.journeyDate || "").toLowerCase();
        const matches =
          ref.includes(q) ||
          fullName.includes(q) ||
          b.email.toLowerCase().includes(q) ||
          b.packageName.toLowerCase().includes(q) ||
          (b.country || "").toLowerCase().includes(q) ||
          journeyKey.includes(q) ||
          createdKey.includes(q);
        if (!matches) return false;
      }

      return true;
    });

    // Apply Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "journey_asc") {
        const keyA = toLocalDateKey(a.journeyDate) || "9999-12-31";
        const keyB = toLocalDateKey(b.journeyDate) || "9999-12-31";
        return keyA.localeCompare(keyB);
      }
      if (sortBy === "amount_desc") {
        return toNumber(b.totalAmount, 0) - toNumber(a.totalAmount, 0);
      }
      // default: newest first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [
    bookings,
    searchQuery,
    typeFilter,
    statusFilter,
    paymentFilter,
    datePreset,
    dateField,
    dateFrom,
    dateTo,
    sortBy,
    tamperedOnly,
  ]);

  const handleUpdated = useCallback((updated: PackageBooking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBooking((prev) => (prev && prev.id === updated.id ? updated : prev));
  }, []);

  const handleDeletedById = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setSelectedBooking((prev) => (prev && prev.id === id ? null : prev));
  }, []);

  const handleQuickStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      setUpdatingId(bookingId);
      const updated = await packageBookingService.updateBookingStatus(bookingId, {
        status: newStatus,
      });
      handleUpdated(updated);
      notify(`Booking status updated to ${newStatus.toUpperCase()}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update booking status";
      notify(msg, "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const [bookingToDelete, setBookingToDelete] = useState<PackageBooking | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const promptDeleteBooking = async (booking: PackageBooking) => {
    setBookingToDelete(booking);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;
    const ref = getDisplayReference(bookingToDelete);
    try {
      setDeleteLoading(true);
      await packageBookingService.deleteBooking(bookingToDelete.id);
      handleDeletedById(bookingToDelete.id);
      notify(`Deleted booking ${ref}`, "info");
      setBookingToDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete booking";
      notify(msg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    datePreset !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    sortBy !== "newest" ||
    tamperedOnly;

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDatePreset("all");
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
    setTamperedOnly(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Tour Bookings &amp; Operations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage One-Day &amp; Multi-Day reservations, server-verified pricing audits, add-ons, and payment lifecycle.
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
              onClick={() => void fetchBookings()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-700 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPI & Security Audit Strip */}
        <BookingsSummaryBar
          bookings={bookings}
          tamperedOnly={tamperedOnly}
          onToggleTamperedOnly={() => setTamperedOnly((prev) => !prev)}
        />

        {/* Search, New Bookings & Date Filter Toolbar */}
        <div className="rounded-2xl bg-white border border-slate-200 mb-5 shadow-2xs overflow-hidden">
          {/* Top Row: Compact Search + Category/Status/Payment/Sort Dropdowns */}
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Compact Search Input */}
            <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, guest, tour, date..."
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

            {/* Right Filters Group */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Tour Type Filter */}
              <select
                aria-label="Filter by tour type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "all" | "oneday" | "multiday")}
                className="rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer transition-colors"
              >
                <option value="all">All Tour Types</option>
                <option value="oneday">One-Day Tours</option>
                <option value="multiday">Multi-Day Tours</option>
              </select>

              {/* Booking Status Filter */}
              <select
                aria-label="Filter by booking status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | BookingStatus)}
                className="rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Payment Status Filter */}
              <select
                aria-label="Filter by payment status"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as "all" | PaymentStatus)}
                className="rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer transition-colors"
              >
                <option value="all">All Payments</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Payment Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              {/* Sort Order */}
              <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white pl-2.5 pr-1 transition-colors focus-within:border-emerald-500 focus-within:bg-white">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  aria-label="Sort bookings"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent py-2 pr-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="journey_asc">Journey Date (Soonest)</option>
                  <option value="amount_desc">Highest Amount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Row: Quick New / Recency Pills + Exact Date Range Filter */}
          <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            {/* Quick New Booking & Recency Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "new24h", label: "New (24h)", badge: new24hCount },
                  { id: "today", label: "Today" },
                  { id: "last7d", label: "Last 7 Days" },
                  { id: "last30d", label: "Last 30 Days" },
                  { id: "upcoming", label: "Upcoming Tours" },
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

            {/* Custom Date / Range Filter (Journey Date or Booked Date) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  aria-label="Date filter field"
                  value={dateField}
                  onChange={(e) => setDateField(e.target.value as DateFieldMode)}
                  className="bg-transparent text-[11px] font-bold text-slate-700 outline-none cursor-pointer pr-1"
                >
                  <option value="journeyDate">Journey Date</option>
                  <option value="createdAt">Booked Date</option>
                </select>
                <span className="h-3.5 w-px bg-slate-200" />
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
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Reset ({filteredBookings.length})
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
              <span className="font-bold block">Error loading tour bookings</span>
              {error}
            </div>
            <button
              type="button"
              onClick={() => void fetchBookings()}
              className="ml-auto px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content: Table View or Card View */}
        {!error && viewMode === "table" && (
          <BookingsTable
            bookings={filteredBookings}
            loading={loading}
            updatingId={updatingId}
            deletingId={deletingId}
            onViewDetails={(b) => setSelectedBooking(b)}
            onQuickStatusChange={handleQuickStatusChange}
            onDelete={promptDeleteBooking}
            onCopyReference={(ref) => notify(`Copied reference ${ref}`, "info")}
          />
        )}

        {!error && viewMode === "cards" && (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-52 rounded-2xl bg-white border border-slate-200 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <FixedTourCard
                  key={booking.id}
                  booking={booking}
                  onStatusUpdated={handleUpdated}
                  onDeleted={handleDeletedById}
                  onDelete={promptDeleteBooking}
                  onViewDetails={(b) => setSelectedBooking(b)}
                  onNotify={notify}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-sm font-medium text-slate-500">
                  No bookings found matching the active filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Booking Details & Payment Control Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdated={handleUpdated}
        onNotify={notify}
      />

      {/* Unified Luxury Delete Confirmation Modal */}
      <AdminDeleteModal
        isOpen={!!bookingToDelete}
        title="Delete Tour Booking?"
        description="This will permanently delete this customer tour booking record from the operations database. This action cannot be undone."
        itemTitle={bookingToDelete ? `${getDisplayReference(bookingToDelete)} — ${bookingToDelete.firstname} ${bookingToDelete.lastname}` : undefined}
        itemSubtitle={bookingToDelete ? `${bookingToDelete.packageName || "Tour Package"} • ${bookingToDelete.journeyDate || "Date TBD"} • ${bookingToDelete.email}` : undefined}
        loading={deleteLoading}
        onClose={() => setBookingToDelete(null)}
        onConfirm={confirmDeleteBooking}
      />

      {/* Toast Notification */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
