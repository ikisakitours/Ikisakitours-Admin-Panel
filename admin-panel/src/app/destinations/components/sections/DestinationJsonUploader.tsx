"use client";

import React, { useRef } from "react";
import { Upload, FileJson } from "lucide-react";

interface DestinationJsonUploaderProps {
  onDataLoaded: (parsedData: any) => void;
}

export default function DestinationJsonUploader({ onDataLoaded }: DestinationJsonUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target?.result as string);
        onDataLoaded(jsonContent);
      } catch (err) {
        alert("Invalid JSON file. Please check the file format.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    
    // Reset file input so the same file can be uploaded again if needed
    e.target.value = "";
  };

  return (
    <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-md">
          <FileJson className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Import Destination via JSON
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload a JSON file containing multilingual fields for this destination.
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors cursor-pointer"
      >
        <Upload className="w-4 h-4" />
        <span>Upload JSON</span>
      </button>
    </div>
  );
}