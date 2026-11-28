"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Point, Area } from "react-easy-crop";
import { getCroppedWebPFile } from "@/utils/cropImageHelper";
import { optimizeImageToWebP } from "@/utils/imageOptimizer";
import {
  Crop as CropIcon,
  ZoomIn,
  ZoomOut,
  Check,
  X,
  SkipForward,
  Sparkles,
  Layers,
} from "lucide-react";

export interface CropQueueItem {
  file: File;
  previewUrl: string;
}

interface ImageCropperModalProps {
  queue: CropQueueItem[];
  isOpen: boolean;
  onComplete: (croppedFiles: File[]) => void;
  onCancel: () => void;
  defaultAspect?: number; // e.g. 16/9 = ~1.777
  title?: string;
}

export function ImageCropperModal({
  queue,
  isOpen,
  onComplete,
  onCancel,
  defaultAspect = 16 / 9,
  title = "Crop & Frame Photo for Website",
}: ImageCropperModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [croppedResults, setCroppedResults] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cropper Controls State
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(defaultAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const currentItem = queue[currentIndex];
  const isMultiple = queue.length > 1;

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const proceedNext = (nextResults: File[]) => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } else {
      // Finished all items in queue
      onComplete(nextResults);
      resetModal();
    }
  };

  const resetModal = () => {
    setCurrentIndex(0);
    setCroppedResults([]);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsProcessing(false);
  };

  const handleApplyCrop = async () => {
    if (!currentItem) return;

    setIsProcessing(true);
    try {
      let finalFile: File;
      if (croppedAreaPixels) {
        finalFile = await getCroppedWebPFile(
          currentItem.previewUrl,
          croppedAreaPixels,
          currentItem.file.name,
          0,
          currentItem.file.size
        );
      } else {
        finalFile = currentItem.file;
      }
      (finalFile as any).originalSize = (currentItem.file as any).originalSize || currentItem.file.size;
      (finalFile as any).originalSourceFile = (currentItem.file as any).originalSourceFile || currentItem.file;

      const nextResults = [...croppedResults, finalFile];
      setCroppedResults(nextResults);
      proceedNext(nextResults);
    } catch (err) {
      console.error("Error cropping image:", err);
      // Fallback: keep original file on error
      const fallbackFile = currentItem.file;
      (fallbackFile as any).originalSize = (currentItem.file as any).originalSize || currentItem.file.size;
      (fallbackFile as any).originalSourceFile = (currentItem.file as any).originalSourceFile || currentItem.file;
      const nextResults = [...croppedResults, fallbackFile];
      setCroppedResults(nextResults);
      proceedNext(nextResults);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkipCrop = async () => {
    if (!currentItem) return;
    setIsProcessing(true);
    try {
      const originalSize = (currentItem.file as any).originalSize || currentItem.file.size;
      const webpFile = await optimizeImageToWebP(currentItem.file);
      (webpFile as any).originalSize = originalSize;
      (webpFile as any).originalSourceFile = (currentItem.file as any).originalSourceFile || currentItem.file;
      const nextResults = [...croppedResults, webpFile];
      setCroppedResults(nextResults);
      proceedNext(nextResults);
    } catch {
      const skipFile = currentItem.file;
      (skipFile as any).originalSize = (currentItem.file as any).originalSize || currentItem.file.size;
      (skipFile as any).originalSourceFile = (currentItem.file as any).originalSourceFile || currentItem.file;
      const nextResults = [...croppedResults, skipFile];
      setCroppedResults(nextResults);
      proceedNext(nextResults);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelAll = () => {
    resetModal();
    onCancel();
  };

  if (!isOpen || !currentItem) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between bg-slate-50/50 dark:bg-gray-800/50">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CropIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
              <span>{currentItem.file.name}</span>
              {isMultiple && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                  Photo {currentIndex + 1} of {queue.length}
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancelAll}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Canvas Area */}
        <div className="relative w-full h-[360px] sm:h-[440px] bg-slate-950 select-none overflow-hidden">
          <Cropper
            image={currentItem.previewUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
          />

          {/* Floating Aspect Ratio Presets */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg z-10">
            <span className="text-[10px] font-bold text-slate-400 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Frame:
            </span>
            <button
              type="button"
              onClick={() => setAspect(16 / 9)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                aspect === 16 / 9
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              16:9 (Hero & Cards)
            </button>
            <button
              type="button"
              onClick={() => setAspect(4 / 3)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                aspect === 4 / 3
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              4:3
            </button>
            <button
              type="button"
              onClick={() => setAspect(1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                aspect === 1
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              1:1 (Square)
            </button>
            <button
              type="button"
              onClick={() => setAspect(undefined)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                aspect === undefined
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              Free
            </button>
          </div>
        </div>

        {/* Footer & Controls */}
        <div className="p-4 sm:p-5 bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 flex-1 max-w-sm">
              <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400 shrink-0 w-10">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <p className="hidden md:block text-[11px] text-slate-400 italic">
              💡 Drag to position • What you frame here will be shown on the website with 0 cropping error.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkipCrop}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Keep Original (Skip)
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCancelAll}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    Cropping & Optimizing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {isMultiple && currentIndex + 1 < queue.length
                      ? "Apply & Next Photo"
                      : "Apply Crop & Save"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
