import {
  Crown,
  Compass,
  Package,
  MapPin,
  BookOpen,
  CalendarDays,
  Car,
  Mail,
  MessageSquareText,
  Scale,
  type LucideIcon,
} from "lucide-react";
import type { AdminRole } from "@/services/staff.service";

export interface RoleDefinition {
  key: AdminRole;
  title: string;
  shortLabel: string;
  category: "Executive" | "Operations" | "Content" | "Support & Compliance";
  description: string;
  icon: LucideIcon;
  badgeClass: string;
  colorHex: string;
  allowedRoutes: string[];
}

export const STAFF_ROLES: RoleDefinition[] = [
  {
    key: "SUPER_ADMIN",
    title: "Super Administrator",
    shortLabel: "Super Admin",
    category: "Executive",
    description: "Unrestricted root privileges across all database records, system settings, financial guidelines, and staff provisioning.",
    icon: Crown,
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
    colorHex: "#059669",
    allowedRoutes: ["*"],
  },
  {
    key: "OPERATIONS_MANAGER",
    title: "Operations Director",
    shortLabel: "Ops Manager",
    category: "Operations",
    description: "Oversees incoming tour bookings, logistics dispatch, private chauffeurs, custom tour plans, and guest requests.",
    icon: Compass,
    badgeClass: "bg-sky-50 text-sky-800 border-sky-300",
    colorHex: "#0284c7",
    allowedRoutes: ["/dashboard", "/tours", "/tourservices", "/users", "/contact", "/manual"],
  },
  {
    key: "PACKAGE_MANAGER",
    title: "Tour Package Lead",
    shortLabel: "Package Lead",
    category: "Content",
    description: "Authors and updates tour packages, day-by-day itineraries, tier pricing, highlights, exclusions, and media covers.",
    icon: Package,
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
    colorHex: "#d97706",
    allowedRoutes: ["/dashboard", "/managepackages", "/addpackage", "/imageupload", "/manual"],
  },
  {
    key: "DESTINATION_EXPERT",
    title: "Destination Specialist",
    shortLabel: "Destinations",
    category: "Content",
    description: "Curates Sri Lanka travel destinations, province highlights, weather advisories, best times to visit, and attraction guides.",
    icon: MapPin,
    badgeClass: "bg-teal-50 text-teal-800 border-teal-300",
    colorHex: "#0d9488",
    allowedRoutes: ["/dashboard", "/managedestinations", "/destinations", "/imageupload", "/manual"],
  },
  {
    key: "CONTENT_EDITOR",
    title: "Multilingual Content Editor",
    shortLabel: "Content Editor",
    category: "Content",
    description: "Publishes multilingual travel stories, SEO blogs, Sri Lanka cultural guides, travel tips, and formatted articles.",
    icon: BookOpen,
    badgeClass: "bg-violet-50 text-violet-800 border-violet-300",
    colorHex: "#7c3aed",
    allowedRoutes: ["/dashboard", "/manageblogs", "/blogs", "/managefaqs", "/faqs", "/imageupload", "/manual"],
  },
  {
    key: "BOOKING_AGENT",
    title: "Tour Booking Specialist",
    shortLabel: "Booking Agent",
    category: "Operations",
    description: "Reviews individual and custom reservation requests, confirms travel dates, processes guest counts, and coordinates transfers.",
    icon: CalendarDays,
    badgeClass: "bg-blue-50 text-blue-800 border-blue-300",
    colorHex: "#2563eb",
    allowedRoutes: ["/dashboard", "/tours", "/newupdates", "/manual"],
  },
  {
    key: "TRANSPORT_COORDINATOR",
    title: "Transport & Fleet Manager",
    shortLabel: "Fleet Manager",
    category: "Operations",
    description: "Manages private chauffeur guidelines, vehicle fleet capacities, luggage limits, chauffeur guides, and transfer rates.",
    icon: Car,
    badgeClass: "bg-orange-50 text-orange-800 border-orange-300",
    colorHex: "#ea580c",
    allowedRoutes: ["/dashboard", "/tourservices", "/servicepricing", "/servicenotes", "/manual"],
  },
  {
    key: "CUSTOMER_SUPPORT",
    title: "Customer Support Executive",
    shortLabel: "Customer Support",
    category: "Support & Compliance",
    description: "Responds to guest contact inquiries, WhatsApp messages, travel assistance questions, and incoming web leads.",
    icon: Mail,
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-300",
    colorHex: "#4f46e5",
    allowedRoutes: ["/dashboard", "/contact", "/managefaqs", "/faqs", "/manual"],
  },
  {
    key: "REVIEW_MODERATOR",
    title: "Guest Reviews Moderator",
    shortLabel: "Reviews Moderator",
    category: "Support & Compliance",
    description: "Moderates traveler tour reviews and website testimonials, flags spam, and drafts official team responses.",
    icon: MessageSquareText,
    badgeClass: "bg-pink-50 text-pink-800 border-pink-300",
    colorHex: "#db2777",
    allowedRoutes: ["/dashboard", "/comments", "/manual"],
  },
  {
    key: "LEGAL_COMPLIANCE",
    title: "Legal & Compliance Officer",
    shortLabel: "Compliance",
    category: "Support & Compliance",
    description: "Maintains terms of service, privacy regulations, cookie policy documentation, and audits administrative access logs.",
    icon: Scale,
    badgeClass: "bg-purple-50 text-purple-800 border-purple-300",
    colorHex: "#9333ea",
    allowedRoutes: ["/dashboard", "/legaldocs", "/adminlogs", "/manual"],
  },
];

export function getRoleMeta(roleKey?: string): RoleDefinition {
  const found = STAFF_ROLES.find((r) => r.key === roleKey);
  return (
    found || {
      key: "SUPER_ADMIN" as AdminRole,
      title: "Staff Administrator",
      shortLabel: "Staff",
      category: "Executive",
      description: "General administrative staff permissions.",
      icon: Crown,
      badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
      colorHex: "#475569",
      allowedRoutes: ["*"],
    }
  );
}
