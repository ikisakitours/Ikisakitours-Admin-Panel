export type TourServiceCategory = "custom" | "chauffeur" | "transfer";
export type TourServiceStatus = "pending" | "approved" | "active" | "rejected" | "completed";

export interface TourServiceTravelers {
  adults?: number;
  couples?: number;
  children?: number;
  infants?: number;
}

export interface TourServiceRequest {
  id: string;
  referenceId?: string;
  category: TourServiceCategory;
  status: TourServiceStatus | string;
  fullName: string;
  email: string;
  phoneNumber: string;
  vehicleType: string;
  transferServiceType?: string;
  tourPackageType?: string;
  pickupLocation: string;
  dropOffLocation?: string;
  journeyDate: string;
  pickupTime: string;
  tourDuration?: string;
  language: string;
  travelers?: TourServiceTravelers;
  startingPrice?: number | string | null;
  selectedPrice?: number | string | null;
  price?: number | string | null;
  description?: string;
  specialRequests?: string;
  flightNumber?: string;
  createdAt: string;
  updatedAt?: string;
}
