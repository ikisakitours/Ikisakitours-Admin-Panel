"use client";

import { Image as ImageIcon, X } from "lucide-react";

interface ImageUploaderProps {
    selectedFiles: File[];
    onFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveFile: (index: number) => void;
}

export default function ImageUploader({ selectedFiles, onFilesSelected, onRemoveFile }: ImageUploaderProps) {
    return (
        <div className="pt-4 border-t">
            <label className="block text-xs font-semibold mb-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Upload Gallery Images
            </label>
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={onFilesSelected}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
            />

            {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {selectedFiles.map((file, idx) => (
                        <span key={idx} className="flex items-center gap-2 bg-slate-100 text-xs px-3 py-1.5 rounded-lg border">
                            {file.name}
                            <button type="button" onClick={() => onRemoveFile(idx)}>
                                <X className="w-3.5 h-3.5 text-red-500 hover:text-red-700" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}