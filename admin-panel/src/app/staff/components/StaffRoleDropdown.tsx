"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { AdminRole } from "@/services/staff.service";
import { STAFF_ROLES, getRoleMeta } from "../data/staffRoles";

interface StaffRoleDropdownProps {
  role: AdminRole;
  onRoleChange: (newRole: AdminRole) => void;
  disabled?: boolean;
}

export function StaffRoleDropdown({
  role,
  onRoleChange,
  disabled = false,
}: StaffRoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const roleMeta = getRoleMeta(role);
  const IconComponent = roleMeta.icon;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (newRole: AdminRole) => {
    setIsOpen(false);
    if (newRole !== role) {
      onRoleChange(newRole);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Tight, compact trigger button hugging text and chevron */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs outline-none focus:ring-2 focus:ring-emerald-500/30 ${roleMeta.badgeClass} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="truncate">{roleMeta.title}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-current opacity-70 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 z-50 w-72 max-h-80 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <span>Select Operational Role</span>
            <span>{STAFF_ROLES.length} Roles</span>
          </div>

          <div className="pt-1 space-y-0.5">
            {STAFF_ROLES.map((r) => {
              const RoleIcon = r.icon;
              const isSelected = r.key === role;

              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleSelect(r.key)}
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50/80 text-emerald-950 font-bold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${r.colorHex}15`,
                        borderColor: `${r.colorHex}35`,
                        color: r.colorHex,
                      }}
                    >
                      <RoleIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">
                        {r.title}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight truncate mt-0.5">
                        {r.category}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
