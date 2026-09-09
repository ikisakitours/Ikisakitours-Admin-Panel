import { PackageFormData } from "@/app/addpackage/components/PackageForm";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const packageService = {
  /**
   * Submits package form data alongside raw file images to NestJS
   */
  async createPackage(formData: PackageFormData, images: File[]) {
    const data = new FormData();

    // 1. Append basic primitive fields
    data.append("type", formData.type);
    data.append("slug", formData.slug);
    data.append("titleEmphasis", formData.titleEmphasis);
    data.append("title", formData.title);
    data.append("price", formData.price);
    data.append("discount", formData.discount || "0");
    data.append("provider", formData.provider);
    data.append("leadTitle", formData.leadTitle);
    data.append("leadDescription", formData.leadDescription);
    data.append("description", formData.description);

    // 2. Stringify complex objects/arrays for NestJS DTO parsing
    data.append(
      "activityDetails",
      JSON.stringify(formData.activityDetails.filter((a) => a.title.trim() !== ""))
    );
    data.append(
      "highlights",
      JSON.stringify(formData.highlights.filter((h) => h.trim() !== ""))
    );
    data.append(
      "itinerary",
      JSON.stringify(
        formData.itinerary.map((it) => ({ ...it, day: Number(it.day) }))
      )
    );
    data.append(
      "destinations",
      JSON.stringify(formData.destinations.filter((d) => d.name.trim() !== ""))
    );
    data.append(
      "includes",
      JSON.stringify(formData.includes.filter((i) => i.trim() !== ""))
    );
    data.append(
      "excludes",
      JSON.stringify(formData.excludes.filter((e) => e.trim() !== ""))
    );

    // 3. Append binary image files under field name 'images' matching NestJS FilesInterceptor('images')
    images.forEach((file) => {
      data.append("images", file);
    });

    // Note: Do not manually set Content-Type header when sending FormData!
    // The browser automatically sets boundary headers.
    const response = await fetch(`${API_URL}/addpackages`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create package");
    }

    return await response.json();
  },
};