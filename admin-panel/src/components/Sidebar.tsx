"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService, AdminUser } from "@/services/auth.service";
import { AdminSecurityModal } from "@/components/AdminSecurityModal";
import { getRoleMeta } from "@/app/staff/data/staffRoles";
import {
  SidebarHeader,
  SidebarNav,
  SidebarUserProfile,
  SidebarFooter,
  navGroups,
  type NavGroup,
} from "./sidebar-modules";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const navRef = useRef<HTMLElement | null>(null);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  // Smoothly bring active item into view with natural breathing room (no over-scrolling or massive empty gaps)
  const scrollToActiveItem = useCallback(() => {
    if (!navRef.current || !activeItemRef.current) return;
    const nav = navRef.current;
    const item = activeItemRef.current;

    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const currentScrollTop = nav.scrollTop;
    const itemRelativeTop = itemRect.top - navRect.top + currentScrollTop;
    const itemRelativeBottom = itemRelativeTop + item.offsetHeight;

    const visibleTop = currentScrollTop;
    const visibleBottom = currentScrollTop + nav.clientHeight;

    // Only scroll if item is partially outside visible bounds
    if (itemRelativeBottom > visibleBottom - 16) {
      // Modestly scroll down just enough to reveal the item with ~16px breathing room above the bottom card
      const targetScrollTop = itemRelativeBottom - nav.clientHeight + 16;
      nav.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    } else if (itemRelativeTop < visibleTop + 16) {
      // Modestly scroll up just enough to reveal the item with ~16px breathing room below the top header
      const targetScrollTop = itemRelativeTop - 16;
      nav.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
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

    authService
      .getMe()
      .then((user) => {
        if (user) {
          setAdminUser(user);
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_user", JSON.stringify(user));
          }
        }
        setUserLoading(false);
      })
      .catch(() => {
        setUserLoading(false);
      });
  }, []);

  // Ensure active navigation item stays in comfortable upper view upon route change or sidebar collapse/expand
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToActiveItem();
    }, 180);
    return () => clearTimeout(timer);
  }, [pathname, isExpanded, scrollToActiveItem]);

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
    router.refresh();
  };

  // Role-based navigation filtering using centralized role permissions
  const visibleNavGroups = useMemo(() => {
    // Prevent SSR hydration mismatch: on initial SSR pre-render keep static navGroups consistent
    if (!mounted || !adminUser) return navGroups;

    const role = adminUser.role;
    if (role === "SUPER_ADMIN") return navGroups;

    const roleMeta = getRoleMeta(role);
    if (!roleMeta || roleMeta.allowedRoutes.includes("*")) return navGroups;

    return navGroups
      .map((group) => {
        const allowedItems = group.items.filter((item) =>
          roleMeta.allowedRoutes.includes(item.href)
        );
        if (allowedItems.length === 0) return null;
        return {
          ...group,
          items: allowedItems,
        };
      })
      .filter(Boolean) as NavGroup[];
  }, [mounted, adminUser]);

  const handleOpenSecurityModal = () => {
    setIsExpanded(false);
    setIsSecurityModalOpen(true);
  };

  const handleNavItemClick = () => {
    setIsExpanded(false);
    setTimeout(() => {
      scrollToActiveItem();
    }, 140);
  };

  return (
    <aside
      className="sticky top-0 z-50 h-screen w-22 shrink-0 select-none"
      onMouseEnter={() => {
        if (!isSecurityModalOpen) {
          setIsExpanded(true);
          setTimeout(() => {
            scrollToActiveItem();
          }, 160);
        }
      }}
      onMouseLeave={() => {
        if (!isSecurityModalOpen) setIsExpanded(false);
      }}
      onFocus={(e) => {
        if (!isSecurityModalOpen && e.target.matches(":focus-visible")) setIsExpanded(true);
      }}
      onBlur={(e) => {
        if (!isSecurityModalOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsExpanded(false);
        }
      }}
    >
      <div
        className={`absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-white/10 bg-slate-950/90 text-slate-300 backdrop-blur-md transition-[width,box-shadow] duration-300 ease-out motion-reduce:transition-none ${
          isExpanded ? "w-72 shadow-2xl shadow-black/70" : "w-22"
        }`}
      >
        {/* Header Brand */}
        <SidebarHeader isExpanded={isExpanded} />

        {/* Navigation Groups */}
        <SidebarNav
          isExpanded={isExpanded}
          visibleNavGroups={visibleNavGroups}
          pathname={pathname}
          navRef={navRef}
          activeItemRef={activeItemRef}
          onItemClick={handleNavItemClick}
        />

        {/* Executive Admin Session & Security Module */}
        <SidebarUserProfile
          isExpanded={isExpanded}
          adminUser={adminUser}
          userLoading={userLoading}
          onOpenSecurityModal={handleOpenSecurityModal}
          onLogout={handleLogout}
        />

        {/* Footer Branding */}
        <SidebarFooter isExpanded={isExpanded} />
      </div>

      {/* Account Security & 2FA Modal */}
      <AdminSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onProfileUpdated={(user) => setAdminUser(user)}
      />
    </aside>
  );
}
