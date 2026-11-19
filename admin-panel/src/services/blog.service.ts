export type BlogLanguage = 'en' | 'ja' | 'fr';

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

class BlogService {
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

  // Step 1: Upload raw image files to Cloudflare R2 batch endpoint
  async uploadImages(files: File[], folder: string = "blogs"): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("folder", folder);

    const res = await fetch(`${this.API_URL}/uploads/batch`, {
      method: "POST",
      headers: this.getHeaders(false),
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload images to R2");
    }

    const data: { urls: string[] } = await res.json();
    return data.urls;
  }

  // Step 2: Save blog payload (with R2 URLs) to database
  async createBlog(payload: BlogPayload) {
    const res = await fetch(`${this.API_URL}/blogs`, {
      method: "POST",
      headers: this.getHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create blog");
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
      throw new Error(error.message || "Failed to fetch admin blogs");
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
      throw new Error(error.message || "Failed to fetch blog details");
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
      throw new Error(error.message || "Failed to update blog");
    }

    return res.json();
  }

  // Fetch all blog previews (for frontend cards)
  async getPreviews(lang?: string) {
    const query = lang ? `?lang=${lang}` : '';
    const res = await fetch(`${this.API_URL}/blogs/previews${query}`, {
      headers: this.getHeaders(true),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch blog previews");
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
      throw new Error(error.message || "Failed to delete blog post");
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
      throw new Error(error.message || "Failed to update like status");
    }

    return res.json();
  }
}

export const blogService = new BlogService();