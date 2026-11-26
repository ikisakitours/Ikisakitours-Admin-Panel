import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Compass,
  MessageSquareText,
  Mail,
  Package,
  PackagePlus,
  BookOpen,
  MapPin,
  HelpCircle,
  Scale,
  BadgeDollarSign,
  CalendarOff,
  ClipboardList,
  Images,
  ScrollText,
  BookMarked,
  type LucideIcon,
  FileText,
  FilePlus2,
  MessageSquarePlus,
  MapPinPlus,
  UserCheck,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { title: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Bookings & Operations",
    items: [
      { href: "/tours", label: "Tour Bookings", icon: CalendarDays },
      { href: "/tourservices", label: "Tour Services", icon: Compass },
      { href: "/itinerary-editor", label: "PDF Itinerary Studio", icon: FileText },
    ],
  },
  {
    title: "User Management",
    items: [
      { href: "/users", label: "Registered Users", icon: Users },
      { href: "/staff", label: "Staff & Team (RBAC)", icon: UserCheck },
    ],
  },
  {
    title: "Tour Packages",
    items: [
      { href: "/managepackages", label: "Manage Packages", icon: Package },
      { href: "/addpackage", label: "Add Tour Package", icon: PackagePlus },
    ],
  },
  {
    title: "Destinations",
    items: [
      { href: "/managedestinations", label: "Manage Destinations", icon: MapPin },
      { href: "/destinations", label: "Add Destination", icon: MapPinPlus },
    ],
  },
  {
    title: "Blog Articles",
    items: [
      { href: "/manageblogs", label: "Manage Blogs", icon: BookOpen },
      { href: "/blogs", label: "Add Blog Article", icon: FilePlus2 },
    ],
  },
  {
    title: "FAQs & Help",
    items: [
      { href: "/managefaqs", label: "Manage FAQs", icon: HelpCircle },
      { href: "/faqs", label: "Add FAQ", icon: MessageSquarePlus },
    ],
  },
  {
    title: "Availability & Rates",
    items: [
      { href: "/newupdates", label: "Date Availability", icon: CalendarOff },
      { href: "/servicepricing", label: "Services Price Note", icon: BadgeDollarSign },
      { href: "/servicenotes", label: "Add Services price ", icon: ClipboardList },
    ],
  },
  {
    title: "Media & Engagement",
    items: [
      { href: "/imageupload", label: "Media Gallery", icon: Images },
      { href: "/comments", label: "Reviews & Feedback", icon: MessageSquareText },
      { href: "/contact", label: "Contact Inquiries", icon: Mail },
    ],
  },
  {
    title: "Compliance & System",
    items: [
      { href: "/legaldocs", label: "Legal Documents", icon: Scale },
      { href: "/adminlogs", label: "Audit Logs", icon: ScrollText },
    ],
  },
  {
    title: "Help & Guide",
    items: [
      { href: "/manual", label: "Admin Manual Guide", icon: BookMarked },
    ],
  },
];
