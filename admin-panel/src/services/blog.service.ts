export interface BlogPayload {
  title: string;
  slug?: string;
  summary: string;
  category: string;
  readTime: string;
  blog: string;
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

  // Fetch all blog previews (for admin list or preview cards)
  async getPreviews() {
    const res = await fetch(`${this.API_URL}/blogs/previews`);

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