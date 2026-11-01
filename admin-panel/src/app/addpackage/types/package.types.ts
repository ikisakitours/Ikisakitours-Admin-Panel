export type PackageType = "oneday" | "multiday";

export type PackageBadge = "new_arrival" | "discounted" | "popular" | "featured";

export interface ActivityDetail {
  title: string;
  description: string;
}

export interface ItineraryItem {
  day: number;
  title: string;
  travelTime: string;
  locations: string[];
  route: string[];
  details: string[];
  scenicStops?: string[];
  activities?: string[];
  meals: string[];
  accommodation: string[];
}

export interface DestinationSnapshot {
  id: string;
  slug: string;
}

export interface PackageFormData {
  type: PackageType;
  category: string;
  origin: string;
  duration: string;
  badge?: PackageBadge;
  slug: string;

  // ── legacy (kept — existing form fields, existing reads) ──
  titleEmphasis: string;
  title: string;
  price: string;
  discount: string;
  provider: string;
  leadTitle: string;
  leadDescription: string;
  activityDetails: ActivityDetail[];
  highlights: string[];
  description: string;
  itinerary: ItineraryItem[];
  destinations: DestinationSnapshot[];
  includes: string[];
  excludes: string[];

  // ═══════════════════════════════════════════════════════════
  // ADDED: localized scalar/array fields.
  // All optional — old `PackageFormData` objects (e.g. from
  // getPackageBySlug before the backend widens its response)
  // still satisfy this type, so nothing breaks during rollout.
  //
  // Conventions:
  //  - `En` = English variant (falls back to legacy field on write)
  //  - `Ja` = Japanese variant (absent → read-time falls back to En)
  // ═══════════════════════════════════════════════════════════
  titleEn?: string;
  titleJa?: string;

  titleEmphasisEn?: string;
  titleEmphasisJa?: string;

  leadTitleEn?: string;
  leadTitleJa?: string;

  leadDescriptionEn?: string;
  leadDescriptionJa?: string;

  descriptionEn?: string;
  descriptionJa?: string;

  highlightsEn?: string[];
  highlightsJa?: string[];

  includesEn?: string[];
  includesJa?: string[];

  excludesEn?: string[];
  excludesJa?: string[];
}