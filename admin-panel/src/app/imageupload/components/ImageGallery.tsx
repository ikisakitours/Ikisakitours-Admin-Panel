"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  Search,
  ExternalLink,
  Tag,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AssetImage } from "./ImageUploader";

interface ImageGalleryProps {
  images: AssetImage[];
  onUpdateMetadata: (id: string, field: "title" | "alt", value: string) => void;
  onDeleteImage: (id: string) => void;
}

export default function ImageGallery({
  images,
  onUpdateMetadata,
  onDeleteImage,
}: ImageGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredImages = images.filter(
    (img) =>
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.alt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-white border-slate-200/80">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Image Assets ({filteredImages.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Manage titles, SEO alt tags, and copy asset URLs for your site.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or alt tag..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {filteredImages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No images found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="group rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Image Preview Box */}
                <div className="relative h-44 bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-md bg-white/90 text-slate-700 hover:bg-white shadow-2xs transition-all"
                      title="Open image"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onDeleteImage(img.id)}
                      className="p-1.5 rounded-md bg-white/90 text-red-600 hover:bg-red-50 hover:text-red-700 shadow-2xs transition-all"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/70 text-white text-[10px] font-medium backdrop-blur-xs">
                    {img.size}
                  </span>
                </div>

                {/* Metadata Fields */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                        <FileText className="w-3 h-3" /> Title
                      </label>
                      <input
                        type="text"
                        value={img.title}
                        onChange={(e) =>
                          onUpdateMetadata(img.id, "title", e.target.value)
                        }
                        placeholder="Image title..."
                        className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200/80 rounded-md px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                        <Tag className="w-3 h-3 text-indigo-500" /> SEO Alt Tag
                      </label>
                      <textarea
                        rows={2}
                        value={img.alt}
                        onChange={(e) =>
                          onUpdateMetadata(img.id, "alt", e.target.value)
                        }
                        placeholder="Descriptive alt text for SEO..."
                        className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-md px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400">
                      {img.uploadedAt}
                    </span>

                    <button
                      onClick={() => handleCopyLink(img.id, img.url)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        copiedId === img.id
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60"
                      }`}
                    >
                      {copiedId === img.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}