'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { destinationService, DestinationPayload } from '@/services/destination.service';
import DestinationForm from '@/app/destinations/components/sections/DestinationForm';

export default function EditDestinationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [destination, setDestination] = useState<DestinationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadDestination = async () => {
      try {
        setLoading(true);
        const data = await destinationService.getAdminDestinationById(id);
        setDestination(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load destination details');
      } finally {
        setLoading(false);
      }
    };

    loadDestination();
  }, [id]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href="/managedestinations"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Manage Destinations
        </Link>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-sm font-mono text-slate-500 dark:text-gray-400 animate-pulse">
            Loading destination data...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <DestinationForm
          initialData={destination}
          onSuccess={() => router.push('/managedestinations')}
        />
      )}
    </div>
  );
}