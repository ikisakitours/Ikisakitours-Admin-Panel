import {
  LegalDocument,
} from "@/app/legaldocs/types/legal.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class LegalDocsService {
  private getHeaders(): HeadersInit {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (adminKey) {
      headers["x-admin-key"] = adminKey;
    }
    return headers;
  }

  // ── 1. Fetch All Legal Documents ──────────────────────────────────────────────
  async getAllDocuments(): Promise<LegalDocument[]> {
    const endpoints = [`${API_URL}/legal-docs`, `${API_URL}/legaldocs`];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.getHeaders(),
          cache: "no-store",
        });

        if (response.ok) {
          const result = await response.json();
          const list: LegalDocument[] = Array.isArray(result) ? result : result.data;
          if (Array.isArray(list) && list.length > 0) {
            return list;
          }
        }
      } catch (err) {
        // Continue to fallback
      }
    }

    // Default fallback when DB is empty or first initialized
    return [];
  }

  // ── 2. Fetch Single Document by ID / Slug ─────────────────────────────────────
  async getDocumentById(id: string): Promise<LegalDocument> {
    const endpoints = [
      `${API_URL}/legal-docs/${encodeURIComponent(id)}`,
      `${API_URL}/legaldocs/${encodeURIComponent(id)}`,
    ];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.getHeaders(),
          cache: "no-store",
        });

        if (response.ok) {
          const result = await response.json();
          return (result.data || result) as LegalDocument;
        }
      } catch (err) {
        // Continue to fallback
      }
    }

    throw new Error(`Legal document with ID "${id}" not found.`);
  }

  // ── 3. Insert / Create New Document in DB ─────────────────────────────────────
  async insertDocument(doc: LegalDocument): Promise<any> {
    const response = await fetch(`${API_URL}/legal-docs`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(doc),
    });

    if (!response.ok) {
      // In case route is /legaldocs
      const fallbackRes = await fetch(`${API_URL}/legaldocs`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(doc),
      });

      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to insert legal document "${doc.id}" into database`);
    }

    return await response.json();
  }

  // ── 4. Update Existing Document in DB ─────────────────────────────────────────
  async updateDocument(id: string, doc: Partial<LegalDocument>): Promise<any> {
    const response = await fetch(`${API_URL}/legal-docs/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(doc),
    });

    if (!response.ok) {
      const fallbackRes = await fetch(`${API_URL}/legaldocs/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(doc),
      });

      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update legal document "${id}" in database`);
    }

    return await response.json();
  }

  // ── 5. Save (Upsert: Update if exists, or Insert if not in DB) ─────────────────
  async saveDocument(doc: LegalDocument): Promise<any> {
    // Step A: Attempt PATCH to update existing record by ID
    const patchRes = await fetch(`${API_URL}/legal-docs/${encodeURIComponent(doc.id)}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(doc),
    });

    if (patchRes.ok) {
      return await patchRes.json();
    }

    // Step B: If record doesn't exist yet (404), insert new record via POST
    if (patchRes.status === 404) {
      const postRes = await fetch(`${API_URL}/legal-docs`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(doc),
      });

      if (postRes.ok) {
        return await postRes.json();
      }

      // Fallback check for /legaldocs route
      const fallbackPost = await fetch(`${API_URL}/legaldocs`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(doc),
      });

      if (fallbackPost.ok) {
        return await fallbackPost.json();
      }

      const errorData = await postRes.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to insert new legal document "${doc.id}"`);
    }

    const errorData = await patchRes.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to save legal document "${doc.id}"`);
  }

  // ── 6. Delete Document from DB ────────────────────────────────────────────────
  async deleteDocument(id: string): Promise<any> {
    const response = await fetch(`${API_URL}/legal-docs/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const fallbackRes = await fetch(`${API_URL}/legaldocs/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete legal document "${id}" from database`);
    }

    return await response.json();
  }
}

export const legalDocsService = new LegalDocsService();
export const legalDocService = legalDocsService;
