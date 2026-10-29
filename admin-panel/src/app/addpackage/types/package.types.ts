export interface ActivityDetail {
  title: string;
  description: string;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  images?: string[];
}

export interface DestinationSnapshot {
  id: string;
  title: string;
  slug: string;
  summary: string;
  heroImage: string | null;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PackageFormData {
  type: "oneday" | "multiday";
  category: string;
  origin: string;
  duration: string;
  badge?: "new_arrival" | "discounted" | "popular" | "featured";
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