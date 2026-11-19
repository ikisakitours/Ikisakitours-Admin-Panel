export interface ServiceNotePayload {
  serviceType: string;
  vehicleType: string;
  startingPrice: string;
  vehicleCapacity: string;
  luggages: string;
  withDriverPrice?: string;
  withGuidePrice?: string;
  withDriverAndGuidePrice?: string;
  notes: Record<string, string[]>;
}

class ServiceNotesService {
  private getBaseUrl(): string {
    const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    return raw.replace(/\/+$/, "");
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const adminKey = process.env.ADMIN_KEY || process.env.NEXT_PUBLIC_ADMIN_KEY;
    if (adminKey) {
      headers["x-admin-key"] = adminKey;
    }
    return headers;
  }

  // Create a new service note
  async createServiceNote(payload: ServiceNotePayload) {
    const res = await fetch(`${this.getBaseUrl()}/services/notes`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create service note");
    }

    return res.json();
  }

  // Fetch all service notes (with optional serviceType filter and language support)
  async getAllServiceNotes(serviceType?: string, lang?: string) {
    const params = new URLSearchParams();
    if (serviceType && serviceType !== "all") params.append("serviceType", serviceType);
    if (lang) params.append("lang", lang);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${this.getBaseUrl()}/services/notes${query}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch service notes");
    }

    return res.json();
  }

  // Update an existing service note
  async updateServiceNote(id: string | number, payload: Partial<ServiceNotePayload>) {
    const res = await fetch(`${this.getBaseUrl()}/services/notes/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update service note");
    }

    return res.json();
  }

  // Delete a service note
  async deleteServiceNote(id: string | number) {
    const res = await fetch(`${this.getBaseUrl()}/services/notes/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete service note");
    }

    return res.json().catch(() => ({ success: true }));
  }
}

export const serviceNotesService = new ServiceNotesService();