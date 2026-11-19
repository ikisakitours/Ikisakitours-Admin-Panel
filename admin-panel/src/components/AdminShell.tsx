"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Static Sidebar: locked in place, never reloads */}
      <Sidebar />

      {/* Dynamic Content Area */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
