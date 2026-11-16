'use client';

import { useState } from 'react';
import { DestinationList } from './components/DestinationList';
import DestinationForm from '@/app/destinations/components/sections/DestinationForm';
import { Plus } from 'lucide-react';

export default function ManageDestinationsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDestinationCreated = () => {
    setShowCreateForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">Manage Destinations</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            Create, edit, or delete multilingual travel destinations across all languages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? 'Cancel' : 'Add New Destination'}
        </button>
      </div>

      {showCreateForm && (
        <DestinationForm onDestinationCreated={handleDestinationCreated} />
      )}

      <DestinationList key={refreshKey} />
    </div>
  );
}