export interface ServiceNotePayload {
  serviceType: string;
  vehicleType: string;
  startingPrice: string;
  vehicleCapacity: string;
  luggages: string;
  driverOption: string;
  notes: Record<string, string[]>;
}

class ServiceNotesService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Create a new service note
  async createServiceNote(payload: ServiceNotePayload) {
    const res = await fetch(`${this.API_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create service note");
    }

    return res.json();
  }

  // Fetch all service notes (with optional serviceType filter and language support)
  async getAllServiceNotes(serviceType?: string, lang?: string) {
    const params = new URLSearchParams();
    if (serviceType) params.append("serviceType", serviceType);
    if (lang) params.append("lang", lang);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${this.API_URL}/notes${query}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch service notes");
    }

    return res.json();
  }

  // Update an existing service note
  async updateServiceNote(id: string | number, payload: Partial<ServiceNotePayload>) {
    const res = await fetch(`${this.API_URL}/notes/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update service note");
    }

    return res.json();
  }
}

export const serviceNotesService = new ServiceNotesService();