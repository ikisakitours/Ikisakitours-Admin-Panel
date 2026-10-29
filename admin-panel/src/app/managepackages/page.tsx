"use client";

import { PackagesTable } from "./components/PackagesTable";

export default function ManagePackagesPage() {
  const handleEditClick = (slug: string) => {
    console.log("Edit clicked for slug:", slug);
    // We will hook up the edit view here next!
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-200/60 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Manage Tour Packages
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          View, edit, or remove active packages from your system database.
        </p>
      </div>

      <PackagesTable onEdit={handleEditClick} />
    </div>
  );
}