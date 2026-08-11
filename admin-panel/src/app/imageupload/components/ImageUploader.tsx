"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Check, Image as ImageIcon, FileText, AlignLeft, Tag } from "lucide-react";
import exifr from "exifr";
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
  title: string;
  alt: string;
  description: string;
}

interface ImageUploaderProps {
  onSaveToDatabase: (newAssets: PendingAsset[]) => Promise<void> | void;
}

// Safely convert EXIF/XMP values (strings, arrays, or language objects) into plain text
const parseMetaString = (val: any): string => {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object") {
    return val["x-default"] || val.value || Object.values(val)[0]?.toString() || "";
  }
  return String(val);
};

export default function ImageUploader({ onSaveToDatabase }: ImageUploaderProps) {
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract embedded file metadata (IPTC / EXIF / XMP / Windows XP Tags / Filename fallback)
  const extractFileMetadata = async (file: File) => {
    const formattedTitle = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    let extractedTitle = "";
    let extractedAlt = "";
    let extractedDescription = "";

    try {
      const meta = await exifr.parse(file, {
        iptc: true,
        exif: true,
        xmp: true,
      });

      if (meta) {
        // 1. Title: Checks Windows XPTitle, XMP title, ObjectName, Headline
        extractedTitle = parseMetaString(
          meta.XPTitle || meta.ObjectName || meta.title || meta.headline
        );

        // 2. Description: Checks Windows XPSubject, EXIF Subject, Caption, or ImageDescription
        extractedDescription = parseMetaString(
          meta.XPSubject ||
          meta.Subject ||
          meta.Caption ||
          meta.ImageDescription ||
          meta.description ||
          meta.XPComment ||
          meta.CaptionAbstract
        );

        // 3. Alt Tag: Checks Windows XPKeywords (Tags), Keywords, or Headline
        extractedAlt = parseMetaString(
          meta.Headline ||
          meta.XPKeywords ||
          meta.Keywords ||
          extractedTitle
        );
      }
    } catch (err) {
      console.warn("Could not read EXIF/IPTC metadata from file:", err);
    }

    return {
      title: extractedTitle || formattedTitle,
      alt: extractedAlt || formattedTitle,
      description: extractedDescription,
    };
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    const stagedPromises = fileArray.map(async (file, idx) => {
      const { title, alt, description } = await extractFileMetadata(file);

      return {
        id: `draft-${Date.now()}-${idx}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title,
        alt,
        description,
      };
    });

    const staged = await Promise.all(stagedPromises);
    setPendingAssets((prev) => [...prev, ...staged]);
  };

  const handleUpdateDraft = (
    id: string,
    field: "title" | "alt" | "description",
    value: string
  ) => {
    setPendingAssets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveDraft = (id: string) => {
    setPendingAssets((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmitAll = async () => {
    if (pendingAssets.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSaveToDatabase(pendingAssets);
      setPendingAssets([]);
    } catch (error) {
      console.error("Failed to save assets:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-slate-200/80 shadow-xs">
      <CardHeader className="p-5 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900 tracking-tight">
          SEO Image Uploader
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 mt-0.5">
          Extracts title, alt tag, and description metadata from uploaded images.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
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
            handleFileSelect(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/60"
              : "border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-xs font-semibold text-slate-800 text-center">
            Click or drag & drop images to extract metadata
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Supports PNG, JPG, WebP with embedded EXIF / IPTC data
          </p>
        </div>

        {/* Staged Form List */}
        {pendingAssets.length > 0 && (
          <div className="space-y-4 pt-2">
            {/* Header / Save Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Staged for Upload ({pendingAssets.length})
              </span>

              <button
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {isSubmitting ? "Saving..." : "Save All to Database"}
              </button>
            </div>

            {/* List of Staged Asset Cards */}
            <div className="space-y-4">
              {pendingAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-4 items-start relative transition-shadow hover:shadow-2xs"
                >
                  {/* Image Preview */}
                  <div className="flex flex-col items-center gap-1 shrink-0 w-full sm:w-auto">
                    <img
                      src={asset.previewUrl}
                      alt="Preview"
                      className="w-28 h-28 object-cover rounded-lg border border-slate-200 bg-white shadow-xs"
                    />
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[110px]">
                      {asset.file.name}
                    </span>
                  </div>

                  {/* Metadata Input Fields */}
                  <div className="flex flex-col gap-3 w-full pr-0 sm:pr-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Title Input */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-indigo-500" />
                          Title
                        </label>
                        <input
                          type="text"
                          value={asset.title}
                          onChange={(e) =>
                            handleUpdateDraft(asset.id, "title", e.target.value)
                          }
                          placeholder="Image Title"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>

                      {/* Alt Tag Input */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-indigo-500" />
                          SEO Alt Tag
                        </label>
                        <input
                          type="text"
                          value={asset.alt}
                          onChange={(e) =>
                            handleUpdateDraft(asset.id, "alt", e.target.value)
                          }
                          placeholder="SEO Alt Tag"
                          className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Description Textarea */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        <AlignLeft className="w-3 h-3 text-indigo-500" />
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={asset.description}
                        onChange={(e) =>
                          handleUpdateDraft(asset.id, "description", e.target.value)
                        }
                        placeholder="Add a detailed description..."
                        className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-y"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveDraft(asset.id)}
                    className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
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