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

  // Fetch current availability closed dates from the backend (no caching, pure server data)
  async getAvailability(): Promise<AvailabilityResponse> {
    // Purge any legacy localStorage cache if present in browser
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ikisaki_availability_details");
      } catch (e) {
        // Ignore
      }
    }

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

    return result;
  }

  // Update or save closed dates to the backend
  async updateAvailability(payload: AvailabilityPayload): Promise<any> {
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
