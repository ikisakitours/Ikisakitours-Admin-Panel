export interface AvailabilityPayload {
  apiClosedDates: string[];
}

class AvailabilityService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  // Fetch current availability closed dates from the backend
  async getAvailability() {
    const res = await fetch(`${this.API_URL}/availability`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch availability");
    }

    return res.json();
  }

  // Update or save closed dates to the backend
  async updateAvailability(payload: AvailabilityPayload) {
    const res = await fetch(`${this.API_URL}/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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