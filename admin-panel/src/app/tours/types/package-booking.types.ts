export interface BookingTravelers {
  adults: number;
  couples: number; // Number of couples (1 couple = 2 travelers)
  children: number;
  infants: number;
}

export interface BookingSelectedOption {
  id: string;
  name: string | Record<string, string>;
  nameLocalized?: Record<string, string>;
  unitPrice?: number | string;
  price?: number | string;
  calculationType?: "per_person" | "per_room" | "per_booking" | string;
  quantity?: number;
  count?: number;
  subtotal?: number | string;
  total?: number | string;
  selected?: boolean;
  enabled?: boolean;
}

export interface BookingCategoryBreakdownItem {
  count: number;
  unitPrice: number;
  total: number;
  discountNote?: string;
}

export interface BookingPricingSummary {
  baseCurrency?: string;
  displayCurrency?: string;
  appliedTier?: {
    label?: string;
    minPax?: number;
    maxPax?: number;
    pricePerPerson?: number;
  } | null;
  unitPrice?: number;
  baseTotal?: number;
  optionsTotal?: number;
  grandTotal?: number;
  breakdown?: {
    adults?: BookingCategoryBreakdownItem;
    couples?: BookingCategoryBreakdownItem;
    children?: BookingCategoryBreakdownItem;
    infants?: BookingCategoryBreakdownItem;
  };
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export interface PackageBooking {
  id: string;
  bookingReference?: string; // e.g. "IK-2611-9F3A"
  packageId: string;
  packageSlug?: string;
  packageName: string;
  packageType?: string;
  type: "oneday" | "multiday" | string;
  journeyDate: string;
  travelers: BookingTravelers;
  totalPax?: number;
  selectedOptions?: BookingSelectedOption[];
  basePrice?: string | number;
  optionsTotal?: string | number;
  totalAmount?: string | number;
  currency?: string;
  locale?: string;
  pricingSummary?: BookingPricingSummary | null;

  // Security & Audit Flags
  verifiedAmount?: string | number | null;
  isPriceTampered?: boolean;

  // Customer Details
  userId?: string | null;
  firstname: string;
  lastname: string;
  email: string;
  country: string;

  // Lifecycle & Payments
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string | null;
  paymentTransactionId?: string | null;

  createdAt: string;
  updatedAt?: string;
}

export interface UpdateBookingStatusPayload {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  paymentTransactionId?: string;
}

// Backward-compatible alias
export type Travelers = BookingTravelers;
