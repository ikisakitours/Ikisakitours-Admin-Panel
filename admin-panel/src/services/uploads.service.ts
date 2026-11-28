import { fetcher } from "@/lib/api-client";
import { optimizeImagesToWebP } from "@/utils/imageOptimizer";

export type UploadFolder = "package-images" | "destination-images" | "blog-images";

export interface PresignedUrlRequestItem {
  filename: string;
  contentType: string;
  folder: UploadFolder;
}

export interface PresignedUrlResponseItem {
  uploadUrl?: string;
  presignedUrl?: string;
  url?: string;
  publicUrl?: string;
  cdnUrl?: string;
  key?: string;
  filename?: string;
}

export interface SingleUploadResponse {
  url: string;
}

export interface BatchUploadResponse {
  urls: string[];
}

/**
 * Direct-to-Cloudflare R2 Upload Helper:
 * 1. Automatically converts and optimizes all newly selected File(s) to .webp in-browser
 *    (aspect ratio preserved, 1920x1920 max, quality: 0.88; skips if already .webp <= 400KB).
 * 2. Requests signed upload URLs from POST /api/uploads/presigned-urls.
 * 3. PUTs each WebP blob directly to its Cloudflare R2 uploadUrl (Content-Type: image/webp).
 * 4. Returns an array of public CDN URLs (publicUrl strings).
 */
export async function uploadImagesDirectlyToR2(
  files: File[],
  folder: UploadFolder,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  if (!files || files.length === 0) {
    return [];
  }

  // 1. Client-Side High-Quality WebP Optimization
  const optimizedFiles = await optimizeImagesToWebP(files, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.88,
  });

  // 2. Request Presigned Upload URLs from backend
  const payload = {
    files: optimizedFiles.map((f) => ({
      filename: f.name,
      contentType: "image/webp",
      folder,
    })),
  };

  const response = await fetcher<
    | PresignedUrlResponseItem[]
    | {
        uploads?: PresignedUrlResponseItem[];
        urls?: PresignedUrlResponseItem[];
        files?: PresignedUrlResponseItem[];
        data?: PresignedUrlResponseItem[];
      }
  >("/uploads/presigned-urls", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const presignedItems: PresignedUrlResponseItem[] = Array.isArray(response)
    ? response
    : response.uploads || response.urls || response.files || response.data || [];

  if (presignedItems.length !== optimizedFiles.length) {
    throw new Error(
      `Presigned URL count (${presignedItems.length}) did not match files count (${optimizedFiles.length})`
    );
  }

  // 3. Upload each WebP blob directly to Cloudflare R2
  const publicUrls: string[] = [];

  for (let i = 0; i < optimizedFiles.length; i++) {
    const file = optimizedFiles[i];
    const item = presignedItems[i];
    const uploadUrl = item.uploadUrl || item.presignedUrl || item.url;
    const publicUrl = item.publicUrl || item.url || item.cdnUrl;

    if (!uploadUrl || !publicUrl) {
      throw new Error(`Invalid presigned response for image ${file.name}`);
    }

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "image/webp",
      },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error(
        `Failed to upload ${file.name} directly to storage (${putRes.status} ${putRes.statusText})`
      );
    }

    publicUrls.push(publicUrl);
    if (onProgress) {
      onProgress(i + 1, optimizedFiles.length);
    }
  }

  return publicUrls;
}

export const UploadsService = {
  uploadDirectToR2: uploadImagesDirectlyToR2,

  // Backward compatibility fallback for legacy batch upload
  uploadBatch: async (
    files: File[],
    folder?: string
  ): Promise<BatchUploadResponse> => {
    const targetFolder: UploadFolder =
      folder === "destinations" || folder === "destination-images"
        ? "destination-images"
        : folder === "blogs" || folder === "blog-images"
        ? "blog-images"
        : "package-images";

    const urls = await uploadImagesDirectlyToR2(files, targetFolder);
    return { urls };
  },
};
