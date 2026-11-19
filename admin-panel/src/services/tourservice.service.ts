import type { TourServiceCategory, TourServiceRequest } from "@/app/tourservices/types/tourservice.types";

class TourServiceAdminService {
  private getBaseUrl() {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const cleanBase = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    return `${cleanBase}/api`;
  }

  private getHeaders(): HeadersInit {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
    return {
      "Content-Type": "application/json",
      ...(adminKey ? { "x-admin-key": adminKey } : {}),
    };
  }

  async getCustomRequests(): Promise<TourServiceRequest[]> {
    const res = await fetch(`${this.getBaseUrl()}/services/custom`, {
      headers: this.getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch custom service requests");
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((item) => ({
      ...item,
      category: "custom" as TourServiceCategory,
    }));
  }

  async getChauffeurRequests(): Promise<TourServiceRequest[]> {
    const res = await fetch(`${this.getBaseUrl()}/services/chauffeur`, {
      headers: this.getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch chauffeur service requests");
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((item) => ({
      ...item,
      category: "chauffeur" as TourServiceCategory,
    }));
  }

  async getTransferRequests(): Promise<TourServiceRequest[]> {
    const res = await fetch(`${this.getBaseUrl()}/services/transfer`, {
      headers: this.getHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch transfer service requests");
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((item) => ({
      ...item,
      category: "transfer" as TourServiceCategory,
    }));
  }

  // Fetch all service requests combined across all 3 categories
  async getAllServices(): Promise<TourServiceRequest[]> {
    const [custom, chauffeur, transfer] = await Promise.all([
      this.getCustomRequests().catch(() => []),
      this.getChauffeurRequests().catch(() => []),
      this.getTransferRequests().catch(() => []),
    ]);

    return [...custom, ...chauffeur, ...transfer].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  // Update status of any service request (custom, chauffeur, or transfer)
  async updateServiceStatus(id: string, status: string): Promise<TourServiceRequest> {
    const res = await fetch(`${this.getBaseUrl()}/services/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      throw new Error("Failed to update service request status");
    }

    return res.json();
  }

  // Delete / cancel service request
  async deleteServiceRequest(id: string): Promise<{ message: string }> {
    const res = await fetch(`${this.getBaseUrl()}/services/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      // If DELETE endpoint isn't implemented in backend, fallback to PATCH status: 'rejected'
      return this.updateServiceStatus(id, "rejected").then(() => ({
        message: "Service request rejected",
      }));
    }

    return res.json().catch(() => ({ message: "Service request deleted" }));
  }
}

export const tourServiceAdmin = new TourServiceAdminService();
