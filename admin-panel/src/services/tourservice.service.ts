class TourServiceAdminService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  async getCustomRequests() {
    const res = await fetch(`${this.API_URL}/api/services/custom`);
    if (!res.ok) throw new Error("Failed to fetch custom service requests");
    return res.json();
  }

  async getChauffeurRequests() {
    const res = await fetch(`${this.API_URL}/api/services/chauffeur`);
    if (!res.ok) throw new Error("Failed to fetch chauffeur service requests");
    return res.json();
  }

  async getTransferRequests() {
    const res = await fetch(`${this.API_URL}/api/services/transfer`);
    if (!res.ok) throw new Error("Failed to fetch transfer service requests");
    return res.json();
  }
}

export const tourServiceAdmin = new TourServiceAdminService();