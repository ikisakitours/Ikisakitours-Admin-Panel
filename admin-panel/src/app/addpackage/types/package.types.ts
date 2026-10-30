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
}