"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  LayoutGrid,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Table2,
  X,
} from "lucide-react";
import { CommentsService } from "@/services/comments.service";
import { PackageReviewsService, type PackageReview } from "@/services/package-reviews.service";
import type { CommentItemType, FeedbackItem } from "./types/comment.types";
import { CommentsSummaryBar } from "./components/CommentsSummaryBar";
import { CommentsTable } from "./components/CommentsTable";
import { CommentDetailsModal } from "./components/CommentDetailsModal";
import {
  AdminToast,
  type AdminToastState,
  type ToastVariant,
} from "@/components/AdminToast";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";
import {
  getDisplayCommentReference,
  isNewComment,
  toLocalDateKey,
} from "./utils/commentFormatters";

type DatePreset = "all" | "new24h" | "today" | "last7d" | "last30d";
type SortOption = "newest" | "oldest" | "rating_desc" | "rating_asc";

export default function CommentsPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & View Controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CommentItemType>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [replyFilter, setReplyFilter] = useState<"all" | "pending" | "replied">("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Selection & Actions State
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<AdminToastState | null>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [commentsRes, reviewsRes] = await Promise.all([
        CommentsService.getAll().catch(() => ({ comments: [] })),
        PackageReviewsService.getAll().catch(() => []),
      ]);

      const formattedComments: FeedbackItem[] = (commentsRes.comments || []).map((c: any) => ({
        id: c.id,
        itemType: "website",
        source: c.source || "Website Feedback",
        authorName: c.authorName || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Guest",
        firstName: c.firstName,
        lastName: c.lastName,
        country: c.country,
        avatarUrl: c.avatarUrl,
        rating: c.rating || null,
        content: c.content || "",
        isPubliclyVisible: c.isPubliclyVisible ?? true,
        isVerified: c.isVerified,
        isVip: c.isVip,
        hasAccess: c.hasAccess,
        adminReply: c.adminReply || null,
        createdAt: c.date || c.createdAt || new Date().toISOString(),
      }));

      const formattedReviews: FeedbackItem[] = (reviewsRes || []).map((r: PackageReview) => ({
        id: r.id,
        itemType: "package-review",
        source: r.packageName || "Tour Package",
        authorName: r.fullName || "Guest Traveler",
        email: r.email,
        rating: r.rating || 5,
        content: r.experience || "",
        isPubliclyVisible: r.isPubliclyVisible ?? true,
        isVerified: true,
        adminReply: r.adminReply || null,
        imageUrls: r.imageUrls || [],
        createdAt: r.createdAt || new Date().toISOString(),
      }));

      const combined = [...formattedComments, ...formattedReviews].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setItems(combined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load reviews and comments.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchItems();
    });
  }, [fetchItems]);

  const new24hCount = useMemo(
    () => items.filter((i) => isNewComment(i.createdAt, 24)).length,
    [items]
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date();
    const todayKey = toLocalDateKey(now.toISOString()) || "";
    const nowMs = now.getTime();

    const filtered = items.filter((item) => {
      if (categoryFilter !== "all" && item.itemType !== categoryFilter) return false;

      // Rating Filter
      if (ratingFilter !== "all") {
        const r = item.rating || 0;
        if (ratingFilter === "5" && r !== 5) return false;
        if (ratingFilter === "4" && r !== 4) return false;
        if (ratingFilter === "3_below" && (r > 3 || r === 0)) return false;
      }

      // Reply Filter (Only package reviews have staff replies)
      if (replyFilter === "pending") {
        if (item.itemType !== "package-review") return false;
        if (item.adminReply && item.adminReply.trim()) return false;
      }
      if (replyFilter === "replied") {
        if (!item.adminReply || !item.adminReply.trim()) return false;
      }

      // Quick Recency Presets
      if (datePreset !== "all") {
        const createdKey = toLocalDateKey(item.createdAt);
        const createdMs = item.createdAt ? new Date(item.createdAt).getTime() : NaN;

        if (datePreset === "new24h" && !isNewComment(item.createdAt, 24)) return false;
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
        const dateKey = toLocalDateKey(item.createdAt);
        if (!dateKey) return false;
        if (dateFrom && dateKey < dateFrom) return false;
        if (dateTo && dateKey > dateTo) return false;
      }

      if (q) {
        const ref = getDisplayCommentReference(item).toLowerCase();
        const author = (item.authorName || "").toLowerCase();
        const content = (item.content || "").toLowerCase();
        const source = (item.source || "").toLowerCase();
        const email = (item.email || "").toLowerCase();
        const country = (item.country || "").toLowerCase();

        const matches =
          ref.includes(q) ||
          author.includes(q) ||
          content.includes(q) ||
          source.includes(q) ||
          email.includes(q) ||
          country.includes(q);
        if (!matches) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "rating_desc") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "rating_asc") {
        return (a.rating || 0) - (b.rating || 0);
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [items, searchQuery, categoryFilter, ratingFilter, replyFilter, datePreset, dateFrom, dateTo, sortBy]);

  const handleUpdated = useCallback((updated: FeedbackItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
    setSelectedItem((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  }, []);

  const handleToggleVisibility = async (item: FeedbackItem) => {
    const nextVal = !item.isPubliclyVisible;
    try {
      setTogglingId(item.id);
      if (item.itemType === "package-review") {
        await PackageReviewsService.updateVisibility(item.id, { isPubliclyVisible: nextVal });
      } else {
        await CommentsService.toggleVisibility(item.id, { isPubliclyVisible: nextVal });
      }
      handleUpdated({ ...item, isPubliclyVisible: nextVal });
      notify(`Visibility updated to ${nextVal ? "PUBLIC" : "HIDDEN"}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to toggle visibility";
      notify(msg, "error");
    } finally {
      setTogglingId(null);
    }
  };

  const [commentToDelete, setCommentToDelete] = useState<FeedbackItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const promptDeleteComment = async (item: FeedbackItem) => {
    setCommentToDelete(item);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    const ref = getDisplayCommentReference(commentToDelete);
    try {
      setDeleteLoading(true);
      if (commentToDelete.itemType === "package-review") {
        await PackageReviewsService.remove(commentToDelete.id);
      }
      setItems((prev) => prev.filter((i) => i.id !== commentToDelete.id));
      if (selectedItem?.id === commentToDelete.id) setSelectedItem(null);
      notify(`Deleted review ${ref}`, "info");
      setCommentToDelete(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete review";
      notify(msg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "all" ||
    ratingFilter !== "all" ||
    replyFilter !== "all" ||
    datePreset !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    sortBy !== "newest";

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setRatingFilter("all");
    setReplyFilter("all");
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
              Reviews &amp; Guest Feedback
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Moderate tour ratings, website guest comments, public visibility, and official staff replies.
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
              onClick={() => void fetchItems()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-700 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Top KPI & Summary Strip */}
        <CommentsSummaryBar
          items={items}
          selectedCategory={categoryFilter}
          onSelectCategory={(cat) => setCategoryFilter(cat)}
          selectedReplyFilter={replyFilter}
          onSelectReplyFilter={(flt) => setReplyFilter(flt)}
        />

        {/* Search, Category & Filter Toolbar */}
        <div className="rounded-2xl bg-white border border-slate-200 mb-5 shadow-2xs overflow-hidden">
          {/* Top Row: Search + Category + Rating + Reply + Sort Dropdowns */}
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search author, tour, comment..."
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
              {/* Category Filter */}
              <select
                aria-label="Filter by type"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as "all" | CommentItemType)}
                className="rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer transition-colors"
              >
                <option value="all">All Feedback Types</option>
                <option value="package-review">Tour Package Reviews</option>
                <option value="website">Website Feedback</option>
              </select>

              {/* Star Rating Filter */}
              <select
                aria-label="Filter by rating"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer transition-colors"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3_below">⭐⭐⭐ 3 Stars &amp; Below</option>
              </select>

              {/* Reply Status */}
              <select
                aria-label="Filter by reply status"
                value={replyFilter}
                onChange={(e) => setReplyFilter(e.target.value as "all" | "pending" | "replied")}
                className="rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer transition-colors"
              >
                <option value="all">All Reply Statuses</option>
                <option value="pending">Awaiting Staff Reply</option>
                <option value="replied">Replied by Staff</option>
              </select>

              {/* Sort Order */}
              <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white pl-2.5 pr-1 transition-colors focus-within:border-emerald-500 focus-within:bg-white">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  aria-label="Sort comments"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent py-2 pr-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating_desc">Highest Rating</option>
                  <option value="rating_asc">Lowest Rating</option>
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
                  Reset ({filteredItems.length})
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
              <span className="font-bold block">Error loading comments</span>
              {error}
            </div>
            <button
              type="button"
              onClick={() => void fetchItems()}
              className="ml-auto px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content: Table or Cards */}
        {!error && viewMode === "table" && (
          <CommentsTable
            items={filteredItems}
            loading={loading}
            togglingId={togglingId}
            deletingId={deletingId}
            onViewDetails={(item) => setSelectedItem(item)}
            onToggleVisibility={handleToggleVisibility}
            onDelete={promptDeleteComment}
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
                    className="h-60 rounded-2xl bg-white border border-slate-200 animate-pulse p-5"
                  />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                            item.itemType === "package-review"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {item.itemType === "package-review" ? "Package Review" : "Website Feedback"}
                        </span>
                        {typeof item.rating === "number" && (
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            <span className="text-xs font-bold text-slate-800">{item.rating}.0</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 truncate">
                          {item.source || "Website Review"}
                        </h3>
                        <p className="text-xs font-bold text-slate-600 mt-0.5">{item.authorName}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 italic line-clamp-3">
                        &quot;{item.content}&quot;
                      </div>

                      {item.adminReply && (
                        <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/70 p-2.5 text-[11px] text-emerald-900">
                          <strong className="block text-emerald-800 font-bold mb-0.5">Staff Reply:</strong>
                          <p className="line-clamp-2 italic">&quot;{item.adminReply}&quot;</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(item)}
                        className={`text-[10px] font-extrabold px-2 py-1 rounded-full border ${
                          item.isPubliclyVisible
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {item.isPubliclyVisible ? "Public" : "Hidden"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        {item.adminReply ? "View" : "Reply"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-300">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No reviews match your filters</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try clearing your search query or switching filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details & Reply Modal */}
      {selectedItem && (
        <CommentDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdated={handleUpdated}
          onNotify={notify}
        />
      )}

      {/* Unified Luxury Delete Modal */}
      <AdminDeleteModal
        isOpen={!!commentToDelete}
        title="Delete Guest Review?"
        description="This will permanently delete this review from the database. This action cannot be undone."
        itemTitle={commentToDelete ? `${getDisplayCommentReference(commentToDelete)} — ${commentToDelete.authorName}` : undefined}
        itemSubtitle={commentToDelete ? `${commentToDelete.itemType === "package-review" ? "Tour Package Review" : "Website Feedback"} • ${commentToDelete.rating ? `${commentToDelete.rating} Stars` : "No rating"}` : undefined}
        loading={deleteLoading}
        onClose={() => setCommentToDelete(null)}
        onConfirm={confirmDeleteComment}
      />

      {/* Toast */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
