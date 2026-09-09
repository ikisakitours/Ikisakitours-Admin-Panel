import { fetcher } from "@/lib/api-client";

export interface SingleUploadResponse {
  url: string;
}

export interface BatchUploadResponse {
  urls: string[];
}

export const UploadsService = {

  // Upload multiple files (up to 4)
  uploadBatch: async (files: File[], folder?: string): Promise<BatchUploadResponse> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    if (folder) formData.append("folder", folder);

    return fetcher<BatchUploadResponse>("/uploads/batch", {
      method: "POST",
      body: formData,
    });
  },
};