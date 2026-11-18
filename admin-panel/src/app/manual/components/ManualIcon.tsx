"use client";

import React from "react";
import {
  Monitor,
  LayoutDashboard,
  CalendarDays,
  Compass,
  PackagePlus,
  Package,
  BadgeDollarSign,
  Utensils,
  Bed,
  MapPin,
  BookOpen,
  HelpCircle,
  CalendarOff,
  ClipboardList,
  Users,
  Images,
  MessageSquareText,
  Mail,
  Scale,
  ScrollText,
  ShieldCheck,
  AlertTriangle,
  Globe,
  FileJson,
  Sparkles,
  Car,
} from "lucide-react";
import { ManualIconKey } from "../data/manualMockData";

const ICON_MAP: Record<ManualIconKey, React.ComponentType<{ className?: string }>> = {
  monitor: Monitor,
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  compass: Compass,
  packagePlus: PackagePlus,
  package: Package,
  dollar: BadgeDollarSign,
  utensils: Utensils,
  bed: Bed,
  mapPin: MapPin,
  bookOpen: BookOpen,
  helpCircle: HelpCircle,
  calendarOff: CalendarOff,
  clipboard: ClipboardList,
  users: Users,
  images: Images,
  comments: MessageSquareText,
  mail: Mail,
  scale: Scale,
  scrollText: ScrollText,
  shieldCheck: ShieldCheck,
  alertTriangle: AlertTriangle,
  globe: Globe,
  fileJson: FileJson,
  sparkles: Sparkles,
  car: Car,
};

export function ManualIcon({
  name,
  className = "w-4 h-4",
}: {
  name: ManualIconKey;
  className?: string;
}) {
  const Icon = ICON_MAP[name] || Sparkles;
  return <Icon className={className} />;
}
