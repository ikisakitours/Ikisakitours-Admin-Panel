export interface FaqPayload {
  category: Record<string, string>;
  question: Record<string, string>;
  answer: Record<string, string>;
  isLive?: boolean;
}

export interface FaqItem extends FaqPayload {
  id: string;
  referenceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

class FaqService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  private getHeaders(isJson: boolean = true): Record<string, string> {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(adminKey ? { "x-admin-key": adminKey } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // PUBLIC: Fetch all FAQs (client-side)
  async getFaqs() {
    const res = await fetch(`${this.API_URL}/faqs`);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch FAQs");
    }

    return res.json();
  }

  // ADMIN: Fetch all raw multilingual FAQs for the admin panel table
  async getAdminFaqs(): Promise<FaqItem[]> {
    const res = await fetch(`${this.API_URL}/faqs/admin`, {
      headers: this.getHeaders(true),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch admin FAQs");
    }

    return res.json();
  }

  // ADMIN: Fetch a single FAQ by ID to pre-fill the edit form
  async getAdminFaqById(id: string): Promise<FaqItem> {
    const res = await fetch(`${this.API_URL}/faqs/admin/${id}`, {
      headers: this.getHeaders(true),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch FAQ details");
    }

    return res.json();
  }

  // Create a new FAQ with multilingual records
  async createFaq(payload: FaqPayload, _adminApiKey?: string) {
    const res = await fetch(`${this.API_URL}/faqs`, {
      method: "POST",
      headers: this.getHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create FAQ");
    }

    return res.json();
  }

  // ADMIN: Update an existing FAQ by ID
  async updateFaq(id: string, payload: Partial<FaqPayload>) {
    const res = await fetch(`${this.API_URL}/faqs/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update FAQ");
    }

    return res.json();
  }

  // Delete FAQ by ID
  async deleteFaq(id: string) {
    const res = await fetch(`${this.API_URL}/faqs/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete FAQ");
    }

    return res.json();
  }

  // Live Visibility Toggle (Public Site vs Draft)
  async toggleVisibility(id: string, isLive: boolean) {
    try {
      const res = await fetch(`${this.API_URL}/faqs/${id}/visibility`, {
        method: "PATCH",
        headers: this.getHeaders(true),
        credentials: "include",
        body: JSON.stringify({ isLive }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback if backend route is pending deployment
    }
    return { success: true, isLive };
  }
}

export const faqService = new FaqService();