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
}

class BlogService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Step 1: Upload raw image files to Cloudflare R2 batch endpoint
  async uploadImages(files: File[], folder: string = "blogs"): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("folder", folder);

    const res = await fetch(`${this.API_URL}/uploads/batch`, {
      method: "POST",
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create blog");
    }

    return res.json();
  }

  // ADMIN 1: Fetch all raw multilingual blogs for admin management list
  async getAdminBlogs(): Promise<BlogPayload[]> {
    const res = await fetch(`${this.API_URL}/blogs/admin`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch admin blogs");
    }

    return res.json();
  }

  // ADMIN 2: Fetch a single raw blog by ID to pre-fill the edit form
  async getAdminBlogById(id: string): Promise<BlogPayload> {
    const res = await fetch(`${this.API_URL}/blogs/admin/${id}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch blog details");
    }

    return res.json();
  }

  // ADMIN 3: Update an existing blog by ID
  async updateBlog(id: string, payload: BlogPayload) {
    const res = await fetch(`${this.API_URL}/blogs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update blog");
    }

    return res.json();
  }

  // Fetch all blog previews (for frontend cards)
  async getPreviews(lang?: string) {
    const query = lang ? `?lang=${lang}` : '';
    const res = await fetch(`${this.API_URL}/blogs/previews${query}`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch blog previews");
    }

    return res.json();
  }

  // Delete blog by ID
  async deleteBlog(id: string) {
    const res = await fetch(`${this.API_URL}/blogs/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to delete blog post");
    }

    return res.json();
  }

  // Handle Like/Unlike action
  async toggleLike(id: string, action: "like" | "unlike") {
    const res = await fetch(`${this.API_URL}/blogs/${id}/like`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update like status");
    }

    return res.json();
  }
}

export const blogService = new BlogService();