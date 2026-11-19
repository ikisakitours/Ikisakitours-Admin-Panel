"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService, AdminUser } from "@/services/auth.service";
import { ShieldAlert } from "lucide-react";
import {
  staffService,
  AdminStaffUser,
  AdminRole,
  CreateStaffDto,
} from "@/services/staff.service";
import { getRoleMeta } from "./data/staffRoles";
import { StaffHeader } from "./components/StaffHeader";
import { StaffSummaryBar } from "./components/StaffSummaryBar";
import { StaffFiltersBar } from "./components/StaffFiltersBar";
import { StaffTable } from "./components/StaffTable";
import { StaffCardView } from "./components/StaffCardView";
import { StaffAddModal } from "./components/StaffAddModal";
import { StaffResetPasswordModal } from "./components/StaffResetPasswordModal";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";

export default function StaffManagementPage() {
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

  const [staffList, setStaffList] = useState<AdminStaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [twoFaFilter, setTwoFaFilter] = useState<string>("ALL");

  // AdminToast notification
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  // Check Current User Role Authorization
  useEffect(() => {
    authService
      .getMe()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          if (user.role !== "SUPER_ADMIN") {
            notify("Access Denied: Only Super Administrators can access Staff Management.", "error");
          }
        }
        setAuthChecking(false);
      })
      .catch(() => {
        setAuthChecking(false);
      });
  }, [notify]);

  // Modal: Add Staff
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Modal: Reset Password
  const [resetStaffTarget, setResetStaffTarget] = useState<AdminStaffUser | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Modal: Delete Staff confirmation via AdminDeleteModal
  const [deleteTargetStaff, setDeleteTargetStaff] = useState<AdminStaffUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal: Suspend / Activate confirmation via AdminDeleteModal
  const [statusTargetStaff, setStatusTargetStaff] = useState<AdminStaffUser | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await staffService.getAll();
      setStaffList(data || []);
    } catch {
      notify("Failed to load staff accounts from server.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    queueMicrotask(() => {
      loadStaff();
    });
  }, [loadStaff]);

  // Handle Create Staff
  const handleCreateStaff = async (formData: CreateStaffDto) => {
    try {
      setAddLoading(true);
      const res = await staffService.createStaff(formData);
      if (res.success) {
        notify(res.message || "Staff member created successfully!", "success");
        setIsAddModalOpen(false);
        loadStaff();
      } else {
        notify(res.message || "Failed to create staff member.", "error");
      }
    } catch {
      notify("Failed to communicate with authentication server.", "error");
    } finally {
      setAddLoading(false);
    }
  };

  // Handle Role Change
  const handleRoleChange = async (staff: AdminStaffUser, newRole: AdminRole) => {
    if (staff.role === newRole) return;

    // Self-demotion check
    const isSelf =
      (currentUser?.id && staff.id === currentUser.id) ||
      (currentUser?.email && staff.email.toLowerCase() === currentUser.email.toLowerCase());
    if (isSelf && newRole !== "SUPER_ADMIN") {
      notify(
        "Self-Demotion Prohibited: You cannot remove your own Super Administrator privileges. Another Super Admin must adjust your role.",
        "warning"
      );
      return;
    }

    try {
      const res = await staffService.updateRole(staff.id, newRole);
      if (res.success) {
        notify(`Role updated to ${getRoleMeta(newRole).title}.`, "success");
        setStaffList((prev) =>
          prev.map((item) => (item.id === staff.id ? { ...item, role: newRole } : item))
        );
      } else {
        notify(res.message || "Failed to change role.", "error");
      }
    } catch {
      notify("Network error while updating role.", "error");
    }
  };

  // Intercept Suspend Request with Enterprise Security Validations
  const handleRequestToggleStatus = (staff: AdminStaffUser) => {
    const isSelf =
      (currentUser?.id && staff.id === currentUser.id) ||
      (currentUser?.email && staff.email.toLowerCase() === currentUser.email.toLowerCase());

    // 1. Self-suspension check
    if (isSelf && staff.isActive) {
      notify(
        "Self-Suspension Prohibited: You cannot suspend your own Super Administrator account. Doing so would immediately revoke your active session and lock you out of the platform.",
        "warning"
      );
      return;
    }

    // 2. Super Admin suspension protection
    if (staff.role === "SUPER_ADMIN" && staff.isActive) {
      notify(
        "Root Account Protection: Super Administrator accounts cannot be suspended. If this administrator should no longer have root access, please reassign their role to an operational tier first.",
        "warning"
      );
      return;
    }

    setStatusTargetStaff(staff);
  };

  // Intercept Delete Request with Enterprise Security Validations
  const handleRequestDelete = (staff: AdminStaffUser) => {
    const isSelf =
      (currentUser?.id && staff.id === currentUser.id) ||
      (currentUser?.email && staff.email.toLowerCase() === currentUser.email.toLowerCase());

    // 1. Self-deletion check
    if (isSelf) {
      notify(
        "Self-Deletion Prohibited: You cannot delete your own Super Administrator account while logged into the admin panel. Another Super Admin must manage your account if decommissioning is required.",
        "warning"
      );
      return;
    }

    // 2. Super Admin deletion protection
    if (staff.role === "SUPER_ADMIN") {
      const superAdminCount = staffList.filter((s) => s.role === "SUPER_ADMIN").length;
      if (superAdminCount <= 1) {
        notify(
          "Primary Admin Protection: This is the primary and only Super Administrator account on the platform. The system must always maintain at least one active Super Admin.",
          "warning"
        );
        return;
      }

      notify(
        "Protected Root Role: Super Administrator accounts cannot be deleted directly. To decommission this user, first change their role to another operational tier (e.g. Operations Manager) and then proceed with deletion.",
        "warning"
      );
      return;
    }

    setDeleteTargetStaff(staff);
  };

  // Handle Suspend / Activate Confirmation
  const handleConfirmToggleStatus = async () => {
    if (!statusTargetStaff) return;
    const nextStatus = !statusTargetStaff.isActive;

    try {
      setStatusLoading(true);
      const res = await staffService.toggleStatus(statusTargetStaff.id, nextStatus);
      if (res.success) {
        notify(
          `Staff account for ${statusTargetStaff.fullName} has been ${
            nextStatus ? "activated" : "suspended"
          }.`,
          nextStatus ? "success" : "info"
        );
        setStaffList((prev) =>
          prev.map((item) =>
            item.id === statusTargetStaff.id ? { ...item, isActive: nextStatus } : item
          )
        );
        setStatusTargetStaff(null);
      } else {
        let errorMsg = res.message || "Failed to update account status.";
        const lower = errorMsg.toLowerCase();
        if (lower.includes("own") || lower.includes("self")) {
          errorMsg = "Security Protection: You cannot suspend your own Super Administrator account.";
        } else if (lower.includes("super_admin") || lower.includes("root")) {
          errorMsg = "Root Account Protection: Super Administrator accounts cannot be suspended. Please reassign their role first.";
        }
        notify(errorMsg, "error");
      }
    } catch {
      notify("Failed to update status on server. Please verify permissions.", "error");
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle Reset Password
  const handleConfirmResetPassword = async (newPassword: string) => {
    if (!resetStaffTarget) return;

    try {
      setResetLoading(true);
      const res = await staffService.resetPassword(resetStaffTarget.id, newPassword);
      if (res.success) {
        notify(`Temporary password set for ${resetStaffTarget.fullName}.`, "success");
        setResetStaffTarget(null);
      } else {
        notify(res.message || "Failed to reset password.", "error");
      }
    } catch {
      notify("Could not communicate with server to reset password.", "error");
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTargetStaff) return;

    try {
      setDeleteLoading(true);
      const res = await staffService.deleteStaff(deleteTargetStaff.id);
      if (res.success) {
        notify(`Staff member ${deleteTargetStaff.fullName} deleted permanently.`, "success");
        setStaffList((prev) => prev.filter((item) => item.id !== deleteTargetStaff.id));
        setDeleteTargetStaff(null);
      } else {
        let errorMsg = res.message || "Failed to delete staff member.";
        const lower = errorMsg.toLowerCase();
        if (lower.includes("own") || lower.includes("self") || lower.includes("cannot delete yourself")) {
          errorMsg = "Security Protection: You cannot delete your own Super Administrator account.";
        } else if (lower.includes("foreign key") || lower.includes("constraint") || lower.includes("referenced")) {
          errorMsg = "Audit Protection: This staff account is linked to historical audit logs or packages and cannot be deleted permanently. Please suspend the account instead to disable access.";
        } else if (lower.includes("super_admin") || lower.includes("root")) {
          errorMsg = "Root Account Protection: Super Administrator accounts cannot be deleted directly. Change their role first.";
        }
        notify(errorMsg, "error");
      }
    } catch {
      notify("Failed to delete staff member. The account may have associated records.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter Logic
  const filteredStaff = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return staffList.filter((s) => {
      // 1. Search query
      if (q) {
        const name = (s.fullName || "").toLowerCase();
        const email = (s.email || "").toLowerCase();
        const ip = (s.lastLoginIp || "").toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !ip.includes(q)) {
          return false;
        }
      }

      // 2. Role filter
      if (roleFilter !== "ALL" && s.role !== roleFilter) return false;

      // 3. Status filter
      if (statusFilter === "ACTIVE" && !s.isActive) return false;
      if (statusFilter === "SUSPENDED" && s.isActive) return false;

      // 4. 2FA filter
      if (twoFaFilter === "ENABLED" && !s.isTwoFactorEnabled) return false;
      if (twoFaFilter === "DISABLED" && s.isTwoFactorEnabled) return false;

      return true;
    });
  }, [staffList, searchQuery, roleFilter, statusFilter, twoFaFilter]);

  if (!authChecking && currentUser && currentUser.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Access Restricted</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your assigned operational role is <span className="font-bold text-slate-800">{getRoleMeta(currentUser.role).title}</span>. Only Super Administrators have permission to manage staff accounts and role privileges.
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header (Matches users page layout with Table/Cards toggle) */}
      <StaffHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        loading={loading}
        onRefresh={loadStaff}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* 2. Executive KPI Summary Bar */}
      <StaffSummaryBar staffList={staffList} />

      {/* 3. Filters & Search Bar (Exact standard width) */}
      <StaffFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        twoFaFilter={twoFaFilter}
        onTwoFaFilterChange={setTwoFaFilter}
        totalCount={staffList.length}
      />

      {/* 4. Directory Content: Table or Cards */}
      {viewMode === "table" ? (
        <StaffTable
          staffList={filteredStaff}
          loading={loading}
          currentAdminId={currentUser?.id}
          currentAdminEmail={currentUser?.email}
          onRoleChange={handleRoleChange}
          onRequestToggleStatus={handleRequestToggleStatus}
          onRequestResetPassword={(staff) => setResetStaffTarget(staff)}
          onRequestDelete={handleRequestDelete}
        />
      ) : (
        <StaffCardView
          staffList={filteredStaff}
          loading={loading}
          currentAdminId={currentUser?.id}
          currentAdminEmail={currentUser?.email}
          onRoleChange={handleRoleChange}
          onRequestToggleStatus={handleRequestToggleStatus}
          onRequestResetPassword={(staff) => setResetStaffTarget(staff)}
          onRequestDelete={handleRequestDelete}
        />
      )}

      {/* MODAL 1: Add New Staff Member (Wide Layout with 10 Role Types) */}
      <StaffAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateStaff}
        loading={addLoading}
      />

      {/* MODAL 2: Reset Password Modal */}
      <StaffResetPasswordModal
        staff={resetStaffTarget}
        onClose={() => setResetStaffTarget(null)}
        onSubmit={handleConfirmResetPassword}
        loading={resetLoading}
      />

      {/* MODAL 3: Suspend / Activate Confirmation Modal via AdminDeleteModal */}
      {statusTargetStaff && (
        <AdminDeleteModal
          isOpen={!!statusTargetStaff}
          title={statusTargetStaff.isActive ? "Suspend Staff Account" : "Re-activate Staff Account"}
          description={
            statusTargetStaff.isActive
              ? "This staff member will be immediately blocked from signing into the Ikisaki Tours Admin Panel and any active sessions will be terminated."
              : "This staff member will regain access to their assigned operational dashboard modules."
          }
          itemTitle={statusTargetStaff.fullName}
          itemSubtitle={`${statusTargetStaff.email} — Role: ${getRoleMeta(statusTargetStaff.role).title}`}
          confirmLabel={statusTargetStaff.isActive ? "Suspend Access" : "Activate Access"}
          loading={statusLoading}
          onClose={() => setStatusTargetStaff(null)}
          onConfirm={handleConfirmToggleStatus}
        />
      )}

      {/* MODAL 4: Delete Staff Member Confirmation via AdminDeleteModal */}
      {deleteTargetStaff && (
        <AdminDeleteModal
          isOpen={!!deleteTargetStaff}
          title="Delete Staff Account"
          description="This action will permanently delete this staff member's administrative account, access privileges, and credentials. It cannot be undone."
          itemTitle={deleteTargetStaff.fullName}
          itemSubtitle={`${deleteTargetStaff.email} — Role: ${getRoleMeta(deleteTargetStaff.role).title}`}
          confirmLabel="Delete Account"
          loading={deleteLoading}
          onClose={() => setDeleteTargetStaff(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* 5. Enterprise AdminToast (Strict Notification System) */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
