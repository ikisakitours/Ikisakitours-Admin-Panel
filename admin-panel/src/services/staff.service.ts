import { fetcher } from "@/lib/api-client";

export type AdminRole =
  | "SUPER_ADMIN"
  | "OPERATIONS_MANAGER"
  | "PACKAGE_MANAGER"
  | "DESTINATION_EXPERT"
  | "CONTENT_EDITOR"
  | "BOOKING_AGENT"
  | "TRANSPORT_COORDINATOR"
  | "CUSTOMER_SUPPORT"
  | "REVIEW_MODERATOR"
  | "LEGAL_COMPLIANCE";

export interface AdminStaffUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  avatarUrl?: string | null;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStaffDto {
  fullName: string;
  email: string;
  password: string;
  role: AdminRole;
}

export const staffService = {
  // GET all staff members (Super Admin only)
  async getAll(): Promise<AdminStaffUser[]> {
    try {
      return await fetcher<AdminStaffUser[]>("/admin/staff");
    } catch {
      // Graceful development fallback mock
      const savedUser = typeof window !== "undefined" ? localStorage.getItem("admin_user") : null;
      let currentUser: AdminStaffUser | null = null;
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          currentUser = {
            id: parsed.id || "admin-001",
            email: parsed.email || "admin@ikisakitours.com",
            fullName: parsed.fullName || "Dhanuja Chathumal",
            role: (parsed.role as AdminRole) || "SUPER_ADMIN",
            avatarUrl: parsed.avatarUrl || null,
            isActive: true,
            isTwoFactorEnabled: !!parsed.isTwoFactorEnabled,
            createdAt: new Date().toISOString(),
          };
        } catch {
          // ignore
        }
      }

      return [
        currentUser || {
          id: "admin-001",
          email: "admin@ikisakitours.com",
          fullName: "Dhanuja Chathumal",
          role: "SUPER_ADMIN",
          avatarUrl: null,
          isActive: true,
          isTwoFactorEnabled: true,
          createdAt: "2026-11-19T09:26:35Z",
        },
      ];
    }
  },

  // POST create a new staff member
  async createStaff(payload: CreateStaffDto): Promise<{ success: boolean; user?: AdminStaffUser; message: string }> {
    try {
      const user = await fetcher<AdminStaffUser>("/admin/staff", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, user, message: "Staff member created successfully!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to create staff member." };
    }
  },

  // PATCH update role
  async updateRole(id: string, role: AdminRole): Promise<{ success: boolean; message: string }> {
    try {
      await fetcher(`/admin/staff/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      return { success: true, message: "Staff role updated successfully!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to update role." };
    }
  },

  // PATCH toggle active / suspend status
  async toggleStatus(id: string, isActive: boolean): Promise<{ success: boolean; message: string }> {
    try {
      await fetcher(`/admin/staff/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      return { success: true, message: `Staff account ${isActive ? "activated" : "suspended"} successfully!` };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to change status." };
    }
  },

  // PATCH reset password
  async resetPassword(id: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      await fetcher(`/admin/staff/${id}/reset-password`, {
        method: "PATCH",
        body: JSON.stringify({ newPassword }),
      });
      return { success: true, message: "Temporary password assigned successfully!" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to reset password." };
    }
  },

  // DELETE remove staff member
  async deleteStaff(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await fetcher(`/admin/staff/${id}`, {
        method: "DELETE",
      });
      return { success: true, message: "Staff member deleted successfully." };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to delete staff member." };
    }
  },
};
