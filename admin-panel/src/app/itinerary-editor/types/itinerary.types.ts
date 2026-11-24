export type ItineraryLanguage = "en" | "ja";

export interface ItineraryFlight {
  id: string;
  type: "arrival" | "departure";
  flightNo: string;
  route: string;
  date: string;
  time: string;
}

export interface ItineraryGuest {
  id: string;
  name: string;
  roomType: string; // e.g. "1TWN", "1DBL", "1SGL", "FAMILY"
}

export interface ItineraryDayMeals {
  breakfast: string; // e.g. "HOTEL", "NONE", "BOX MEAL"
  lunch: string;     // e.g. "CLIENT", "NONE", "RESTAURANT"
  dinner: string;    // e.g. "HOTEL", "NONE", "RESTAURANT"
}

export interface ItineraryCustomSection {
  id: string;
  title: string;
  description: string;
  titleJa?: string;
  descriptionJa?: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  dateStr: string; // e.g. "12TH MAR (THU)" or "3月12日 (木)"
  title: string;   // e.g. "Arrival & Transfer to Colombo"
  activities?: string[]; // e.g. Guided activities, experiences
  scenicStops?: string[]; // e.g. Viewpoints, landscape stops, photo spots
  bullets: string[]; // Tour Highlights & day details
  customSections?: ItineraryCustomSection[]; // Custom user-added sections (Title + Description)
  hiddenSections?: string[]; // Section keys hidden/deleted by admin: "activities" | "scenicStops" | "bullets"
  hotelCheckIn?: string; // e.g. "Hotel Check-In Name"
  meals: ItineraryDayMeals;
  rawJa?: {
    dateStr?: string;
    title?: string;
    activities?: string[];
    scenicStops?: string[];
    bullets?: string[];
    customSections?: ItineraryCustomSection[];
    hiddenSections?: string[];
    hotelCheckIn?: string;
  };
  rawEn?: {
    dateStr?: string;
    title?: string;
    activities?: string[];
    scenicStops?: string[];
    bullets?: string[];
    customSections?: ItineraryCustomSection[];
    hiddenSections?: string[];
    hotelCheckIn?: string;
  };
}

export interface ItineraryCompanyInfo {
  nameEn: string;
  nameJa: string;
  registrationNo: string;
  sltdaNo: string;
  address: string;
  addressJa?: string;
  tel: string;
  email: string;
  website: string;
  logoUrl: string;
}

export interface ItineraryDocument {
  id: string;
  title: string; // Internal title / draft name
  referenceNo: string; // e.g. "NW-LKA8011" or "IK-1314AW4F"
  bookingId?: string;
  packageSlug?: string;
  language: ItineraryLanguage; // "en" | "ja"
  tourName: string; // e.g. "The Ultimate Sri Lanka Grand Explorer"
  tourNameJa?: string;
  tourDates: string; // e.g. "12-MAR to 18-MAR"
  tourDatesJa?: string;
  guests: ItineraryGuest[];
  flights: ItineraryFlight[];
  schedule: ItineraryDay[];
  remarks: string[];
  remarksJa?: string[];
  companyInfo: ItineraryCompanyInfo;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_COMPANY_INFO: ItineraryCompanyInfo = {
  nameEn: "Ikisaki Tours (Private) Limited",
  nameJa: "Ikisaki Tours (Private) Limited",
  registrationNo: "PV 79171",
  sltdaNo: "SLTDA/SQA/PRO/01234",
  address: "492/14, Halbarawa Road, Thalahena, Malabe, Sri Lanka",
  addressJa: "492/14, Halbarawa Road, Thalahena, Malabe, Sri Lanka",
  tel: "+94 75 797 2582",
  email: "info@ikisakitours.com",
  website: "www.ikisakitours.com",
  logoUrl: "/Layout-Icons/logo-transparent.webp",
};
