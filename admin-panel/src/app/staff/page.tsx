"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
    loadStaff();
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
        notify(res.message || "Failed to update account status.", "error");
      }
    } catch {
      notify("Failed to update status on server.", "error");
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
        notify(res.message || "Failed to delete staff member.", "error");
      }
    } catch {
      notify("Failed to delete staff member.", "error");
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
          onRoleChange={handleRoleChange}
          onRequestToggleStatus={(staff) => setStatusTargetStaff(staff)}
          onRequestResetPassword={(staff) => setResetStaffTarget(staff)}
          onRequestDelete={(staff) => setDeleteTargetStaff(staff)}
        />
      ) : (
        <StaffCardView
          staffList={filteredStaff}
          loading={loading}
          onRoleChange={handleRoleChange}
          onRequestToggleStatus={(staff) => setStatusTargetStaff(staff)}
          onRequestResetPassword={(staff) => setResetStaffTarget(staff)}
          onRequestDelete={(staff) => setDeleteTargetStaff(staff)}
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
