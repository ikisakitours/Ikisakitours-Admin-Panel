"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Image as ImageIcon, X, UploadCloud, CheckCircle, Sparkles, AlertCircle, Crop as CropIcon } from "lucide-react";
import { ImageCropperModal, CropQueueItem } from "@/components/ImageCropperModal";
import { formatFileSize } from "@/utils/fileSizeHelper";

interface Props {
  existingUrls?: string[];
  onRemoveExisting?: (index: number) => void;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  disabled?: boolean;
  maxImages?: number;
}

export function GallerySection({
  existingUrls = [],
  onRemoveExisting,
  selectedFiles,
  setSelectedFiles,
  disabled = false,
  maxImages = 12,
}: Props) {
  const totalImages = existingUrls.length + selectedFiles.length;
  const remainingSlots = Math.max(0, maxImages - totalImages);
  const isLimitReached = totalImages >= maxImages;

  // Cropper Modal state
  const [cropperQueue, setCropperQueue] = useState<CropQueueItem[]>([]);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Instant 0ms object URLs for preview cards
  const filePreviews = useMemo(() => {
    return selectedFiles.map((file) => {
      const originalSize = (file as any).originalSize || file.size;
      const compressedSize = file.size;
      const savedPercent =
        originalSize > compressedSize
          ? Math.min(99, Math.round(((originalSize - compressedSize) / originalSize) * 100))
          : 0;

      return {
        file,
        url: URL.createObjectURL(file),
        formattedOriginalSize: formatFileSize(originalSize),
        formattedSize: formatFileSize(compressedSize),
        hasSavings: originalSize > compressedSize,
        savedPercent,
      };
    });
  }, [selectedFiles]);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      filePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [filePreviews]);

  // When files are selected from file picker, open cropper modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incoming = Array.from(e.target.files).slice(0, remainingSlots);
      if (incoming.length > 0) {
        const queue: CropQueueItem[] = incoming.map((f) => ({
          file: f,
          previewUrl: URL.createObjectURL(f),
        }));
        setCropperQueue(queue);
        setIsCropperOpen(true);
      }
      e.target.value = "";
    }
  };

  const handleCropperComplete = (croppedFiles: File[]) => {
    setIsCropperOpen(false);
    cropperQueue.forEach((q) => URL.revokeObjectURL(q.previewUrl));
    setCropperQueue([]);

    if (croppedFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...croppedFiles].slice(0, maxImages - existingUrls.length));
    }
  };

  const handleCropperCancel = () => {
    setIsCropperOpen(false);
    cropperQueue.forEach((q) => URL.revokeObjectURL(q.previewUrl));
    setCropperQueue([]);
  };

  // Re-crop an individual already attached image (Non-destructive: uses original uncropped source file)
  const handleRecropItem = (index: number) => {
    const targetFile = selectedFiles[index];
    if (!targetFile) return;

    // Prefer original uncropped file so user can re-frame freely
    const sourceFile = (targetFile as any).originalSourceFile || targetFile;

    const queue: CropQueueItem[] = [
      {
        file: sourceFile,
        previewUrl: URL.createObjectURL(sourceFile),
      },
    ];

    setCropperQueue(queue);
    setIsCropperOpen(true);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      {/* Interactive Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        queue={cropperQueue}
        defaultAspect={16 / 9}
        title="Crop & Frame Tour Package Photo (16:9 Hero & Cards)"
        onComplete={handleCropperComplete}
        onCancel={handleCropperCancel}
      />

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600" /> Package Gallery & Cloudflare R2 Media
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Maximum <strong className="text-slate-800">{maxImages} photos</strong> allowed. Index 0 serves as the primary Cover Photo on catalog cards and hero gallery. Interactive 16:9 frame ensures zero cropping errors.
        </p>
        <div className="flex justify-end pt-0.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap shadow-2xs transition-all ${isLimitReached
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {totalImages} / {maxImages} Images {isLimitReached ? "(Max Reached)" : `(${remainingSlots} left)`}
            </span>
          </span>
        </div>
      </div>

      {/* File Upload Trigger */}
      {!isLimitReached ? (
        <div id="pkg_input_gallery" className="relative border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-5 bg-slate-50/50 hover:bg-emerald-50/20 transition-all text-center">
          <input
            type="file"
            id="package-gallery-upload"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
            onChange={handleFileSelect}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-emerald-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Click to select tour package photos (Interactive 16:9 Cropper)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Maximum {maxImages} images • Zoom & frame live with zero cropping error on website
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Maximum limit reached ({maxImages}/{maxImages} images).</strong> To upload or replace images, remove an existing photo first.
          </span>
        </div>
      )}

      {/* Existing Images from Cloudflare R2 */}
      {existingUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Saved Package Photos ({existingUrls.length})
            </span>
            <span className="text-[10px] text-slate-400">
              Removing an image will permanently delete it from Cloudflare R2 upon saving.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {existingUrls.map((url, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={`existing-${idx}-${url}`}
                  className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs aspect-4/3 flex flex-col"
                >
                  <img
                    src={url}
                    alt={`Existing package gallery photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none">
                    {isCover && (
                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded shadow-xs">
                        ★ Cover
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-medium rounded shadow-xs">
                      R2 Cloud
                    </span>
                  </div>
                  {onRemoveExisting && (
                    <button
                      type="button"
                      onClick={() => onRemoveExisting(idx)}
                      disabled={disabled}
                      title="Remove image (will delete from R2 on save)"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Newly Selected & Cropped Images */}
      {filePreviews.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              New Images to Upload ({filePreviews.length})
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">
              WebP compressed & framed for direct Cloudflare R2 upload
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filePreviews.map((item, idx) => {
              const effectiveIndex = existingUrls.length + idx;
              const isCover = effectiveIndex === 0;

              return (
                <div
                  key={`new-${idx}-${item.file.name}`}
                  className="group relative rounded-xl border-2 border-emerald-300 bg-white overflow-hidden shadow-2xs aspect-4/3 flex flex-col"
                >
                  <img
                    src={item.url}
                    alt={`New upload ${item.file.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none z-10 max-w-[85%]">
                    {isCover && (
                      <span className="self-start px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded shadow-xs">
                        ★ Cover
                      </span>
                    )}
                    {/* Top-left dark badge: Explicit Actual Size & WebP Size */}
                    <div className="flex flex-col gap-0.5 px-2 py-1 rounded-md bg-slate-950/95 backdrop-blur-md text-white font-mono text-[9px] border border-slate-700/80 shadow-md">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 font-sans font-semibold">Actual:</span>
                        <span className="font-bold text-slate-200">{item.formattedOriginalSize}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[8px] uppercase tracking-wider text-emerald-400 font-sans font-semibold">WebP:</span>
                        <span className="font-extrabold text-emerald-300">{item.formattedSize}</span>
                      </div>
                    </div>
                    {/* Green pill: ↓ X% Saved (WebP) */}
                    {item.savedPercent > 0 && (
                      <div className="self-start inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600/95 backdrop-blur-md text-white text-[9px] font-extrabold shadow-md border border-emerald-400/40">
                        <span>↓ {item.savedPercent}% Saved (WebP)</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Re-Crop & Remove */}
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleRecropItem(idx)}
                      disabled={disabled}
                      title="Adjust Crop & Framing"
                      className="w-6 h-6 rounded-full bg-slate-900/90 hover:bg-emerald-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <CropIcon className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      disabled={disabled}
                      title="Remove selected image"
                      className="w-6 h-6 rounded-full bg-slate-800/90 hover:bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 truncate text-center">
                    {item.file.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
