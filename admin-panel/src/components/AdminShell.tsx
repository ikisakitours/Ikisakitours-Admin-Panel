"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AdminAccessRestricted } from "@/components/AdminAccessRestricted";
import { AdminSessionExpiredModal } from "@/components/AdminSessionExpiredModal";
import { isRoutePermitted } from "@/app/staff/data/staffRoles";
import { authService, type AdminUser } from "@/services/auth.service";
import { Loader2 } from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  const [mounted, setMounted] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Listen for global session expiry events from API interceptors
  useEffect(() => {
    const handleExpired = () => {
      setIsSessionExpired(true);
    };
    window.addEventListener("admin:session-expired", handleExpired);
    return () => window.removeEventListener("admin:session-expired", handleExpired);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);

      // Read cached admin user upon client mount
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("admin_user");
        if (saved) {
          try {
            setAdminUser(JSON.parse(saved));
          } catch {
            // ignore
          }
        }
      }
    });

    // Verify authenticated user profile with backend
    authService
      .getMe()
      .then((user) => {
        if (user) {
          setAdminUser(user);
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_user", JSON.stringify(user));
          }
        }
      })
      .catch(() => {
        // ignore
      });
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Prevent flash of unauthorized content before client mount/hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2.5 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-semibold">Verifying role permissions...</span>
          </div>
        </main>
      </div>
    );
  }

  // Check if current staff role is authorized to view this pathname
  const permitted = isRoutePermitted(pathname, adminUser?.role);

  return (
    <div className="flex min-h-screen">
      {/* Static Sidebar: locked in place, dynamically filters permitted menus */}
      <Sidebar />

      {/* Dynamic Content Area: Enforces zero-millisecond unauthorized flash prevention */}
      <main className="flex-1 p-8">
        {permitted ? (
          children
        ) : (
          <AdminAccessRestricted pathname={pathname} user={adminUser} />
        )}
      </main>

      {/* Global Session Timeout Re-Authentication Modal */}
      <AdminSessionExpiredModal isOpen={isSessionExpired} />
    </div>
  );
}
