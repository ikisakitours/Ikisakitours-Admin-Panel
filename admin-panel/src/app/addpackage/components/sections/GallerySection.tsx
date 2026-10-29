"use client";

import { Image as ImageIcon, X } from "lucide-react";

interface Props {
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export function GallerySection({ selectedFiles, setSelectedFiles }: Props) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-indigo-500" /> Gallery Images
      </h3>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white cursor-pointer"
      />
      {selectedFiles.length > 0 && (
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
          <p className="text-xs font-semibold text-indigo-900">Attached Images ({selectedFiles.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-xs text-slate-700">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button type="button" onClick={() => removeSelectedFile(idx)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}