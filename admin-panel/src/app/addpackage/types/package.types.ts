export type PackageType = "oneday" | "multiday";

export type PackageBadge = "new_arrival" | "discounted" | "popular" | "featured";

export interface ActivityDetail {
  titleEn: string;
  descriptionEn: string;
  
  // Localized additions
  titleJa?: string;
  descriptionJa?: string;
}

export interface ItineraryItem {
  day: number;
  travelTime: string;

  // English Fields
  titleEn: string;
  locationsEn: string[];
  routeEn: string[];
  detailsEn: string[];
  scenicStopsEn?: string[];
  activitiesEn?: string[];
  mealsEn: string[];
  accommodationEn: string[];

  // Japanese Fields
  titleJa?: string;
  locationsJa?: string[];
  routeJa?: string[];
  detailsJa?: string[];
  scenicStopsJa?: string[];
  activitiesJa?: string[];
  mealsJa?: string[];
  accommodationJa?: string[];
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

  // Shared fields
  price: string;
  discount: string;
  provider: string;
  activityDetails: ActivityDetail[];
  itinerary: ItineraryItem[];
  destinations: DestinationSnapshot[];

  // ── Localized English Fields (Required) ──
  titleEn: string;
  titleEmphasisEn: string;
  leadTitleEn: string;
  leadDescriptionEn: string;
  descriptionEn: string;
  highlightsEn: string[];
  includesEn: string[];
  excludesEn: string[];

  // ── Localized Japanese Fields (Optional) ──
  titleJa?: string;
  titleEmphasisJa?: string;
  leadTitleJa?: string;
  leadDescriptionJa?: string;
  descriptionJa?: string;
  highlightsJa?: string[];
  includesJa?: string[];
  excludesJa?: string[];
}