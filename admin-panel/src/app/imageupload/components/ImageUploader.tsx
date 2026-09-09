"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Check, Image as ImageIcon, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface PendingAsset {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageUploaderProps {
  onSaveToDatabase: (
    newAssets: PendingAsset[],
    folder: "admin"
  ) => Promise<void> | void;
}

export default function ImageUploader({ onSaveToDatabase }: ImageUploaderProps) {
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const fileArray = Array.from(files);

    // 1. Batch Limit Validation (Max 4 images)
    if (fileArray.length > 4) {
      setErrorMessage("Batch upload supports a maximum of 4 images at a time.");
      return;
    }

    // 2. Strict WebP Validation
    const invalidFiles = fileArray.filter(
      (file) => file.type !== "image/webp" && !file.name.toLowerCase().endsWith(".webp")
    );

    if (invalidFiles.length > 0) {
      setErrorMessage("Invalid format! Only .webp images are allowed.");
      return;
    }

    // 3. Stage Valid Files
    const staged: PendingAsset[] = fileArray.map((file, idx) => ({
      id: `draft-${Date.now()}-${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingAssets(staged);
  };

  const handleRemoveDraft = (id: string) => {
    setPendingAssets((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmitAll = async () => {
    if (pendingAssets.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSaveToDatabase(pendingAssets, "admin");
      setPendingAssets([]);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to upload image assets.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-slate-200/80 shadow-xs">
      <CardHeader className="p-5 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
          WebP Image Uploader
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 mt-0.5">
          Upload batch assets for the admin panel (Select up to 4 .webp images).
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            validateAndProcessFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/60"
              : "border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => validateAndProcessFiles(e.target.files)}
            multiple
            accept="image/webp"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-xs font-semibold text-slate-800 text-center">
            Click or drag & drop up to 4 images (.webp)
          </p>
          <p className="text-[11px] font-bold text-amber-600 mt-1">
            Strict constraint: Only .webp format allowed
          </p>
        </div>

        {/* Staged Image List */}
        {pendingAssets.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Staged Assets ({pendingAssets.length})
              </span>

              <button
                type="button"
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {isSubmitting ? "Uploading..." : "Upload Images"}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pendingAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center relative group"
                >
                  <img
                    src={asset.previewUrl}
                    alt="Preview"
                    className="w-full h-28 object-cover rounded-lg border border-slate-200 bg-white"
                  />
                  <span className="text-[10px] font-medium text-slate-500 truncate w-full text-center mt-1.5">
                    {asset.file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveDraft(asset.id)}
                    className="absolute top-3 right-3 p-1 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-full shadow-xs transition-colors"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}