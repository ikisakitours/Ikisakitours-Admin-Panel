// Centralized Manual Guide Data & Configuration for Ikisaki Tours Admin Panel
// Maintain all operational guides, workflows, tables, checklists, and troubleshooting entries here.

export type ManualSectionId =
  | "getting-started"
  | "dashboard"
  | "bookings"
  | "packages"
  | "pricing"
  | "itinerary"
  | "destinations"
  | "content"
  | "availability"
  | "engagement"
  | "compliance"
  | "json-ai"
  | "checklist"
  | "troubleshooting";

export type ManualIconKey =
  | "monitor"
  | "dashboard"
  | "calendar"
  | "compass"
  | "packagePlus"
  | "package"
  | "dollar"
  | "utensils"
  | "bed"
  | "mapPin"
  | "bookOpen"
  | "helpCircle"
  | "calendarOff"
  | "clipboard"
  | "users"
  | "images"
  | "comments"
  | "mail"
  | "scale"
  | "scrollText"
  | "shieldCheck"
  | "alertTriangle"
  | "globe"
  | "fileJson"
  | "sparkles"
  | "car";

export interface TocItemData {
  id: ManualSectionId;
  number: string;
  title: string;
  shortDesc: string;
  icon: ManualIconKey;
  keywords: string[];
}

export interface HeroStatData {
  label: string;
  value: string;
  accentClass: string;
}

export interface QuickModuleCardData {
  label: string;
  href: string;
  desc: string;
  icon: ManualIconKey;
  colorClass: string;
}

export interface ModuleFeatureBlock {
  title: string;
  route?: string;
  icon: ManualIconKey;
  iconColorClass: string;
  summary: string;
  steps?: string[];
  bullets: string[];
  badges?: string[];
}

export interface GenericGuideSectionData {
  id: ManualSectionId;
  number: string;
  title: string;
  subtitle: string;
  icon: ManualIconKey;
  actionHref?: string;
  actionLabel?: string;
  blocks: ModuleFeatureBlock[];
  proTip?: string;
  warning?: string;
}

export interface VehicleTierGuideRow {
  tier: string;
  min: number;
  max: number;
  vehicle: string;
  note: string;
}

export interface PassengerRuleGuide {
  title: string;
  badge: string;
  description: string;
}

export interface AddOnTypeGuide {
  code: string;
  title: string;
  examples: string;
  behavior: string;
  styleClass: string;
  badgeClass: string;
}

export interface TroubleshootingItemData {
  question: string;
  module: string;
  cause: string;
  solution: string;
}

export interface SampleTemplateDownload {
  id: string;
  label: string;
  shortLabel: string;
  fileName: string;
  href: string;
  targetRoute: string;
  moduleBadge: string;
  badgeClass: string;
  description: string;
}

export interface AiPromptTemplate {
  id: "package" | "destination" | "blog";
  tabLabel: string;
  title: string;
  targetRoute: string;
  matchingJsonFile: string;
  whenToUse: string;
  promptText: string;
}

/* ── 1. HERO STATS & QUICK SEARCH CHIPS ── */
export const MANUAL_HERO_STATS: HeroStatData[] = [
  { label: "Admin Modules", value: "12 Groups · 22 Pages", accentClass: "text-emerald-300" },
  { label: "Multilingual CMS", value: "EN · JA + Custom", accentClass: "text-white" },
  { label: "Staff & RBAC", value: "10 Roles · 2FA TOTP", accentClass: "text-amber-300" },
  { label: "Media & Guard", value: "WebP · PC ≥1024px", accentClass: "text-teal-300" },
];

export const MANUAL_SEARCH_CHIPS: string[] = [
  "packages",
  "pricing",
  "staff",
  "2fa",
  "rbac",
  "security",
  "json",
  "ai",
  "japanese",
  "meals",
  "webp",
  "troubleshooting",
];

/* ── 2. ALL DOWNLOADABLE SAMPLE JSON TEMPLATES ── */
export const SAMPLE_TEMPLATES: SampleTemplateDownload[] = [
  {
    id: "oneday-tour",
    label: "One-Day Tour Package JSON",
    shortLabel: "One-Day JSON",
    fileName: "sample-oneday-tour.json",
    href: "/sample-packages/sample-oneday-tour.json",
    targetRoute: "/addpackage",
    moduleBadge: "Tour Packages",
    badgeClass: "bg-violet-100 text-violet-700 border-violet-200",
    description: "Complete express single-day tour structure with EN/JA translations, tiers, add-ons & itinerary.",
  },
  {
    id: "multiday-tour",
    label: "Multi-Day Tour Package JSON",
    shortLabel: "Multi-Day JSON",
    fileName: "sample-multiday-tour.json",
    href: "/sample-packages/sample-multiday-tour.json",
    targetRoute: "/addpackage",
    moduleBadge: "Tour Packages",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
    description: "Full 8-day Sri Lanka tour structure with Group Tiers, dynamic meals[], accommodation[] & add-ons.",
  },
  {
    id: "destination",
    label: "Destination Hub JSON",
    shortLabel: "Destination JSON",
    fileName: "sample-destination.json",
    href: "/sample-packages/sample-destination.json",
    targetRoute: "/destinations",
    moduleBadge: "Destinations",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
    description: "Multilingual destination structure with GPS coordinates, quick facts (climate, best time) & highlights.",
  },
  {
    id: "blog",
    label: "Blog Article JSON",
    shortLabel: "Blog JSON",
    fileName: "sample-blog.json",
    href: "/sample-packages/sample-blog.json",
    targetRoute: "/blogs",
    moduleBadge: "Blog Articles",
    badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
    description: "Multilingual SEO blog article structure with slug, author, category, readTime, summary & full content.",
  },
];

/* ── 2B. READY-TO-COPY AI PROMPTS FOR GENERATING / MODIFYING JSONS ── */
export const AI_GENERATOR_PROMPTS: AiPromptTemplate[] = [
  {
    id: "package",
    tabLabel: "Tour Package AI Prompt",
    title: "Generate or Modify a One-Day / Multi-Day Tour Package JSON",
    targetRoute: "/addpackage",
    matchingJsonFile: "sample-oneday-tour.json or sample-multiday-tour.json",
    whenToUse:
      "Use this when you have rough tour notes, a client itinerary idea, or an existing tour description (in English, Sinhala, or Japanese) and want ChatGPT / Gemini / Claude to generate a 100% upload-ready bilingual EN + JA JSON file.",
    promptText: `You are an expert luxury Sri Lanka tour copywriter and JSON data engineer for Ikisaki Tours (www.ikisakitours.com).

TASK:
Using the attached/pasted Ikisaki Tours Sample Package JSON structure as the EXACT schema, generate a brand-new, production-ready, 100% valid JSON file based on my rough tour content/idea below.

STRICT SCHEMA & BUSINESS RULES (DO NOT BREAK ANY RULE):
1. Keep ALL top-level and nested keys identical to the sample JSON structure. Return ONLY valid raw JSON (no markdown explanations outside the JSON block).
2. Bilingual Content: Populate BOTH "en" (natural luxury travel English) and "ja" (natural polite Japanese for travelers) for every translatable object.
3. "type": Must be strictly "oneday" or "multiday".
4. "slug": Generate a UNIQUE lowercase hyphenated URL slug strictly from title.en ONLY (do NOT include titleEmphasis in the slug).
5. "title" & "titleEmphasis" (CRITICAL GOLD HIGHLIGHT RULE):
   - "titleEmphasis.en" MUST be an exact character-for-character substring inside "title.en".
   - "titleEmphasis.ja" MUST be an exact character-for-character substring inside "title.ja" using the EXACT SAME Japanese script (do NOT mix Kanji 究極 in title with Katakana アルティメット in titleEmphasis).
6. "badge": Use ONLY one of these valid values:
   "best_seller", "top_rated", "popular", "featured", "new_arrival", "exclusive", "limited_availability", "likely_to_sell_out", "instant_confirmation", "bucket_list", "all_inclusive", "family_friendly", "honeymoon_special", "unesco_heritage", "private_tour", "seasonal", "eco_friendly", "none".
7. "pricingConfig.tiers": Must be contiguous with ZERO gaps and ZERO overlaps (e.g. 1-1, 2-2, 3-4, 5-7, 8-15). Per-person price must decrease as group size increases.
8. "pricingConfig.options": Each add-on must have a unique "id" and "calculationType" set to strictly "per_person", "per_room", or "per_booking".
9. "itinerary": Every day's "meals" and "accommodation" MUST be multilingual arrays of strings:
   - "meals": { "en": ["Breakfast Included", "Lunch Not Included", "Dinner Included"], "ja": ["朝食付き", "昼食なし", "夕食付き"] }
   - "accommodation": { "en": ["Hotel Name (4-Star)"], "ja": ["ホテル名（4つ星）"] }
10. Do NOT include any image URLs or gallery files (I will upload gallery photos manually in the admin panel).

---
[PASTE YOUR SAMPLE JSON STRUCTURE HERE]

---
[PASTE YOUR ROUGH TOUR IDEA / NOTES / PRICES HERE (English, Sinhala, or Japanese)]`,
  },
  {
    id: "destination",
    tabLabel: "Destination AI Prompt",
    title: "Generate or Modify a Sri Lanka Destination JSON",
    targetRoute: "/destinations",
    matchingJsonFile: "sample-destination.json",
    whenToUse:
      "Use this when adding a new Sri Lanka city, beach, heritage site, or national park to /destinations before linking it to tour packages.",
    promptText: `You are a Sri Lanka destination specialist and JSON content engineer for Ikisaki Tours.

TASK:
Using the exact schema of "sample-destination.json" below, create a 100% valid, bilingual (EN + JA) Destination JSON for the Sri Lanka location I describe.

STRICT RULES:
1. Return ONLY valid raw JSON matching these exact keys:
   "slug", "title", "summary", "description", "province", "bestTimeToVisit", "climate", "primaryLanguage", "localCurrency", "coordinates": { "lat": number, "lng": number }, "highlights": { "en": string[], "ja": string[] }.
2. "slug": Lowercase, hyphenated, unique URL slug derived from title.en.
3. "coordinates": Provide accurate real-world Sri Lanka GPS latitude ("lat") and longitude ("lng") as numeric values.
4. Provide natural, inspiring luxury travel copy in both English ("en") and Japanese ("ja").
5. Include 4 to 6 strong bullet points in "highlights.en" and "highlights.ja".
6. Do NOT include image fields (I will upload photos manually in the admin panel).

---
[PASTE sample-destination.json HERE]

---
[WRITE THE DESTINATION NAME & ANY SPECIAL NOTES HERE (e.g. Ella Nine Arch Bridge, Galle Fort, Yala National Park)]`,
  },
  {
    id: "blog",
    tabLabel: "Blog Article AI Prompt",
    title: "Generate or Modify an SEO Multilingual Blog Article JSON",
    targetRoute: "/blogs",
    matchingJsonFile: "sample-blog.json",
    whenToUse:
      "Use this when you have a travel topic, seasonal tip, or rough draft and want a full SEO-friendly English + Japanese blog article ready to upload directly into /blogs.",
    promptText: `You are an SEO travel journalist writing for Ikisaki Tours (a luxury private Sri Lanka tour operator serving English and Japanese travelers).

TASK:
Using the exact schema of "sample-blog.json" below, write a complete, engaging, SEO-optimized bilingual (EN + JA) blog article based on my topic/notes and output it as a 100% valid JSON file.

STRICT RULES:
1. Return ONLY valid raw JSON with these exact keys:
   "slug" (string), "author" (string), "category" ({ "en", "ja" }), "readTime" ({ "en", "ja" }), "title" ({ "en", "ja" }), "summary" ({ "en", "ja" }), "blog" ({ "en", "ja" }).
2. "slug": Clean, SEO-friendly lowercase hyphenated slug based on title.en.
3. "blog.en" and "blog.ja": Write well-structured, informative paragraphs separated by \\n\\n with numbered sections and practical advice from Ikisaki Tours.
4. Keep "summary" concise (1-2 compelling sentences) for blog preview cards and meta descriptions.
5. Do NOT include image fields (I will upload cover images manually on /blogs).

---
[PASTE sample-blog.json HERE]

---
[WRITE YOUR BLOG TOPIC, KEY POINTS, OR ROUGH DRAFT HERE]`,
  },
];

/* ── 3. TABLE OF CONTENTS ── */
export const MANUAL_TOC_ITEMS: TocItemData[] = [
  {
    id: "getting-started",
    number: "01",
    title: "Getting Started & Directory",
    shortDesc: "Desktop requirements, sidebar & all routes",
    icon: "monitor",
    keywords: ["start", "desktop", "sidebar", "navigation", "overview", "routes", "screen", "directory"],
  },
  {
    id: "dashboard",
    number: "02",
    title: "Dashboard & Analytics",
    shortDesc: "Monthly traffic, impressions, clicks & SEO rank",
    icon: "dashboard",
    keywords: ["dashboard", "analytics", "charts", "kpi", "visitors", "impressions", "clicks", "seo", "month"],
  },
  {
    id: "bookings",
    number: "03",
    title: "Bookings & Tour Services",
    shortDesc: "Package bookings, custom, chauffeur & transfers",
    icon: "calendar",
    keywords: ["bookings", "tours", "oneday", "multiday", "custom", "chauffeur", "transfer", "status", "pending", "confirmed", "approved", "rejected"],
  },
  {
    id: "packages",
    number: "04",
    title: "Tour Packages & Titles",
    shortDesc: "JSON upload, EN/JA, Gold Highlight & Slug",
    icon: "packagePlus",
    keywords: ["package", "addpackage", "managepackages", "json", "slug", "title", "highlight", "gold", "japanese", "kanji", "katakana", "badge", "multilingual", "edit", "patch"],
  },
  {
    id: "pricing",
    number: "05",
    title: "Dynamic Pricing & Add-Ons",
    shortDesc: "Vehicle tiers, no-gap rule, child/couple & extras",
    icon: "dollar",
    keywords: ["pricing", "tier", "group", "discount", "vehicle", "couple", "child", "infant", "addon", "per_person", "per_room", "per_booking", "simulator", "gap"],
  },
  {
    id: "itinerary",
    number: "06",
    title: "Itinerary, Meals & Gallery",
    shortDesc: "Dynamic meals/hotels, route flow & gallery upload",
    icon: "utensils",
    keywords: ["itinerary", "meals", "accommodation", "hotel", "gallery", "images", "route", "activities", "scenic", "highlights", "includes", "excludes"],
  },
  {
    id: "destinations",
    number: "07",
    title: "Destinations Management",
    shortDesc: "JSON import, quick facts, media & route hubs",
    icon: "mapPin",
    keywords: ["destination", "managedestinations", "locations", "route", "sequence", "quick facts", "json", "sigiriya", "kandy", "ella"],
  },
  {
    id: "content",
    number: "08",
    title: "Blog Articles & FAQs",
    shortDesc: "Multilingual blogs, JSON importer & support FAQs",
    icon: "bookOpen",
    keywords: ["blog", "manageblogs", "article", "faq", "managefaqs", "seo", "help", "readtime", "slug", "json"],
  },
  {
    id: "availability",
    number: "09",
    title: "Availability, Rates & Notes",
    shortDesc: "Closed dates, charter rates & vehicle guidelines",
    icon: "calendarOff",
    keywords: ["availability", "closed", "dates", "calendar", "newupdates", "servicepricing", "servicenotes", "guidelines", "charter", "driver", "guide", "luggage"],
  },
  {
    id: "engagement",
    number: "10",
    title: "Users, Media, Reviews & Inbox",
    shortDesc: "Users, WebP uploader, review replies & contact",
    icon: "users",
    keywords: ["users", "imageupload", "media", "gallery", "webp", "batch", "comments", "reviews", "reply", "contact", "inquiries"],
  },
  {
    id: "compliance",
    number: "11",
    title: "Staff & RBAC, Legal Docs & Logs",
    shortDesc: "10-Role RBAC, 2FA, legal policies & daily operations log",
    icon: "shieldCheck",
    keywords: [
      "staff",
      "rbac",
      "roles",
      "role",
      "2fa",
      "totp",
      "security",
      "authenticator",
      "google authenticator",
      "fouc",
      "restricted",
      "access",
      "suspended",
      "avatar",
      "r2",
      "cleanup",
      "legal",
      "legaldocs",
      "privacy",
      "terms",
      "sections",
      "adminlogs",
      "logs",
      "driver",
      "notes",
      "operations",
    ],
  },
  {
    id: "json-ai",
    number: "12",
    title: "JSON Templates & AI Prompts",
    shortDesc: "Download all JSON schemas & copy AI generator prompts",
    icon: "fileJson",
    keywords: ["json", "template", "download", "ai", "prompt", "chatgpt", "gemini", "claude", "modify", "structure", "schema", "package", "destination", "blog"],
  },
  {
    id: "checklist",
    number: "13",
    title: "Pre-Publish Checklist",
    shortDesc: "Interactive quality check before saving tours",
    icon: "shieldCheck",
    keywords: ["checklist", "verify", "publish", "save", "quality", "review"],
  },
  {
    id: "troubleshooting",
    number: "14",
    title: "Troubleshooting & Fixes",
    shortDesc: "Instant fixes for errors, slugs, WebP & highlights",
    icon: "alertTriangle",
    keywords: ["error", "500", "duplicate", "slug", "bug", "fix", "troubleshooting", "problem", "gap", "webp", "japanese", "desktop"],
  },
];

/* ── 4. QUICK-LAUNCH MODULE DIRECTORY (ALL ROUTES) ── */
export const QUICK_DIRECTORY_MODULES: QuickModuleCardData[] = [
  { label: "Dashboard", href: "/dashboard", desc: "Visitors, clicks & SEO charts", icon: "dashboard", colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { label: "Staff & RBAC", href: "/staff", desc: "10 Roles, 2FA & team permissions", icon: "shieldCheck", colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { label: "Tour Bookings", href: "/tours", desc: "One-Day & Multi-Day bookings", icon: "calendar", colorClass: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Tour Services", href: "/tourservices", desc: "Custom, Chauffeur & Transfers", icon: "compass", colorClass: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { label: "Registered Users", href: "/users", desc: "Customer accounts & emails", icon: "users", colorClass: "text-sky-600 bg-sky-50 border-sky-200" },
  { label: "Add Tour Package", href: "/addpackage", desc: "Create EN/JA tour package", icon: "packagePlus", colorClass: "text-violet-600 bg-violet-50 border-violet-200" },
  { label: "Manage Packages", href: "/managepackages", desc: "Inline edit live packages", icon: "package", colorClass: "text-purple-600 bg-purple-50 border-purple-200" },
  { label: "Destinations", href: "/managedestinations", desc: "Manage & add Sri Lanka hubs", icon: "mapPin", colorClass: "text-rose-600 bg-rose-50 border-rose-200" },
  { label: "Blog Articles", href: "/manageblogs", desc: "Multilingual travel articles", icon: "bookOpen", colorClass: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { label: "FAQs & Help", href: "/managefaqs", desc: "Support questions & answers", icon: "helpCircle", colorClass: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200" },
  { label: "Date Availability", href: "/newupdates", desc: "Block dates & multilingual notes", icon: "calendarOff", colorClass: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "Service Pricing", href: "/servicepricing", desc: "Charter, Custom & Transfer rates", icon: "dollar", colorClass: "text-teal-600 bg-teal-50 border-teal-200" },
  { label: "Service Guidelines", href: "/servicenotes", desc: "Vehicle specs & service notes", icon: "clipboard", colorClass: "text-lime-700 bg-lime-50 border-lime-200" },
  { label: "Media Gallery", href: "/imageupload", desc: "Strict WebP batch uploader", icon: "images", colorClass: "text-pink-600 bg-pink-50 border-pink-200" },
  { label: "Reviews & Contact", href: "/comments", desc: "Reply to reviews & read inbox", icon: "comments", colorClass: "text-orange-600 bg-orange-50 border-orange-200" },
  { label: "Legal Documents", href: "/legaldocs", desc: "Privacy, Terms & policies", icon: "scale", colorClass: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  { label: "Operations Log", href: "/adminlogs", desc: "Daily team & driver notes", icon: "scrollText", colorClass: "text-slate-700 bg-slate-100 border-slate-300" },
];

/* ── 5. DATA-DRIVEN SECTIONS (DASHBOARD, BOOKINGS, ITINERARY, DESTINATIONS, CONTENT, AVAILABILITY, ENGAGEMENT, COMPLIANCE) ── */
export const GENERIC_GUIDE_SECTIONS: Record<
  Exclude<ManualSectionId, "getting-started" | "packages" | "pricing" | "json-ai" | "checklist" | "troubleshooting">,
  GenericGuideSectionData
> = {
  dashboard: {
    id: "dashboard",
    number: "02",
    title: "Dashboard & Platform Analytics",
    subtitle: "Monitor website visitors, impressions, clicks, and SEO rankings month-by-month.",
    icon: "dashboard",
    actionHref: "/dashboard",
    actionLabel: "Open Dashboard",
    blocks: [
      {
        title: "Monthly KPI Stat Cards",
        route: "/dashboard",
        icon: "dashboard",
        iconColorClass: "text-emerald-600",
        summary: "Use the Month Picker in the top-right corner to switch reporting periods and compare performance.",
        bullets: [
          "Total Visitors: Tracks monthly unique audience growth percentage.",
          "Feed Impressions: Measures how frequently Ikisaki Tours appears in search and social feeds.",
          "Total Clicks: Shows direct customer click-through traffic onto tour pages.",
          "Avg. SEO Position: Tracks Google ranking movement (# position change) across target keywords.",
        ],
      },
      {
        title: "Interactive Daily Growth Chart",
        icon: "sparkles",
        iconColorClass: "text-indigo-600",
        summary: "Powered by Recharts to visualize day-by-day traffic peaks inside the selected month.",
        bullets: [
          "Hover over any data point on the graph to view exact daily visitor and click breakdowns.",
          "Use peak traffic periods to decide when to promote Featured or Seasonal badges on packages.",
        ],
      },
    ],
  },

  bookings: {
    id: "bookings",
    number: "03",
    title: "Bookings & Tour Services Operations",
    subtitle: "Process fixed One-Day / Multi-Day bookings and tailor-made service requests from one workflow.",
    icon: "calendar",
    actionHref: "/tours",
    actionLabel: "Open Tour Bookings",
    blocks: [
      {
        title: "One-Day & Multi-Day Tour Bookings",
        route: "/tours",
        icon: "calendar",
        iconColorClass: "text-blue-600",
        summary: "Displays every booking submitted from published tour package pages with live status management.",
        badges: ["Pending", "Confirmed", "Completed", "Cancelled"],
        bullets: [
          "Use the top Filter By dropdown to isolate All Fixed Packages, One-Day Tours, or Multi-Day Tours.",
          "Each card shows Client Name, Email, Country, Selected Package Name, Journey Date, and full traveler count breakdown (Adults, Couples, Children, Infants).",
          "Change status directly from the color-coded dropdown (Pending → Confirmed → Completed / Cancelled) — updates save instantly to the backend.",
          "Use the Delete button (with confirmation prompt) only to remove test or spam bookings.",
        ],
      },
      {
        title: "Tour Services Inquiries",
        route: "/tourservices",
        icon: "compass",
        iconColorClass: "text-indigo-600",
        summary: "Tabbed inbox managing non-package custom travel requests with category & status filtering.",
        badges: ["Pending", "Approved", "Active", "Rejected"],
        bullets: [
          "Tab 1 — Custom Made Tours: Tailor-made multi-day Sri Lanka itineraries requested by travelers.",
          "Tab 2 — Private Chauffeur: Dedicated vehicle + English/Japanese chauffeur hire requests.",
          "Tab 3 — Transfers: Point-to-point airport pickups (BIA) and intercity hotel transfers.",
          "Use the Status Filter dropdown (All / Pending / Approved / Active / Rejected) to focus on open leads.",
        ],
      },
    ],
    proTip:
      "After confirming a high-season booking on /tours or /tourservices, check /newupdates to block out that date if your fleet is fully allocated, and note the assigned chauffeur inside /adminlogs.",
  },

  itinerary: {
    id: "itinerary",
    number: "06",
    title: "Day-by-Day Itinerary, Dynamic Meals, Hotels & Gallery",
    subtitle: "Craft detailed daily schedules, explicit meal inclusions/exclusions, multiple hotel options, and photo galleries.",
    icon: "utensils",
    actionHref: "/addpackage",
    actionLabel: "Open Package Builder",
    blocks: [
      {
        title: "Dynamic Meals Builder (+ Add Meal)",
        icon: "utensils",
        iconColorClass: "text-amber-600",
        summary: "Add each meal as its own dedicated item per day (in both EN and JA) so guests clearly see what is included vs excluded.",
        bullets: [
          "Example Line 1: Breakfast Included (Hotel Buffet)",
          "Example Line 2: Lunch Not Included (Own Expense)",
          "Example Line 3: Gourmet Dinner Included",
          "On the live website, every meal line renders with its own gold Utensils icon.",
        ],
      },
      {
        title: "Dynamic Accommodation Builder (+ Add Accommodation)",
        icon: "bed",
        iconColorClass: "text-indigo-600",
        summary: "List one or more overnight hotel options for each day (supports primary + alternative star categories).",
        bullets: [
          "Example Line 1: Heritance Kandalama (5-Star Eco Resort)",
          "Example Line 2: Aliya Resort & Spa Sigiriya (4-Star)",
          "Each hotel displays on the website with its own gold Bed icon inside the day accordion.",
        ],
      },
      {
        title: "Route Flow, Locations, Activities & Scenic Stops",
        icon: "mapPin",
        iconColorClass: "text-emerald-600",
        summary: "Structure each day with scannable chips and bullet timelines.",
        bullets: [
          "Route Flow: Enter stops in transit order (e.g., Airport → Pinnawala → Sigiriya) to render arrow-connected route pills.",
          "Locations: Highlight key towns/regions visited that day.",
          "Day Details, Scenic Stops & Activities: Add bullet points describing exact experiences, viewpoints, and travel duration.",
          "Highlights, Includes & Excludes: Fill in the HighlightsAndExtras section in both EN and JA for clear expectation setting.",
        ],
      },
      {
        title: "Gallery Images & Destination Sequence Picker",
        icon: "images",
        iconColorClass: "text-pink-600",
        summary: "Visual storytelling & route linking for every package.",
        bullets: [
          "At least 1 Gallery Image is mandatory when creating a new tour package (JSON upload does not attach image files).",
          "Upload crisp landscape photos (16:9 or 4:3 aspect ratio, preferably WebP/JPG under 2MB each).",
          "Use the Destination Sequence Picker to attach pre-created destinations in exact chronological order.",
        ],
      },
    ],
  },

  destinations: {
    id: "destinations",
    number: "07",
    title: "Destinations Management",
    subtitle: "Build reusable Sri Lanka destination profiles that power tour route maps and destination pages.",
    icon: "mapPin",
    actionHref: "/managedestinations",
    actionLabel: "Manage Destinations",
    blocks: [
      {
        title: "Adding a New Destination (/destinations)",
        route: "/destinations",
        icon: "mapPin",
        iconColorClass: "text-rose-600",
        summary: "Always create a destination here before trying to attach it to a Tour Package.",
        bullets: [
          "Supports fast pre-filling via DestinationJsonUploader.",
          "Organized into 4 clean sections: Basic Info, Quick Facts (best time, climate, elevation), Multilingual Content (EN/JA), and Media.",
          "Once saved, the destination immediately appears inside the Package Destination Sequence Picker.",
        ],
      },
      {
        title: "Managing & Editing Destinations (/managedestinations)",
        route: "/managedestinations",
        icon: "mapPin",
        iconColorClass: "text-indigo-600",
        summary: "Browse all published destinations and click Edit to open the dedicated edit page (/managedestinations/[id]/edit).",
        bullets: [
          "1-Click Live Visibility: Toggle any destination between 'Live on Site' and 'Hidden / Draft' instantly.",
          "Safe Metadata Editing: During edit mode (/managedestinations/[id]/edit), the file upload input is automatically hidden to protect existing Cloudflare R2 photos from accidental overwrites.",
          "Update localized titles, summaries, quick facts, or descriptions without breaking existing tour links.",
          "Delete outdated or duplicate destination entries safely using the standardized AdminDeleteModal.",
        ],
      },
    ],
  },

  content: {
    id: "content",
    number: "08",
    title: "Blog Articles & FAQs CMS",
    subtitle: "Step-by-step instructions to publish multilingual SEO travel blogs and manage customer support FAQs.",
    icon: "bookOpen",
    actionHref: "/manageblogs",
    actionLabel: "Manage Blogs",
    blocks: [
      {
        title: "How to Add & Manage Blog Articles (/blogs & /manageblogs)",
        route: "/blogs",
        icon: "bookOpen",
        iconColorClass: "text-cyan-600",
        summary: "Full multilingual blog creator supporting EN, JA, and custom ISO language codes (+).",
        steps: [
          "Open /blogs — optionally upload a JSON file via JsonImporter (download sample-blog.json from Section 12) to auto-fill all fields.",
          "In the EN tab, enter Title (auto-generates URL Slug), Author, Category, Read Time, Summary, and full Blog body.",
          "Switch to the JA tab (or click + to add a new language) and enter the Japanese translations.",
          "Attach cover/article photos using ImageUploader and click Save to publish live.",
          "To update later, open /manageblogs and click Edit (/manageblogs/[id]/edit). Note that during edit mode, image uploading is automatically hidden because edit endpoints safely update metadata only.",
          "Use the 1-click Live Visibility toggle in /manageblogs to stage articles in draft mode or publish them live.",
        ],
        bullets: [
          "Supports manual custom slug override if you want a shorter SEO URL.",
          "Filter catalog by All Visibility ('Live on Site' vs 'Hidden / Drafts').",
        ],
      },
      {
        title: "How to Add & Manage FAQs (/faqs & /managefaqs)",
        route: "/faqs",
        icon: "helpCircle",
        iconColorClass: "text-fuchsia-600",
        summary: "Create and maintain localized Questions & Answers to answer traveler doubts before they inquire.",
        steps: [
          "Open /faqs (Add FAQ) and start in the English (EN) tab.",
          "Fill in the 3 fields: Category (e.g. Booking & Payments, Airport Pickup), Question, and Answer.",
          "Click the JA tab at the top of the form (or click + to add another language like fr/de) and translate Category, Question, and Answer.",
          "Click Create FAQ — the form resets automatically and the new FAQ appears in the list below.",
          "To edit or delete an existing FAQ, go to /managefaqs → click Edit (/managefaqs/[id]/edit) or Delete.",
        ],
        bullets: [
          "Keep FAQs updated on ETA visas, Japanese-speaking guides, payment rules, and child seats.",
        ],
      },
    ],
  },

  availability: {
    id: "availability",
    number: "09",
    title: "Date Availability, Service Pricing & Service Guidelines",
    subtitle: "Step-by-step control over live booking calendar blackouts, standalone charter rate cards, and vehicle specifications.",
    icon: "calendarOff",
    actionHref: "/newupdates",
    actionLabel: "Open Date Controls",
    blocks: [
      {
        title: "How to Block / Open Booking Dates (/newupdates)",
        route: "/newupdates",
        icon: "calendarOff",
        iconColorClass: "text-amber-600",
        summary: "Interactive monthly calendar synced live with the customer website's CustomDatePicker.",
        steps: [
          "Select the target Month and Year on the Availability Calendar and click any date you want to configure.",
          "In the right-side DateConfigPanel, select which Tour Types should be closed on that date (e.g. One-Day, Multi-Day, or All).",
          "Enter a customer-facing Closure Note in EN, then switch to JA (or + custom language) to translate the reason (e.g. 'Fully Booked' / 'Kandy Perahera Holiday').",
          "Review your changes in the ClosedDatesList and click Save Changes so the website disables those dates immediately.",
        ],
        bullets: [
          "Uncheck tour types or remove a date from ClosedDatesList and save to reopen bookings.",
        ],
      },
      {
        title: "How to Update Service Pricing (/servicepricing)",
        route: "/servicepricing",
        icon: "dollar",
        iconColorClass: "text-teal-600",
        summary: "Manage localized rate cards across 3 tabbed service categories.",
        badges: ["Charter Rates", "Custom Tour", "Transfer Rates"],
        steps: [
          "Open /servicepricing and choose a tab: Charter Service Rates, Custom Tour Pricing, or Transfer Rates.",
          "Switch between EN, JA, or add a custom language (+) to edit localized titles, prices, and inclusions.",
          "Click Save Changes to push updated rate cards live to the public service pages.",
        ],
        bullets: [
          "Click Refresh anytime to reload the latest saved pricing from the backend.",
        ],
      },
      {
        title: "How to Set Service Guidelines & Vehicle Specs (/servicenotes)",
        route: "/servicenotes",
        icon: "clipboard",
        iconColorClass: "text-lime-700",
        summary: "Define vehicle specifications and multilingual traveler guidelines per service type.",
        steps: [
          "Select the Service Type (Custom Tour, Private Chauffeur, or Transfer).",
          "Fill in Vehicle Type, Starting Price, Passenger Capacity, Luggage Capacity, and rates for With Driver, With Guide, and With Driver & Guide.",
          "Use the EN / JA switcher at the top to add bullet-point service guidelines in both languages and click Save.",
        ],
        bullets: [
          "Clearly state luggage limits and overtime rules to prevent customer misunderstandings.",
        ],
      },
    ],
  },

  engagement: {
    id: "engagement",
    number: "10",
    title: "Users, Media Gallery, Reviews & Contact Inbox",
    subtitle: "Step-by-step guides to manage registered users, stage WebP media, reply to reviews, and process inquiries.",
    icon: "users",
    actionHref: "/users",
    actionLabel: "Open User Management",
    blocks: [
      {
        title: "How to Manage Registered Users (/users)",
        route: "/users",
        icon: "users",
        iconColorClass: "text-sky-600",
        summary: "View every customer profile, search by Branded Reference ID, and manage VIP, Access, and Verification statuses with real-time Zero-Trust enforcement.",
        badges: ["IKISAKI-XXXXXX Code", "Omni-Search", "Active / Suspended", "VIP Crown 👑", "2FA Security 🛡️", "Verified ✓"],
        steps: [
          "Search & Filter: Use the real-time Omni-Search bar to instantly locate customers by Branded Reference ID (e.g. IKISAKI-8F42M9), First Name, Last Name, or Email address.",
          "Branded Customer Reference ID: Every customer is assigned a clean alphanumeric code (e.g. IKISAKI-8F42M9). Click the amber Reference ID badge to copy it to clipboard in 1 click for customer support or referral validation.",
          "Real-Time Zero-Trust Suspension: Click the Access badge to toggle a customer between Active and Suspended. When suspended, the NestJS JwtAuthGuard and frontend AccessGate immediately lock them out across all devices and block bookings or reviews.",
          "Customer 2FA Indicator: Customers who enabled Google Authenticator / Authy on their profile display a teal '2FA' badge for security auditing.",
          "Toggle VIP Member: Click the VIP toggle button to grant or remove VIP status (adds a gold Crown badge on their avatar).",
          "Toggle Verified: Click the Verified button to add or remove the blue Verified Checkmark.",
          "Inspect Technical UUID: Click the Eye icon on the card or table row to reveal or hide the internal database User UUID for backend debugging.",
        ],
        bullets: [
          "All toggles save live immediately via PATCH /auth/users/:id/status with spinner confirmation and instant synchronization.",
          "Zero-Trust Backend Guard: Suspended accounts (hasAccess: false) attempting any mutation (package bookings, custom tour inquiries, chauffeur requests, reviews) are blocked with HTTP 403 ACCOUNT_SUSPENDED.",
        ],
      },
      {
        title: "How to Upload Media Gallery Assets (/imageupload)",
        route: "/imageupload",
        icon: "images",
        iconColorClass: "text-pink-600",
        summary: "Centralized WebP photo staging gallery with strict format & batch validation.",
        badges: [".webp ONLY", "Max 4 / Batch"],
        steps: [
          "Convert your tour photos to .webp format first (JPG and PNG files are rejected).",
          "Drag & drop or select up to 4 .webp images per batch into the WebP Image Uploader.",
          "Preview staged drafts, click X on any unwanted photo to remove it, and click Save to add them to the gallery.",
        ],
        bullets: [
          "Strict WebP enforcement keeps the customer website loading fast worldwide.",
        ],
      },
      {
        title: "How to Moderate Reviews & Post Admin Replies (/comments)",
        route: "/comments",
        icon: "comments",
        iconColorClass: "text-orange-600",
        summary: "Unified moderation feed combining Website Feedback and verified Package Reviews.",
        badges: ["All Types", "Website Feedback", "Package Review", "By Not Responded"],
        steps: [
          "Use the top Navbar to filter by category (All Types / Website Feedback / Package Review) or switch to 'By Not Responded' to find unanswered reviews.",
          "Toggle Public Visibility on any card to show or hide that comment/review on the live website.",
          "Type your official response in the Admin Reply box and submit to display your reply beneath the customer's review.",
        ],
        bullets: [
          "Fast, polite Admin Replies build strong social proof for Japanese and European travelers.",
        ],
      },
      {
        title: "How to Handle Contact Form Inquiries (/contact)",
        route: "/contact",
        icon: "mail",
        iconColorClass: "text-emerald-600",
        summary: "Inbox for all general messages submitted through the public Contact Us page.",
        steps: [
          "Open /contact to view all incoming messages sorted with sender email, subject, message body, and date.",
          "Reply to the customer via email/WhatsApp, then click Delete (with confirmation) to clear resolved or spam inquiries.",
        ],
        bullets: [
          "Header displays the live total count of open Contact Form Inquiries.",
        ],
      },
    ],
    warning:
      "Remember: On /imageupload, convert JPG/PNG photos to .webp first and upload at most 4 files at a time — otherwise the uploader will reject the batch.",
  },

  compliance: {
    id: "compliance",
    number: "11",
    title: "Staff & RBAC, Security, Legal Policies & Operations Log",
    subtitle: "Step-by-step instructions to manage the 10-role staff directory, enforce 2FA TOTP security, maintain multilingual legal policies, and record team logs.",
    icon: "shieldCheck",
    actionHref: "/staff",
    actionLabel: "Manage Staff & Roles",
    blocks: [
      {
        title: "Staff Directory & 10-Role Access Control (/staff)",
        route: "/staff",
        icon: "shieldCheck",
        iconColorClass: "text-emerald-600",
        summary: "Super Admin portal to provision internal team accounts across 10 specialized operational roles with live status toggles and security policies.",
        badges: ["Super Admin Only", "10 Specialized Roles", "Active / Suspended", "2FA Compliance"],
        steps: [
          "Open /staff — view Total Staff, Super Admins, Operations & Fleet, Content & Catalog, and 2FA Compliance KPI counters.",
          "Click '+ Add Staff Member' to open the StaffAddModal. Enter Full Name, Email, and temporary password (or click Generate Strong Password).",
          "Review the First Sign-In Security Policy banner and select one of the 10 specialized roles filtered by category pills (Executive, Operations, Content, Support & Compliance).",
          "To change a role anytime, click the StaffRoleDropdown on the staff row/card and pick the new role — saves live immediately.",
          "To suspend a compromised account, toggle the status switch to Suspended — all active sessions in admin_sessions are instantly invalidated.",
          "To reset a forgotten password, click the Key icon to open StaffResetPasswordModal and assign a new temporary key (prior sessions revoked).",
        ],
        bullets: [
          "The 10 Roles: SUPER_ADMIN (Root), OPERATIONS_MANAGER (Logistics/Dispatch), PACKAGE_MANAGER (Tour Builder), DESTINATION_EXPERT (Destinations), CONTENT_EDITOR (Blogs/FAQs), BOOKING_AGENT (Reservations), TRANSPORT_COORDINATOR (Chauffeurs/Rates), CUSTOMER_SUPPORT (Inquiries), REVIEW_MODERATOR (Reviews/Feedback), LEGAL_COMPLIANCE (Policies/Logs).",
          "Self-protection safeguards strictly prevent Super Admins from suspending or deleting their own account.",
        ],
      },
      {
        title: "Two-Factor Authentication (2FA / TOTP) Setup",
        route: "/dashboard",
        icon: "shieldCheck",
        iconColorClass: "text-teal-600",
        summary: "Enforce RFC 6238 TOTP two-factor security using Google Authenticator, Authy, or 1Password.",
        badges: ["Google Authenticator", "RFC 6238 Standard", "6-Digit Challenge"],
        steps: [
          "Click your avatar/profile pill at the bottom-left of the sidebar to open Admin Profile & Security modal.",
          "Navigate to the Two-Factor Authentication (2FA) section and click 'Activate 2FA Security'.",
          "Scan the displayed QR code with Google Authenticator or copy the Base32 setup key into your authenticator app.",
          "Enter the live 6-digit verification code from your phone and click 'Verify & Activate'.",
          "On your next login, the portal prompts for your 6-digit TOTP code after password verification before issuing access tokens.",
        ],
        bullets: [
          "Disabling 2FA requires confirming your current account password to prevent unauthorized tampering.",
          "Profile, Password, and 2FA feedback notifications dynamically adjust to message width (w-fit max-w-md mx-auto), horizontally centered with backdrop blur, dismiss buttons, and a 4.5-second auto-dismiss timer.",
          "Manual Setup Key container auto-adjusts width (w-fit max-w-full mx-auto) with responsive horizontal scrolling and 1-click clipboard copy.",
          "Form fields are ergonomically constrained (max-w-sm sm:max-w-[340px]) to prevent excessive horizontal stretching on large displays.",
          "Built on Node.js native crypto for 100% serverless Vercel compatibility without ESM bundling conflicts.",
        ],
      },
      {
        title: "Zero-Trust Route Guard & Access Restrictions (AdminShell)",
        route: "/dashboard",
        icon: "alertTriangle",
        iconColorClass: "text-amber-600",
        summary: "Pre-render route authorization prevents unauthorized access and eliminates Flash of Unauthorized Content (FOUC).",
        badges: ["Zero FOUC", "Pre-Render Guard", "Restricted Screen"],
        steps: [
          "When an admin logs in, their assigned role is evaluated against all target routes via isRoutePermitted.",
          "If a staff member types an unauthorized URL (e.g. /staff or /managedestinations), AdminShell intercepts the request before rendering.",
          "The system displays the unified AdminAccessRestricted screen showing their active role, the target module, authorized roles, and a 'Return to Permitted Dashboard' button.",
        ],
        bullets: [
          "Unauthorized components are never mounted into the DOM, completely preventing data-fetching leaks and broken console errors.",
          "Backend NestJS RolesGuard independently validates permissions on all REST endpoints with HTTP 403 Forbidden.",
        ],
      },
      {
        title: "Cloudflare R2 WebP Profile Photo Engine & Automatic Asset Cleanup",
        route: "/dashboard",
        icon: "images",
        iconColorClass: "text-indigo-600",
        summary: "Client-side WebP compression with automatic server-side deletion of old orphaned avatar images.",
        badges: [".webp Auto-Compression", "Cache-Busted", "Auto Storage Cleanup"],
        steps: [
          "In Admin Profile & Security modal, select any image (JPG/PNG/WebP) for your avatar.",
          "The client-side engine automatically compresses and converts the photo to high-efficiency .webp before upload.",
          "A unique timestamp query parameter is attached to the avatar URL to ensure immediate browser cache busting.",
          "When you save a new avatar, the backend automatically issues a DeleteObjectCommand to Cloudflare R2, removing the previous image so cloud storage never clutters.",
        ],
        bullets: [
          "When a staff member is deleted, their avatar file is also automatically purged from Cloudflare R2.",
        ],
      },
      {
        title: "How to Add & Edit Legal Policy Documents (/legaldocs)",
        route: "/legaldocs",
        icon: "scale",
        iconColorClass: "text-indigo-600",
        summary: "Structured multilingual CMS for Privacy Policy, Terms & Conditions, and Cancellation Policies.",
        badges: ["New Policy Modal", "Sections & Sub-Items", "EN / JA / +"],
        steps: [
          "Open /legaldocs and click 'New Document' in the left DocumentSidebar to open the New Policy Document modal.",
          "Enter Document Title (e.g. Cancellation Policy) — the unique Document ID auto-generates (e.g. cancellation-policy). Set Eyebrow label (e.g. Legal & Compliance), Accent Color, and Last Updated date, then submit.",
          "Select the document from the left sidebar and click '+ Add Section' to add structured clauses (Heading, Content, and optional nested Sub-Items with title + body).",
          "Switch the top language tab from EN to JA (or click + to add another language) and translate Title, Eyebrow, Sections, and Sub-Items.",
          "Click Save Changes to publish your updated policy live to the website footer pages.",
        ],
        bullets: [
          "Duplicate Document IDs are automatically blocked with a validation warning inside the modal.",
        ],
      },
      {
        title: "How to Record Daily Operations Logs (/adminlogs)",
        route: "/adminlogs",
        icon: "scrollText",
        iconColorClass: "text-slate-700",
        summary: "Internal team operations journal for driver/guide allocations, schedules, and issue tracking.",
        badges: ["👤 Allocation", "📅 Schedule", "⚠️ Issue / Alert", "📝 General Note"],
        steps: [
          "Open /adminlogs and choose a Log Type: Allocation, Schedule, Issue / Alert, or General Note.",
          "Optionally enter a Related Request ID (e.g. req_1) and Assigned Staff name (e.g. Saman - Driver).",
          "Write a clear operational update in the note field and click Submit to add a timestamped entry to the team timeline.",
        ],
        bullets: [
          "Ideal for tracking last-minute driver swaps, vehicle maintenance alerts, and VIP airport pickups.",
        ],
      },
    ],
  },
};

/* ── 6. PRICING GUIDE DATA (VEHICLE TIERS, PASSENGER RULES, ADD-ONS) ── */
export const VEHICLE_TIER_GUIDE: VehicleTierGuideRow[] = [
  { tier: "Solo (1 Person)", min: 1, max: 1, vehicle: "Sedan Car (Prius / Axio)", note: "1 traveler covers 100% of private vehicle & chauffeur cost" },
  { tier: "Couple (2 Persons)", min: 2, max: 2, vehicle: "Sedan Car (1 Double/Twin Room)", note: "Vehicle & guide costs split by 2 (~35–40% lower per person)" },
  { tier: "Small Group (3–4 Persons)", min: 3, max: 4, vehicle: "Flat-Roof Van / Mini-Van (KDH / Noah)", note: "Ideal for families or small groups with full luggage space" },
  { tier: "Medium Group (5–7 Persons)", min: 5, max: 7, vehicle: "High-Roof Van (Toyota KDH High Roof)", note: "Spacious 9-seater layout with dedicated suitcase bay" },
  { tier: "Large Group (8–15 Persons)", min: 8, max: 15, vehicle: "Mini Coach (Mitsubishi Rosa / Coaster)", note: "Covers 8 through 15 pax; next custom tier starts at 16" },
  { tier: "Coach Group (16–30+)", min: 16, max: 30, vehicle: "Full-Size Luxury Coach (33–45 Seater)", note: "Optional custom tier for corporate & large group tours" },
];

export const PASSENGER_RULES_GUIDE: PassengerRuleGuide[] = [
  {
    title: "Couple (2 Adults)",
    badge: "2 Pax · 1 Shared Room",
    description:
      "Each couple counts as 2 paying travelers toward Group Tiers. Use 'Auto (2 × Active Tier)' so couples inside larger groups receive the group discount, or choose 'Fixed' for a flat pair rate.",
  },
  {
    title: "Child (Age 2–12)",
    badge: "% of Adult or Fixed $",
    description:
      "Standard setting is 50% of the active adult tier rate (or set a Fixed Fee in USD). Children count toward total paying travelers when matching Group Discount Tiers.",
  },
  {
    title: "Infant (Under 2)",
    badge: "Usually Free ($0)",
    description:
      "Set to $0 for free lap travel (infants do not inflate paying group tiers). Enter a dollar amount only if a baby car-seat rental fee is required.",
  },
];

export const ADDON_TYPES_GUIDE: AddOnTypeGuide[] = [
  {
    code: "per_person",
    title: "Per Person (× Guests)",
    examples: "1st Class Blue Train Ticket, Ayurveda Spa, Yala VIP Jeep",
    behavior: "Guest selects quantity (up to total travelers). Price = Unit Price × Selected Guests.",
    styleClass: "border-emerald-200 bg-emerald-50/50",
    badgeClass: "bg-emerald-600 text-white",
  },
  {
    code: "per_room",
    title: "Per Room (× Rooms)",
    examples: "Single Room Accommodation Supplement, Extra Bed",
    behavior: "Guest selects number of rooms needed. Price = Unit Price × Rooms.",
    styleClass: "border-indigo-200 bg-indigo-50/50",
    badgeClass: "bg-indigo-600 text-white",
  },
  {
    code: "per_booking",
    title: "Per Booking (One-Time Flat)",
    examples: "VIP Luxury Van Upgrade (Alphard/Mercedes), Private Photographer & Drone",
    behavior: "Single checkbox (no +/- stepper). Charged once for the entire booking regardless of group size.",
    styleClass: "border-amber-200 bg-amber-50/50",
    badgeClass: "bg-amber-600 text-white",
  },
];

/* ── 7. INTERACTIVE PRE-PUBLISH CHECKLIST ── */
export const PRE_PUBLISH_CHECKLIST_ITEMS: string[] = [
  "Both English (EN) and Japanese (JA) tabs are completely translated with zero empty required fields.",
  "Highlighted Words (Title 2) matches exact characters inside Package Title (Title 1) in BOTH EN and JA (same Kanji/Katakana script).",
  "URL Slug is auto-generated cleanly from Package Title (EN) and is unique across all existing packages.",
  "Group Discount Tiers have ZERO gaps and ZERO overlaps (each Min Pax = previous Max Pax + 1).",
  "Tested Adults, Couples, Children, Infants & Add-Ons inside the built-in Live Pricing Preview Simulator.",
  "Every itinerary day uses dynamic Meals (+ Add Meal) and Accommodation (+ Add Accommodation) entries.",
  "Destinations are attached in chronological route order via the Destination Sequence Picker.",
  "At least 1 high-resolution landscape Gallery Image has been selected for upload.",
];

/* ── 8. TROUBLESHOOTING ACCORDION DATA (ALL REAL PROJECT GOTCHAS) ── */
export const TROUBLESHOOTING_GUIDE_ITEMS: TroubleshootingItemData[] = [
  {
    question: "500 Server Error / Duplicate Key ('packages_slug_unique') when saving a tour",
    module: "Tour Packages",
    cause: "Another tour in the PostgreSQL database already uses the exact same URL slug (slugs must be globally unique).",
    solution:
      "Slightly modify the English Package Title (Title 1) so the auto-generated URL Slug becomes unique, or open Manage Packages (/managepackages) to edit the existing tour instead.",
  },
  {
    question: "Japanese tour title shows all white — Gold Highlight is missing on the website",
    module: "Tour Packages",
    cause: "Script mismatch between Kanji and Katakana (e.g., Title 1 has 究極 while Highlighted Words has アルティメット).",
    solution:
      "Copy the EXACT Japanese phrase directly out of Package Title (JA) and paste it into Highlighted Words in Title (JA). Example: Title = 究極のスリランカ・グランドエクスプローラー → Highlight = 究極のスリランカ.",
  },
  {
    question: "Save Package does nothing or blocks submission when I am on the JA (Japanese) tab",
    module: "Tour Packages",
    cause: "Core English (EN) fields (Title, Category, Origin, Duration, Lead Title, Description) are strictly required before publishing.",
    solution:
      "Switch back to the EN tab, verify no required English fields are blank, attach at least 1 Gallery Image, and click Save Package again.",
  },
  {
    question: "Why can't I upload new gallery images while editing a tour in /managepackages?",
    module: "Tour Packages",
    cause: "Manage Packages uses a safe text-only PATCH endpoint to update text, badges, pricing, and itineraries without risking accidental deletion of existing gallery photos.",
    solution:
      "Use /managepackages for all text, pricing tier, add-on, and itinerary updates. To upload fresh photography for a brand-new listing, use /addpackage.",
  },
  {
    question: "Unexpected price jump to Solo rate for a specific group size (e.g., 4 or 6 guests)",
    module: "Dynamic Pricing",
    cause: "A gap exists between Max Pax of one tier and Min Pax of the next tier (e.g., 1–2 followed by 5–7, skipping 3–4). Any pax count in a gap falls back to the lowest (Solo) tier.",
    solution:
      "Edit the tiers in /managepackages so every consecutive tier connects seamlessly: next row's Min Pax must always equal previous row's Max Pax + 1.",
  },
  {
    question: "JSON Uploader shows 'Invalid JSON file format' when uploading AI-generated JSON",
    module: "Media & JSON",
    cause: "The file contains Markdown code fences (```json ... ```), extra conversational text from ChatGPT/Gemini, a trailing comma, or was saved as .txt instead of .json.",
    solution:
      "Make sure the file starts directly with { and ends with }, contains valid raw JSON only (no backticks or comments), and is saved with a .json extension.",
  },
  {
    question: "Form stops with 'Please select at least one gallery image to upload' after JSON import",
    module: "Media & JSON",
    cause: "JSON templates only populate multilingual text, pricing, and itinerary fields — binary photo files cannot be stored inside JSON.",
    solution:
      "Scroll down to the Gallery Images section on /addpackage and manually select at least 1 high-resolution landscape photo before clicking Save Package.",
  },
  {
    question: "Media Gallery (/imageupload) rejects my photos or says maximum 4 images allowed",
    module: "Media & JSON",
    cause: "/imageupload enforces strict .webp format validation (rejects .jpg/.png) and a maximum batch size of 4 images per upload.",
    solution:
      "Convert your photos to .webp format first and upload them in batches of up to 4 files at a time.",
  },
  {
    question: "Wrong image appears as the main Hero Banner on a Destination page (/destinations)",
    module: "Media & JSON",
    cause: "DestinationMedia automatically assigns Index 0 (the very first selected photo, marked ★ Hero) as the main hero image and supports up to 6 images max.",
    solution:
      "Remove the staged files and select your best landscape Hero photo FIRST (Index 0), then add up to 5 supporting gallery photos.",
  },
  {
    question: "Blocked dates on /newupdates are still selectable on the customer website",
    module: "Availability & Legal",
    cause: "Clicking dates on the calendar stages local unsaved changes only — the backend is not updated until you click Save Changes.",
    solution:
      "Check the ClosedDatesList summary and click the top 'Save Changes' button. Wait for the green Saved confirmation before leaving /newupdates.",
  },
  {
    question: "Legal Policy modal says 'This ID is already in use' or edits disappear on refresh",
    module: "Availability & Legal",
    cause: "Every policy document requires a unique Document ID (e.g. privacy-policy, refund-policy), and edits made in LegalDocEditor must be explicitly saved.",
    solution:
      "Use a unique Title/ID when creating a New Policy Document, preview your changes in the 'Live Preview' tab, and always click Save before switching pages.",
  },
  {
    question: "API error (401/403 Unauthorized), slow initial load, or 'Desktop Screen Required'",
    module: "System & Auth",
    cause: "Protected admin endpoints require a valid NEXT_PUBLIC_ADMIN_API_KEY & active backend URL; serverless APIs may take 3–5s on cold start; viewports below 768px trigger DesktopOnlyGuard.",
    solution:
      "Wait 5 seconds and refresh if the backend is waking up; verify .env.local keys with your developer if 401/403 persists; always use a desktop/laptop browser (≥ 1024px).",
  },
  {
    question: "Why is image file upload hidden when editing a Destination or Blog article?",
    module: "Media & Editing",
    cause: "The backend edit endpoints (PATCH /destinations/:id and PATCH /blogs/:id) accept JSON metadata updates only. Existing Cloudflare R2 photos are preserved safely in the database.",
    solution:
      "Image uploading is automatically hidden during edit mode via hideImageUpload={true} to avoid confusion. To add a new photo set, create a new entry on /destinations or /blogs.",
  },
  {
    question: "How does the 1-Click Live Visibility toggle work across Packages, Blogs, Destinations & FAQs?",
    module: "Catalog Management",
    cause: "Admins need instant control to hide seasonal packages, draft articles, or unready items without deleting their data.",
    solution:
      "Click the 'Live' / 'Hidden' pill button in any catalog table or card. When set to 'Hidden', the public website strictly filters the item out (WHERE isLive = true), while it remains fully editable in the Admin Panel.",
  },
  {
    question: "Why does typing the Admin URL directly redirect me to /login?",
    module: "Security & Access",
    cause: "The Admin Panel enforces Zero Trust Edge Route Guard (src/proxy.ts). Any unauthenticated direct URL visit is blocked immediately.",
    solution:
      "Enter your authorized staff credentials at /login to establish a secure 256-bit encrypted session. After authenticating, the system automatically redirects you back to your requested page.",
  },
  {
    question: "How do I create the initial Super Admin account or resolve Supabase RLS warnings?",
    module: "Security & Provisioning",
    cause: "Before accessing /login, the primary admin user must be seeded in the backend database, and Supabase database tables must have Row Level Security enabled.",
    solution:
      "In the backend repository, run 'npm run seed:admin' (reads INITIAL_ADMIN_EMAIL & INITIAL_ADMIN_PASSWORD from .env; default admin@ikisakitours.com). In the Supabase SQL editor warning modal, always click 'Run and enable RLS' to block anon key attacks while allowing direct NestJS database connections.",
  },
  {
    question: "Access Restricted screen appears when navigating to a module (/managedestinations, /staff, etc.)",
    module: "Security & RBAC",
    cause: "Your assigned operational role does not have administrative authorization to view or edit that module (e.g. Destination Specialist cannot access Staff or Fleet).",
    solution:
      "Click 'Return to Permitted Dashboard' to return to your authorized workspace. If your daily duties require access to this section, request your Super Administrator to upgrade your role via the Staff Directory (/staff).",
  },
  {
    question: "Google Authenticator 2FA code is rejected or login is blocked",
    module: "Security & 2FA",
    cause: "Device clock drift (TOTP codes rely on strict 30-second synchronization) or entering an expired code.",
    solution:
      "In Google Authenticator settings, tap 'Time correction for codes' → 'Sync now' to align your mobile device clock with standard internet time. Enter the fresh 6-digit code before the circular countdown expires.",
  },
  {
    question: "Staff member account suspended or 'Your staff account has been suspended' error on login",
    module: "Security & RBAC",
    cause: "A Super Admin toggled the account status to Suspended, which immediately invalidates all active sessions in the database.",
    solution:
      "A Super Administrator must navigate to /staff and toggle the status switch back to Active. If credentials were lost, the Super Admin can also click the Key icon to assign a secure temporary password.",
  },
  {
    question: "How are old avatar photos cleaned up when updating profile pictures?",
    module: "Media & Storage",
    cause: "Frequent profile photo replacements could leave orphaned files in Cloudflare R2 bucket storage if not automatically pruned.",
    solution:
      "The Ikisaki profile engine handles this automatically: images are compressed client-side into .webp, and when saving a new avatar, the backend automatically issues a DeleteObjectCommand to Cloudflare R2, removing the previous image so storage never accumulates clutter.",
  },
  {
    question: "Customer reports their account is suspended or sees the Access Restricted screen",
    module: "Customer Management & Security",
    cause: "An administrator switched the customer's account status to Suspended on /users (hasAccess: false), triggering real-time 403 ACCOUNT_SUSPENDED enforcement in the backend JwtAuthGuard and frontend AccessGate.",
    solution:
      "Open the /users page, locate the customer using Omni-Search (by name, email, or IKISAKI-XXXXXX code), and click the Access badge to toggle their status back to Active (Green). The change takes effect immediately without requiring re-registration or token refresh.",
  },
  {
    question: "How does the Branded Customer Reference ID (IKISAKI-XXXXXX) work and where can I search it?",
    module: "Customer Management & Support",
    cause: "To avoid exposing raw database UUIDs and streamline customer support, email inquiries, and future referral tracking, every registered customer is assigned a clean 6-character alphanumeric code.",
    solution:
      "Admins can paste or type the reference code (e.g. IKISAKI-8F42M9) directly into the /users Omni-Search bar to instantly locate the customer. Clicking the amber badge copies the ID to the clipboard in 1 click. If a suspended customer contacts support from the Access Restricted screen, their code is automatically pre-filled in the email subject.",
  },
  {
    question: "How do the new dynamic toast notifications and sidebar auto-centering work?",
    module: "UI/UX Resilience",
    cause: "Toast messages previously forced artificial fixed widths or line wraps, and bottom sidebar items were restricted by the scroll boundary.",
    solution:
      "AdminToast now dynamically adapts its width to the exact content size (w-auto max-w-[min(52rem,calc(100vw-3rem))]) and guarantees standard sentences under 95 characters remain on a single line (whitespace-nowrap) with compact height (py-2) and crisp text (text-[11px] sm:text-xs). The sidebar utilizes bounded nearest-edge scrolling (~16px margin) with streamlined pb-6 bottom padding, keeping items like Admin Manual Guide resting naturally right at the visible guideline above the user card without excessive over-scrolling.",
  },
  {
    question: "What happens when an admin session times out after 3 hours of inactivity?",
    module: "Security & Session Management",
    cause: "Administrative JWT tokens are issued with a 3-hour expiration timestamp so staff can work comfortably throughout their shift without unexpected disruptions.",
    solution:
      "When an admin session times out, global API interceptors catch the HTTP 401 response and open the executive Session Expired modal. Background page scrolling is locked to maintain your screen position. Clicking 'Sign In Again' preserves your active workspace URL (/login?expired=true&redirect=<target>). Once you re-enter your credentials and 6-digit 2FA Authenticator code, you are instantly returned directly to your in-progress workspace.",
  },
  {
    question: "How does Customer Two-Factor Authentication (2FA) work and where is it monitored in the Admin Panel?",
    module: "Customer Security & 2FA",
    cause: "Registered travelers can activate RFC 6238 TOTP two-factor security using Google Authenticator or Authy to protect their bookings and profile data.",
    solution:
      "Customers activate 2FA via their Profile Security settings by scanning an otpauth:// QR code. Once enabled, their login requires both password and a live 6-digit TOTP code. Administrators can monitor 2FA adoption directly in the /users module, where active customer accounts display a real-time teal '2FA' shield badge across both table and card views.",
  },
  {
    question: "How does the Cloudflare R2 automatic asset cleanup engine work for customer and admin profile avatars?",
    module: "Media & Cloud Storage",
    cause: "Frequent profile avatar replacements could leave thousands of orphaned image files accumulating in Cloudflare R2 bucket storage over time.",
    solution:
      "The automatic cleanup engine resolves targetToDelete whenever an admin or customer updates or removes their avatar. The backend immediately purges the old image from Cloudflare R2 via an asynchronous DeleteObjectCommand without blocking the user response. External social OAuth avatars (Google lh3.googleusercontent.com and Facebook graph.facebook.com) are automatically recognized and protected from deletion.",
  },
  {
    question: "How do the centered toasts, Manual Setup Key, and input fields work in Admin Profile & Security modal?",
    module: "Admin Profile & Security",
    cause: "Feedback toasts previously stretched full width across the modal and remained on screen indefinitely, while form fields were overly wide on large monitors.",
    solution:
      "Feedback toasts (profile, password, 2FA) now dynamically calculate their width according to message length (w-fit max-w-md mx-auto), are horizontally centered with backdrop blur, dismiss buttons, and auto-dismiss smoothly after 4.5 seconds. The Manual Setup Key container auto-adjusts width (w-fit max-w-full mx-auto) with responsive scrolling and 1-click clipboard copy. Form inputs are ergonomically constrained (max-w-sm sm:max-w-[340px]), and disabling 2FA requires confirming your current account password.",
  },
  {
    question: "How does the sidebar brand logo shortcut and bounded auto-scroll work?",
    module: "Navigation & UX",
    cause: "Admins navigating deep inside sub-pages needed a quick 1-click way to return to the Dashboard, and bottom navigation items previously had an excessive 256px blank void.",
    solution:
      "Clicking the 'IT' badge or 'IKISAKI TOURS Admin Panel' header in the sidebar instantly routes to /dashboard in both collapsed and expanded states. The active item auto-scroller uses bounded nearest-edge scrolling (~16px margin) with streamlined pb-6 bottom padding, keeping items like Admin Manual Guide resting naturally right at the visible guideline above the profile card.",
  },
  {
    question: "Why does the login page show 'Session expired. Please sign in again.' and 'Session: 3-Hour Expiry'?",
    module: "Authentication & Login",
    cause: "The backend administrative JWT access token lifetime was extended from 15 minutes to 3 hours to allow uninterrupted daily operations.",
    solution:
      "The login footer reflects the 3-hour session window ('Session: 3-Hour Expiry'). If an admin session expires or times out, the login page displays a concise, single-line warning ('Session expired. Please sign in again.') preventing awkward line truncation, word breaks, or ellipses on smaller screens.",
  },
  {
    question: "How do Transfer Service Notes and Vehicle guidelines work on /servicenotes?",
    module: "Transfer & Fleet Guidelines",
    cause: "Custom airport and intercity transfers require up-to-date vehicle capacity, luggage rules, baby seat requirements, and Colombo airport (BIA) meeting instructions.",
    solution:
      "Open /servicenotes to configure English and Japanese vehicle guidelines (Sedan, Mini Van, Van, Mini Coach) including max passenger counts, large/small suitcase limits, and baby seat availability. Changes save directly to the database and sync reactively with the customer website's transfer booking calculator.",
  },
];
