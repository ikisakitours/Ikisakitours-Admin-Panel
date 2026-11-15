export interface DateDetailItem {
  date: string;
  tourType: string;
  tourTypes?: string[];
  color: string;
  colors?: string[];
  hex?: string;
  hexes?: string[];
  note?: string;
  notes?: Record<string, string>;
}

export interface AvailabilityPayload {
  apiClosedDates: string[];
  dateDetails?: Record<
    string,
    {
      tourType?: string;
      tourTypes?: string[];
      color?: string;
      colors?: string[];
      hex?: string;
      hexes?: string[];
      note?: string;
      notes?: Record<string, string>;
    }
  >;
  closedDateDetails?: DateDetailItem[];
}

export interface AvailabilityResponse {
  apiClosedDates: string[];
  dateDetails?: Record<
    string,
    {
      tourType?: string;
      tourTypes?: string[];
      color?: string;
      colors?: string[];
      hex?: string;
      hexes?: string[];
      note?: string;
      notes?: Record<string, string>;
    }
  >;
  closedDateDetails?: DateDetailItem[];
}

const STORAGE_KEY = "ikisaki_availability_details";

class AvailabilityService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  private getHeaders(): HeadersInit {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (adminKey) {
      headers["x-admin-key"] = adminKey;
    }
    return headers;
  }

  // Fetch current availability closed dates from the backend
  async getAvailability(): Promise<AvailabilityResponse> {
    const res = await fetch(`${this.API_URL}/availability`, {
      method: "GET",
      headers: this.getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch availability");
    }

    const data = await res.json();
    const result: AvailabilityResponse = {
      apiClosedDates: Array.isArray(data.apiClosedDates) ? data.apiClosedDates : (Array.isArray(data) ? data : []),
      dateDetails: data.dateDetails || {},
      closedDateDetails: data.closedDateDetails || [],
    };

    // Hydrate local details if backend only returned apiClosedDates
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          result.dateDetails = { ...parsed, ...(result.dateDetails || {}) };
        }
      } catch (e) {
        // Ignore JSON error
      }
    }

    return result;
  }

  // Update or save closed dates to the backend
  async updateAvailability(payload: AvailabilityPayload): Promise<any> {
    // Cache details locally to guarantee zero data loss
    if (typeof window !== "undefined" && payload.dateDetails) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.dateDetails));
      } catch (e) {
        // Ignore storage error
      }
    }

    const res = await fetch(`${this.API_URL}/availability`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update availability");
    }

    return res.json();
  }
}

export const availabilityService = new AvailabilityService();
