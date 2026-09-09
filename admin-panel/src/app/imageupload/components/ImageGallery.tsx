"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface AssetImage {
  id: string;
  url: string;
  name?: string;
}

interface ImageGalleryProps {
  images: AssetImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredImages = images.filter(
    (img) =>
      img.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.name && img.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="bg-white border-slate-200/80">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Uploaded Image Assets ({filteredImages.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Copy generated Cloudflare R2 image URLs for your database forms.
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by URL or name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {filteredImages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No uploaded images found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="group rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Image Preview */}
                <div className="relative h-40 bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={img.url}
                    alt="Uploaded asset"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* URL Display & Copy Action */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5">
                    <p className="text-[10px] text-slate-400 font-mono truncate select-all">
                      {img.url}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(img.id, img.url)}
                    className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                      copiedId === img.id
                        ? "bg-emerald-500 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs"
                    }`}
                  >
                    {copiedId === img.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        Copied URL!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Image URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}