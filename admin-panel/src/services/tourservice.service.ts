class TourServiceAdminService {
  private getBaseUrl() {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    // Strips any trailing "/api" or slashes so we can cleanly control it
    const cleanBase = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    return `${cleanBase}/api`;
  }

  async getCustomRequests() {
    const res = await fetch(`${this.getBaseUrl()}/services/custom`);
    if (!res.ok) throw new Error("Failed to fetch custom service requests");
    return res.json();
  }

  async getChauffeurRequests() {
    const res = await fetch(`${this.getBaseUrl()}/services/chauffeur`);
    if (!res.ok) throw new Error("Failed to fetch chauffeur service requests");
    return res.json();
  }

  async getTransferRequests() {
    const res = await fetch(`${this.getBaseUrl()}/services/transfer`);
    if (!res.ok) throw new Error("Failed to fetch transfer service requests");
    return res.json();
  }

  // --- NEW: Update the status of any service request (custom, chauffeur, or transfer) ---
  async updateServiceStatus(id: string, status: string) {
    const res = await fetch(`${this.getBaseUrl()}/services/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      throw new Error("Failed to update service request status");
    }

    return res.json();
  }
}

export const tourServiceAdmin = new TourServiceAdminService();