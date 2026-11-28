/**
 * Utility to crop and convert image to high-resolution WebP based on react-easy-crop coordinates.
 */
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

/**
 * Returns a cropped File object encoded directly as high-resolution WebP (quality: 0.85, max dimension: 1920px)
 */
export async function getCroppedWebPFile(
  imageSrc: string,
  pixelCrop: Area,
  originalFilename: string,
  rotation = 0,
  originalFileSize?: number
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not initialize 2D canvas context for cropping");
  }

  // Calculate target dimensions capped at 1920px while preserving the exact cropped aspect ratio
  const maxDimension = 1920;
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
    targetWidth = Math.max(1, Math.round(targetWidth * ratio));
    targetHeight = Math.max(1, Math.round(targetHeight * ratio));
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (rotation !== 0) {
    // If rotation is used in the future
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas crop export failed"));
          return;
        }

        const dotIndex = originalFilename.lastIndexOf(".");
        const baseName =
          dotIndex !== -1 ? originalFilename.substring(0, dotIndex) : originalFilename;
        const newFilename = `${baseName}.webp`;

        const croppedFile = new File([blob], newFilename, {
          type: "image/webp",
          lastModified: Date.now(),
        });

        if (originalFileSize) {
          (croppedFile as any).originalSize = originalFileSize;
        }

        resolve(croppedFile);
      },
      "image/webp",
      0.85
    );
  });
}
