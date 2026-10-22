class TourServiceAdminService {
  private API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");

  async getChauffeurRequests() {
    const targetUrl = `${this.API_URL}/api/services/chauffeur`;
    console.log("FETCHING URL:", targetUrl); // <-- Look at your browser console for this log!

    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`Failed with status ${res.status} when fetching ${targetUrl}`);
    return res.json();
  }

  // (Do the same for custom and transfer if needed)
  async getCustomRequests() {
    const res = await fetch(`${this.API_URL}/api/services/custom`);
    if (!res.ok) throw new Error("Failed to fetch custom service requests");
    return res.json();
  }

  async getTransferRequests() {
    const res = await fetch(`${this.API_URL}/api/services/transfer`);
    if (!res.ok) throw new Error("Failed to fetch transfer service requests");
    return res.json();
  }
}

export const tourServiceAdmin = new TourServiceAdminService();