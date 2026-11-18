import type {
  BookingStatus,
  PackageBooking,
  PaymentStatus,
  UpdateBookingStatusPayload,
} from "@/app/tours/types/package-booking.types";

export type {
  BookingCategoryBreakdownItem,
  BookingPricingSummary,
  BookingSelectedOption,
  BookingStatus,
  BookingTravelers,
  PackageBooking,
  PaymentStatus,
  Travelers,
  UpdateBookingStatusPayload,
} from "@/app/tours/types/package-booking.types";

class PackageBookingService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  private getHeaders(): HeadersInit {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
    return {
      "Content-Type": "application/json",
      ...(adminKey ? { "x-admin-key": adminKey } : {}),
    };
  }

  private async extractErrorMessage(res: Response, fallback: string): Promise<string> {
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(data?.message)) return data.message.join(", ");
      if (typeof data?.message === "string" && data.message.trim()) return data.message;
    } catch {
      // Ignore JSON parse failure
    }
    return fallback;
  }

  // 1. Fetch All Bookings
  async getAllBookings(): Promise<PackageBooking[]> {
    const res = await fetch(`${this.API_URL}/package-bookings`, {
      method: "GET",
      headers: this.getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(await this.extractErrorMessage(res, "Failed to fetch bookings"));
    }

    return res.json();
  }

  // 2. Fetch Single Booking Detail
  async getBookingById(id: string): Promise<PackageBooking> {
    const res = await fetch(`${this.API_URL}/package-bookings/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: this.getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(await this.extractErrorMessage(res, "Failed to fetch booking details"));
    }

    return res.json();
  }

  // 3. Update Status & Payment Details
  async updateBookingStatus(id: string, payload: UpdateBookingStatusPayload): Promise<PackageBooking> {
    const res = await fetch(`${this.API_URL}/package-bookings/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await this.extractErrorMessage(res, "Failed to update booking status"));
    }

    return res.json();
  }

  // Backward-compatible alias for updateStatus
  async updateStatus(
    id: string,
    payload: {
      status?: BookingStatus;
      paymentStatus?: PaymentStatus;
      paymentMethod?: string;
      paymentTransactionId?: string;
    },
  ): Promise<PackageBooking> {
    return this.updateBookingStatus(id, payload);
  }

  // 4. Delete Booking
  async deleteBooking(id: string): Promise<{ message: string }> {
    const res = await fetch(`${this.API_URL}/package-bookings/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(await this.extractErrorMessage(res, "Failed to delete booking"));
    }

    return res.json();
  }
}

export const packageBookingService = new PackageBookingService();
