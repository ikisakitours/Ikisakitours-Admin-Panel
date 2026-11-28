export type PackageType = "oneday" | "multiday";

export type PackageBadge =
  | "none"
  | "best_seller"
  | "top_rated"
  | "popular"
  | "featured"
  | "new_arrival"
  | "exclusive"
  | "limited_availability"
  | "likely_to_sell_out"
  | "instant_confirmation"
  | "bucket_list"
  | "all_inclusive"
  | "family_friendly"
  | "honeymoon_special"
  | "unesco_heritage"
  | "private_tour"
  | "seasonal"
  | "eco_friendly"
  | "discounted"; // kept for legacy DB record compatibility

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
  meals?: Record<string, string | string[]>;
  accommodation?: Record<string, string | string[]>;
}

export interface DestinationSnapshot {
  id: string;
  slug: string;
  title?: Record<string, string>;
  summary?: Record<string, string>;
}

// ── Industry-Standard Group Pricing & Options Types ──
export interface GroupPricingTier {
  minPax: number;
  maxPax: number;
  pricePerPerson: number;
  label?: string; // e.g. "1 Person (Solo)", "2 Persons (Couple)", "3-4 Persons"
}

export interface PassengerCategoryPricing {
  couplePricingType?: "auto_tier" | "fixed";
  coupleFixedPrice?: number;
  childRateType: "percentage" | "fixed";
  childRateValue: number; // e.g. 50 for 50% or 25 for $25
  infantPrice: number; // e.g. 0
}

export interface PackageOptionItem {
  id: string;
  name: Record<string, string>; // Multilingual option name (e.g. Single room supplement)
  price: number;
  calculationType: "per_person" | "per_room" | "per_booking";
  description?: Record<string, string>;
}

export interface ImportantPricingNote {
  id?: string;
  title: Record<string, string>;
  description: Record<string, string>;
}

// ── Unified Dynamic Group Pricing & Custom Add-ons Configuration (Single JSONB Object) ──
export interface PricingConfig {
  tiers: GroupPricingTier[];
  passengerPricing: PassengerCategoryPricing;
  options: PackageOptionItem[];
  pricingNotes?: ImportantPricingNote[];
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
  gallery?: string[];
  activityDetails: ActivityDetail[];
  itinerary: ItineraryItem[];
  destinations: DestinationSnapshot[];

  // ── Unified Dynamic Pricing Configuration (Stored as single JSONB column) ──
  pricingConfig?: PricingConfig;
  pricingNotes?: ImportantPricingNote[];
  // Backward compatibility aliases
  pricingTiers?: GroupPricingTier[];
  passengerPricing?: PassengerCategoryPricing;
  options?: PackageOptionItem[];

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