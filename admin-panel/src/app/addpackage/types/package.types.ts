export type PackageType = "oneday" | "multiday";

export type PackageBadge = "new_arrival" | "discounted" | "popular" | "featured";

export interface ActivityDetail {
  title: Record<string, string>;
  description: Record<string, string>;
}

export interface ItineraryItem {
  day: number;
  travelTime?: Record<string, string>;

  // Multilingual JSONB Text & Array Fields
  title: Record<string, string>;
  locations?: Record<string, string[]>;
  route?: Record<string, string[]>;
  details?: Record<string, string[]>;
  scenicStops?: Record<string, string[]>;
  activities?: Record<string, string[]>;
  meals?: Record<string, string>;
  accommodation?: Record<string, string>;
}

export interface DestinationSnapshot {
  id: string;
  slug: string;
  title?: Record<string, string>;
  summary?: Record<string, string>;
}

export interface PackageFormData {
  type: PackageType;
  category: Record<string, string>;
  origin: Record<string, string>;
  duration: Record<string, string>;
  badge?: PackageBadge;
  slug: string;

  // Shared fields
  price: string;
  discount: string;
  provider: string;
  activityDetails: ActivityDetail[];
  itinerary: ItineraryItem[];
  destinations: DestinationSnapshot[];

  // ── Multilingual JSONB Text Fields (Records) ──
  title: Record<string, string>;
  titleEmphasis: Record<string, string>;
  leadTitle: Record<string, string>;
  leadDescription: Record<string, string>;
  description: Record<string, string>;

  // ── Multilingual JSONB Array Fields (Records of string arrays) ──
  highlights: Record<string, string[]>;
  includes: Record<string, string[]>;
  excludes: Record<string, string[]>;
}