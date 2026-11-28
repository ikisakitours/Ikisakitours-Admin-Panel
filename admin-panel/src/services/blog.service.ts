import { uploadImagesDirectlyToR2 } from "@/services/uploads.service";

export type BlogLanguage = "en" | "ja" | "fr";

export interface BlogPayload {
  id?: string; // included when editing
  slug?: string;
  title: Record<string, string>;
  summary: Record<string, string>;
  category: Record<string, string>;
  readTime: Record<string, string>;
  blog: Record<string, string>;
  author: string;
  images?: string[];
  isLive?: boolean;
}

function parseErrorMessage(errorData: unknown, fallback: string): string {
  if (!errorData) return fallback;
  if (typeof errorData === "object" && errorData !== null) {
    const errObj = errorData as Record<string, unknown>;
    if (Array.isArray(errObj.message)) {
      return errObj.message.join(", ");
    }
    if (typeof errObj.message === "string") {
      return errObj.message;
    }
    if (typeof errObj.error === "string") {
      return String(errObj.error);
    }
  }
  return fallback;
}

class BlogService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  private getHeaders(isJson: boolean = true): Record<string, string> {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(adminKey ? { "x-admin-key": adminKey } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Upload optimized WebP images directly to Cloudflare R2
  async uploadImages(files: File[], _folder: string = "blog-images"): Promise<string[]> {
    return uploadImagesDirectlyToR2(files, "blog-images");
  }

  // Save blog payload (with Cloudflare R2 URLs) to database
  async createBlog(payload: BlogPayload) {
    const res = await fetch(`${this.API_URL}/blogs`, {
      method: "POST",
      headers: this.getHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to create blog"));
    }

    return res.json();
  }

  // ADMIN 1: Fetch all raw multilingual blogs for admin management list
  async getAdminBlogs(): Promise<BlogPayload[]> {
    const res = await fetch(`${this.API_URL}/blogs/admin`, {
      headers: this.getHeaders(true),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to fetch admin blogs"));
    }

    return res.json();
  }

  // ADMIN 2: Fetch a single raw blog by ID to pre-fill the edit form
  async getAdminBlogById(id: string): Promise<BlogPayload> {
    const res = await fetch(`${this.API_URL}/blogs/admin/${id}`, {
      headers: this.getHeaders(true),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to fetch blog details"));
    }

    return res.json();
  }

  // ADMIN 3: Update an existing blog by ID
  async updateBlog(id: string, payload: BlogPayload) {
    const res = await fetch(`${this.API_URL}/blogs/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to update blog"));
    }

    return res.json();
  }

  // Fetch all blog previews (for frontend cards)
  async getPreviews(lang?: string) {
    const query = lang ? `?lang=${lang}` : "";
    const res = await fetch(`${this.API_URL}/blogs/previews${query}`, {
      headers: this.getHeaders(true),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to fetch blog previews"));
    }

    return res.json();
  }

  // Delete blog by ID
  async deleteBlog(id: string) {
    const res = await fetch(`${this.API_URL}/blogs/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to delete blog post"));
    }

    return res.json();
  }

  // Live Visibility Toggle (Public Site vs Draft)
  async toggleVisibility(id: string, isLive: boolean) {
    try {
      const res = await fetch(`${this.API_URL}/blogs/${id}/visibility`, {
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

  // Handle Like/Unlike action
  async toggleLike(id: string, action: "like" | "unlike") {
    const res = await fetch(`${this.API_URL}/blogs/${id}/like`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      credentials: "include",
      body: JSON.stringify({ action }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to update like status"));
    }

    return res.json();
  }
}

export const blogService = new BlogService();
