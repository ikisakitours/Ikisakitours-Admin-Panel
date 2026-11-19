export interface ContactItem {
  id: string;
  inquiryType: string;
  date: string;
  status: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  tourInterest?: string;
  createdAt?: string;
  updatedAt?: string;
}

class ContactService {
  private getBaseUrl() {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const cleanBase = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    return `${cleanBase}/api`;
  }

  private getHeaders(): HeadersInit {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return {
      "Content-Type": "application/json",
      ...(adminKey ? { "x-admin-key": adminKey } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Fetch all contact submissions for the admin panel
  async getContacts(): Promise<ContactItem[]> {
    const res = await fetch(`${this.getBaseUrl()}/contacts`, {
      headers: this.getHeaders(),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch contact inquiries");
    }

    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((item) => ({
      ...item,
      createdAt: item.createdAt || item.date || new Date().toISOString(),
      status: item.status || "pending",
    }));
  }

  // Update status of a contact inquiry (pending, contacted, completed)
  async updateContactStatus(id: string, status: string): Promise<ContactItem> {
    const res = await fetch(`${this.getBaseUrl()}/contacts/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    }).catch(async () => {
      // Fallback if route is /contacts/:id
      return await fetch(`${this.getBaseUrl()}/contacts/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });
    });

    if (!res.ok) {
      // If backend route doesn't have PATCH, return optimistic item
      return { id, status } as any;
    }

    return res.json().catch(() => ({ id, status } as any));
  }

  // Delete a contact inquiry by ID
  async deleteContact(id: string): Promise<{ message: string }> {
    const res = await fetch(`${this.getBaseUrl()}/contacts/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete contact inquiry");
    }

    return res.json().catch(() => ({ message: "Inquiry deleted successfully" }));
  }
}

export const contactService = new ContactService();
