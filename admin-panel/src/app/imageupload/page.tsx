"use client";

import { useState } from "react";
import ImageUploader, { PendingAsset } from "./components/ImageUploader";
import ImageGallery from "./components/ImageGallery";

export interface AssetImage {
  id: string;
  url: string;
  title: string;
  alt: string;
  size: string;
  uploadedAt: string;
}

const INITIAL_IMAGES: AssetImage[] = [
  {
    id: "sl-img-1",
    url: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
    title: "Sigiriya Lion Rock Fortress",
    alt: "Aerial view of the ancient Sigiriya Lion Rock Fortress surrounded by lush green jungle in Sri Lanka",
    size: "2.4 MB",
    uploadedAt: "Aug 10, 2026",
  },
  {
    id: "sl-img-2",
    url: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80",
    title: "Nine Arch Bridge Demodara",
    alt: "Iconic Nine Arch Bridge in Ella Sri Lanka with a blue train crossing over lush tea plantations",
    size: "1.8 MB",
    uploadedAt: "Aug 09, 2026",
  },
  {
    id: "sl-img-3",
    url: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80",
    title: "Mirissa Coconut Tree Hill",
    alt: "Scenic tropical sunset at Coconut Tree Hill overlooking turquoise ocean waves in Mirissa Sri Lanka",
    size: "1.5 MB",
    uploadedAt: "Aug 07, 2026",
  },
  {
    id: "sl-img-4",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFOGL4N23KtthYGxmt92mOpl1hYIUkIqh3XWThDn92ZsKseSlRL3pY5gI&s=10",
    title: "Ella Rock Peak Trail",
    alt: "Panoramic mountain valley view from the top of Ella Rock during early morning sunrise in Sri Lanka",
    size: "2.1 MB",
    uploadedAt: "Aug 05, 2026",
  },
  {
    id: "sl-img-5",
    url: "https://images.unsplash.com/photo-1588001832198-c15cff59b078?auto=format&fit=crop&w=800&q=80",
    title: "Yala Safari Wild Elephant",
    alt: "Wild Sri Lankan elephant roaming through Yala National Park safari reservation",
    size: "1.9 MB",
    uploadedAt: "Aug 03, 2026",
  },
];

export default function ImageUploadPage() {
  const [images, setImages] = useState<AssetImage[]>(INITIAL_IMAGES);

  const handleSaveToDatabase = (stagedAssets: PendingAsset[]) => {
    // Maps pending files and custom user metadata into saved gallery assets
    const savedAssets: AssetImage[] = stagedAssets.map((asset) => ({
      id: asset.id,
      url: asset.previewUrl, // Replace with your uploaded backend image URL when connected
      title: asset.title || "Untitled Image",
      alt: asset.alt || "No alt tag provided",
      size: `${(asset.file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    }));

    setImages((prev) => [...savedAssets, ...prev]);
  };

  const handleUpdateMetadata = (
    id: string,
    field: "title" | "alt",
    value: string
  ) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [field]: value } : img))
    );
  };

  const handleDeleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="w-full space-y-6 p-6">
      <ImageUploader onSaveToDatabase={handleSaveToDatabase} />
      <ImageGallery
        images={images}
        onUpdateMetadata={handleUpdateMetadata}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
}