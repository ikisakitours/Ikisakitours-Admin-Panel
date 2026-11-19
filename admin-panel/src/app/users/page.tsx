"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService, type AdminUser } from "@/services/auth.service";
import { getRoleMeta } from "@/app/staff/data/staffRoles";
import {
  Users as UsersIcon,
  Search,
  Table2,
  LayoutGrid,
  RefreshCw,
  X,
  AlertTriangle,
  ArrowUpDown,
  ShieldAlert,
} from "lucide-react";
import { UsersService, type User } from "@/services/users.service";
import UserCard from "./components/UserCard";
import { UsersTable } from "./components/UsersTable";
import { UsersSummaryBar } from "./components/UsersSummaryBar";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";

type StatusFilter = "all" | "active" | "blocked" | "vip" | "verified";
type SortOption = "newest" | "oldest" | "name";

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_user");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [authChecking, setAuthChecking] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Action Loading & Toast
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<AdminToastState | null>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UsersService.getAll();
      setUsers(data || []);
    } catch (err: any) {
      const msg = err.message || "Failed to fetch registered users";
      setError(msg);
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    authService
      .getMe()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
        }
        setAuthChecking(false);
      })
      .catch(() => {
        setAuthChecking(false);
      });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchUsers();
    });
  }, [fetchUsers]);

  // Extract distinct countries
  const distinctCountries = useMemo(() => {
    const set = new Set<string>();
    for (const u of users) {
      if (u.country && u.country.trim()) {
        set.add(u.country.trim());
      }
    }
    return Array.from(set).sort();
  }, [users]);

  // Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = users.filter((u) => {
      // 1. Search query (supports name, email, country, UUID, or branded IKISAKI Reference ID)
      if (q) {
        const full = `${u.firstname || ""} ${u.lastname || ""}`.toLowerCase();
        const email = (u.email || "").toLowerCase();
        const country = (u.country || "").toLowerCase();
        const id = (u.id || "").toLowerCase();
        const refId = (u.referenceId || u.customerReferenceId || "").toLowerCase();
        if (
          !full.includes(q) &&
          !email.includes(q) &&
          !country.includes(q) &&
          !id.includes(q) &&
          !refId.includes(q)
        ) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter === "active" && !u.hasAccess) return false;
      if (statusFilter === "blocked" && u.hasAccess) return false;
      if (statusFilter === "vip" && !u.isVip) return false;
      if (statusFilter === "verified" && !u.isVerified) return false;

      // 3. Country filter
      if (countryFilter !== "all" && u.country?.trim() !== countryFilter) return false;

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = `${a.firstname || ""} ${a.lastname || ""}`.toLowerCase();
        const nameB = `${b.firstname || ""} ${b.lastname || ""}`.toLowerCase();
        return nameA.localeCompare(nameB);
      }
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [users, searchQuery, statusFilter, countryFilter, sortBy]);

  // Toggle Access Status
  const handleToggleAccess = async (user: User) => {
    const targetKey = `${user.id}-access`;
    try {
      setActionLoadingId(targetKey);
      const newStatus = !user.hasAccess;
      const updated = await UsersService.updateStatus(user.id, {
        hasAccess: newStatus,
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, hasAccess: newStatus } : u)));
      notify(
        `${user.firstname || "User"} is now ${newStatus ? "Active (Access Granted)" : "Blocked (Access Suspended)"}`,
        newStatus ? "success" : "info"
      );
    } catch (err: any) {
      notify(err.message || "Failed to update access status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle VIP Status
  const handleToggleVip = async (user: User) => {
    const targetKey = `${user.id}-vip`;
    try {
      setActionLoadingId(targetKey);
      const newStatus = !user.isVip;
      const updated = await UsersService.updateStatus(user.id, {
        isVip: newStatus,
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVip: newStatus } : u)));
      notify(
        `${user.firstname || "User"} tier updated to ${newStatus ? "VIP Member (Priority)" : "Standard Member"}`,
        "success"
      );
    } catch (err: any) {
      notify(err.message || "Failed to update VIP status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Verified Status
  const handleToggleVerified = async (user: User) => {
    const targetKey = `${user.id}-verified`;
    try {
      setActionLoadingId(targetKey);
      const newStatus = !user.isVerified;
      const updated = await UsersService.updateStatus(user.id, {
        isVerified: newStatus,
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isVerified: newStatus } : u)));
      notify(
        `${user.firstname || "User"} is now ${newStatus ? "Verified Profile" : "Unverified"}`,
        "success"
      );
    } catch (err: any) {
      notify(err.message || "Failed to update verification status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    countryFilter !== "all" ||
    sortBy !== "newest";

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCountryFilter("all");
    setSortBy("newest");
  };

  const isAllowed = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "OPERATIONS_MANAGER";

  if (!authChecking && currentUser && !isAllowed) {
    const roleMeta = getRoleMeta(currentUser.role);
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Access Restricted</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your assigned operational role is <span className="font-bold text-slate-800">{roleMeta.title}</span>. Access to registered guest customer records is restricted to Super Administrators and Operations Directors.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              User Management &amp; Customers
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registered guest profiles, VIP tier privileges, access permissions, and identity verification.
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
              onClick={fetchUsers}
              title="Reload registered users"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Stat Bar */}
        <UsersSummaryBar users={users} />

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
                placeholder="Search by customer name, email, country, or user ID..."
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
              {/* Status Filter */}
              <select
                aria-label="Filter by account status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Statuses ({users.length})</option>
                <option value="active">Active Only</option>
                <option value="vip">VIP Members</option>
                <option value="verified">Verified Profiles</option>
                <option value="blocked">Suspended / Blocked</option>
              </select>

              {/* Country Filter */}
              <select
                aria-label="Filter by country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Countries</option>
                {distinctCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                aria-label="Sort users"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>

              {/* Clear Filter Button */}
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
              onClick={fetchUsers}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : viewMode === "table" ? (
          <UsersTable
            users={filteredUsers}
            loading={loading}
            actionLoadingId={actionLoadingId}
            onToggleAccess={handleToggleAccess}
            onToggleVip={handleToggleVip}
            onToggleVerified={handleToggleVerified}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-white border border-dashed border-slate-300 py-14 px-6 text-center space-y-2">
                <UsersIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No registered users found</p>
                <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  actionLoadingId={actionLoadingId}
                  onToggleAccess={handleToggleAccess}
                  onToggleVip={handleToggleVip}
                  onToggleVerified={handleToggleVerified}
                />
              ))
            )}
          </div>
        )}

        {/* Global AdminToast */}
        <AdminToast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </div>
  );
}
