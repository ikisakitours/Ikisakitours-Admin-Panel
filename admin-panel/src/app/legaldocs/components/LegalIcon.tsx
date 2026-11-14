"use client";

import React from "react";
import {
  FileText,
  Shield,
  Globe,
  User,
  Scale,
  Folder,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  CreditCard,
  Cookie,
  CheckCircle2,
  Lock,
  Users,
  ScrollText,
  Bookmark,
  Clock,
  Info,
  AlertCircle,
  HelpCircle,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export const LEGAL_ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Shield,
  Globe,
  User,
  Users,
  Scale,
  Folder,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  CreditCard,
  Cookie,
  CheckCircle2,
  Lock,
  ScrollText,
  Bookmark,
  Clock,
  Info,
  AlertCircle,
  HelpCircle,
  Briefcase,
};

export const LEGAL_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "FileText", label: "Document (FileText)" },
  { value: "Shield", label: "Security / Policy (Shield)" },
  { value: "Scale", label: "Legal / Terms (Scale)" },
  { value: "ScrollText", label: "Agreement (ScrollText)" },
  { value: "Globe", label: "Global / Tours (Globe)" },
  { value: "User", label: "User (User)" },
  { value: "Users", label: "Users / Conduct (Users)" },
  { value: "Lock", label: "Privacy / Lock (Lock)" },
  { value: "Folder", label: "Data / Collection (Folder)" },
  { value: "Settings", label: "Preferences (Settings)" },
  { value: "CheckCircle2", label: "Verified / Check (CheckCircle2)" },
  { value: "Calendar", label: "Schedule / Dates (Calendar)" },
  { value: "Clock", label: "Timing / Duration (Clock)" },
  { value: "RefreshCw", label: "Refund / Updates (RefreshCw)" },
  { value: "CreditCard", label: "Payment (CreditCard)" },
  { value: "Bookmark", label: "Deposit / Highlight (Bookmark)" },
  { value: "Cookie", label: "Cookies (Cookie)" },
  { value: "Mail", label: "Email (Mail)" },
  { value: "Phone", label: "Phone (Phone)" },
  { value: "MapPin", label: "Location / Address (MapPin)" },
  { value: "Info", label: "Information (Info)" },
  { value: "AlertCircle", label: "Notice / Alert (AlertCircle)" },
  { value: "HelpCircle", label: "Help / FAQ (HelpCircle)" },
  { value: "Briefcase", label: "Service / Business (Briefcase)" },
];

export function LegalIcon({
  name,
  className = "w-4 h-4",
}: {
  name?: string;
  className?: string;
}) {
  const Icon = (name && LEGAL_ICON_MAP[name]) || FileText;
  return <Icon className={className} />;
}

