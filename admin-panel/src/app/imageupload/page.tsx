"use client";

import { useState } from "react";
import ImageUploader, { PendingAsset } from "./components/ImageUploader";
import ImageGallery, { AssetImage } from "./components/ImageGallery";

const INITIAL_IMAGES: AssetImage[] = [
  {
    id: "sl-img-1",
    url: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
    name: "Sigiriya Lion Rock Fortress",
  },
  {
    id: "sl-img-2",
    url: "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80",
    name: "Nine Arch Bridge Demodara",
  },
  {
    id: "sl-img-3",
    url: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80",
    name: "Mirissa Coconut Tree Hill",
  },
  {
    id: "sl-img-4",
    url: "https://images.unsplash.com/photo-1588001832198-c15cff59b078?auto=format&fit=crop&w=800&q=80",
    name: "Yala Safari Wild Elephant",
  },
];

export default function ImageUploadPage() {
  const [images, setImages] = useState<AssetImage[]>(INITIAL_IMAGES);

  const handleSaveToDatabase = (stagedAssets: PendingAsset[]) => {
    // Maps pending staged files into simple asset objects
    const savedAssets: AssetImage[] = stagedAssets.map((asset) => ({
      id: asset.id,
      url: asset.previewUrl, // Replace this with your uploaded Cloudflare R2 response URL when API is integrated
      name: asset.file.name,
    }));

    setImages((prev) => [...savedAssets, ...prev]);
  };

  return (
    <div className="w-full space-y-6 p-6">
      <ImageUploader onSaveToDatabase={handleSaveToDatabase} />
      <ImageGallery images={images} />
    </div>
  );
}