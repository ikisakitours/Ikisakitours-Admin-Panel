export interface Travelers {
  adults: number;
  couples: number;
  children: number;
  infants: number;
}

export interface PackageBooking {
  id: string;
  packageId: string;
  packageName: string;
  journeyDate: string;
  travelers: Travelers;
  firstname: string;
  lastname: string;
  email: string;
  country: string;
  type: 'oneday' | 'multiday';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface UpdateBookingStatusPayload {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

class PackageBookingService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  // 1. Fetch all package bookings for the admin panel
  async getAllBookings(): Promise<PackageBooking[]> {
    const res = await fetch(`${this.API_URL}/package-bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensures fresh data in admin panel
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch package bookings");
    }

    return res.json();
  }

  // 2. Update booking status (e.g. pending -> confirmed)
  async updateStatus(id: string, payload: UpdateBookingStatusPayload): Promise<PackageBooking> {
    const res = await fetch(`${this.API_URL}/package-bookings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update booking status");
    }

    return res.json();
  }

  // 3. Delete a booking if required by admin
  async deleteBooking(id: string): Promise<{ message: string }> {
    const res = await fetch(`${this.API_URL}/package-bookings/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete booking");
    }

    return res.json();
  }
}

export const packageBookingService = new PackageBookingService();