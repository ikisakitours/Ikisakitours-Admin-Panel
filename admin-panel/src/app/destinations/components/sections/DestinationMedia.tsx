// components/destinations/DestinationMedia.tsx
import { X } from "lucide-react";

interface DestinationMediaProps {
  selectedFiles: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

export default function DestinationMedia({
  selectedFiles,
  onFileSelect,
  onRemoveFile,
}: DestinationMediaProps) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">
        Images <span className="text-slate-400 font-normal">(Index 0 = Hero Image, up to 6 max)</span>
      </label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={onFileSelect}
        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
      />

      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedFiles.map((file, idx) => (
            <span key={idx} className="flex items-center gap-1 bg-slate-100 text-xs px-2 py-1 rounded">
              {idx === 0 ? "★ Hero: " : ""}{file.name}
              <button type="button" onClick={() => onRemoveFile(idx)}>
                <X className="w-3 h-3 text-red-500" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}