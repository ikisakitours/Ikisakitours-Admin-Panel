"use client";

import { FileText, Upload } from "lucide-react";

interface JsonImporterProps {
    onLoadJson: (jsonData: any) => void;
}

export default function JsonImporter({ onLoadJson }: JsonImporterProps) {
    const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonContent = JSON.parse(event.target?.result as string);
                onLoadJson(jsonContent);
                alert("Data file loaded successfully! Review the fields below.");
            } catch (err) {
                alert("Invalid JSON file format. Please check the file structure.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <div>
                    <p className="text-xs font-semibold text-slate-700">Import from JSON Data File</p>
                    <p className="text-[11px] text-slate-400">Upload a `.json` file to auto-populate blog fields.</p>
                </div>
            </div>
            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-100 shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                Upload JSON
                <input type="file" accept=".json" onChange={handleJsonFileUpload} className="hidden" />
            </label>
        </div>
    );
}