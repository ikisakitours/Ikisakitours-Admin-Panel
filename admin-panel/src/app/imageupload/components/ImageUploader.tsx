"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Check, Image as ImageIcon } from "lucide-react";
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
}

interface ImageUploaderProps {
  onSaveToDatabase: (newAssets: PendingAsset[]) => Promise<void> | void;
}

export default function ImageUploader({ onSaveToDatabase }: ImageUploaderProps) {
  const [pendingAssets, setPendingAssets] = useState<PendingAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Stage raw files into local draft state
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const staged: PendingAsset[] = Array.from(files).map((file, idx) => {
      // Clean up default title (e.g. "my-banner-v2.png" -> "My Banner V2")
      const formattedTitle = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return {
        id: `draft-${Date.now()}-${idx}`,
        file,
        previewUrl: URL.createObjectURL(file),
        title: formattedTitle,
        alt: "", // User must fill this in manually for optimal SEO
      };
    });

    setPendingAssets((prev) => [...prev, ...staged]);
  };

  // 2. Update fields in draft state
  const handleUpdateDraft = (id: string, field: "title" | "alt", value: string) => {
    setPendingAssets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // 3. Remove item from draft preview
  const handleRemoveDraft = (id: string) => {
    setPendingAssets((prev) => prev.filter((item) => item.id !== id));
  };

  // 4. Save to Database & Cloud Storage
  const handleSubmitAll = async () => {
    if (pendingAssets.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSaveToDatabase(pendingAssets);
      setPendingAssets([]); // Clear draft queue upon success
    } catch (error) {
      console.error("Failed to save assets:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-slate-200/80">
      <CardHeader>
        <CardTitle className="text-base font-extrabold text-slate-900">
          SEO Image Uploader
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Stage images, enter SEO titles and alt tags, then save them directly to your database.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5">
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
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
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
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            Click or drag & drop images to stage them
          </p>
        </div>

        {/* Staged Form Fields (Populates below when files are picked) */}
        {pendingAssets.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                Staged for Upload ({pendingAssets.length})
              </span>
              
              <button
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                {isSubmitting ? "Saving..." : "Save All to Database"}
              </button>
            </div>

            {/* List of pending image cards with input fields */}
            <div className="space-y-3">
              {pendingAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center relative"
                >
                  {/* Thumbnail */}
                  <img
                    src={asset.previewUrl}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                  />

                  {/* Editable Title & Alt Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full pr-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={asset.title}
                        onChange={(e) =>
                          handleUpdateDraft(asset.id, "title", e.target.value)
                        }
                        placeholder="e.g. Chessboard Landing Hero"
                        className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        SEO Alt Tag
                      </label>
                      <input
                        type="text"
                        value={asset.alt}
                        onChange={(e) =>
                          handleUpdateDraft(asset.id, "alt", e.target.value)
                        }
                        placeholder="e.g. Chess tournament board with dark timber finish"
                        className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Discard staged image button */}
                  <button
                    onClick={() => handleRemoveDraft(asset.id)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
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