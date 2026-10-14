'tsx'
'use client';

import React, { useState } from 'react';

interface DestinationFormProps {
  onSubmitSuccess?: () => void;
}

export default function DestinationForm({ onSubmitSuccess }: DestinationFormProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  
  // Highlights dynamic list
  const [highlights, setHighlights] = useState<string[]>(['']);
  
  // Images (Hero image at index 0, up to 5 more)
  const [images, setImages] = useState<string[]>(['']);

  // Extra metadata
  const [bestTimeToVisit, setBestTimeToVisit] = useState('');
  const [climate, setClimate] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [localCurrency, setLocalCurrency] = useState('');
  
  // Coordinates
  const [lat, setLat] = useState<number>(7.2906); // Default Kandy lat
  const [lng, setLng] = useState<number>(80.6337); // Default Kandy lng

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-slug generator
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isSlugManual) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  // Highlights handlers
  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...highlights];
    newHighlights[index] = value;
    setHighlights(newHighlights);
  };

  const addHighlightField = () => setHighlights([...highlights, '']);
  const removeHighlightField = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  // Image handlers
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => {
    if (images.length < 6) {
      setImages([...images, '']);
    }
  };

  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      title,
      slug: slug || undefined,
      summary,
      description,
      highlights: highlights.filter((h) => h.trim() !== ''),
      images: images.filter((img) => img.trim() !== ''),
      bestTimeToVisit,
      climate,
      primaryLanguage,
      localCurrency,
      coordinates: { lat, lng },
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ikisakitours-backend.vercel.app';
      const res = await fetch(`${apiUrl}/api/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create destination.');
      }

      setSuccessMessage('Destination created successfully!');
      // Reset form
      setTitle('');
      setSlug('');
      setSummary('');
      setDescription('');
      setHighlights(['']);
      setImages(['']);
      setBestTimeToVisit('');
      setClimate('');
      setPrimaryLanguage('');
      setLocalCurrency('');
      
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Add New Travel Destination</h2>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {successMessage && <div className="p-4 bg-green-50 text-green-600 rounded-lg">{successMessage}</div>}

      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Destination Title</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            required
            placeholder="e.g., Kandy"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugManual(true);
            }}
            placeholder="kandy"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Small Summary / Description</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
          rows={2}
          placeholder="Brief overview of the location..."
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Detailed Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          placeholder="In-depth information about culture, attractions, history..."
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Highlights */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Key Highlights</label>
        {highlights.map((highlight, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={highlight}
              onChange={(e) => handleHighlightChange(index, e.target.value)}
              placeholder={`Highlight #${index + 1}`}
              className="block w-full rounded-md border border-gray-300 p-2 shadow-sm"
            />
            {highlights.length > 1 && (
              <button
                type="button"
                onClick={() => removeHighlightField(index)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addHighlightField}
          className="mt-1 text-sm text-indigo-600 font-semibold hover:text-indigo-800"
        >
          + Add Another Highlight
        </button>
      </div>

      {/* Images (R2 URLs) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Images (Index 0 = Hero Image, up to 6 total)
        </label>
        {images.map((image, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              value={image}
              onChange={(e) => handleImageChange(index, e.target.value)}
              placeholder={index === 0 ? 'Hero Image URL' : `Gallery Image URL #${index}`}
              className="block w-full rounded-md border border-gray-300 p-2 shadow-sm"
            />
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => removeImageField(index)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {images.length < 6 && (
          <button
            type="button"
            onClick={addImageField}
            className="mt-1 text-sm text-indigo-600 font-semibold hover:text-indigo-800"
          >
            + Add Image URL
          </button>
        )}
      </div>

      {/* Quick Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Best Time to Visit</label>
          <input
            type="text"
            value={bestTimeToVisit}
            onChange={(e) => setBestTimeToVisit(e.target.value)}
            required
            placeholder="e.g., December to January"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Climate</label>
          <input
            type="text"
            value={climate}
            onChange={(e) => setClimate(e.target.value)}
            required
            placeholder="e.g., Tropical, Cool highlands"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Primary Language</label>
          <input
            type="text"
            value={primaryLanguage}
            onChange={(e) => setPrimaryLanguage(e.target.value)}
            required
            placeholder="e.g., Sinhala, Tamil, English"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Local Currency</label>
          <input
            type="text"
            value={localCurrency}
            onChange={(e) => setLocalCurrency(e.target.value)}
            required
            placeholder="e.g., Sri Lankan Rupee (LKR)"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>
      </div>

      {/* Map Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(parseFloat(e.target.value))}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(parseFloat(e.target.value))}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-indigo-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Publishing Destination...' : 'Publish Destination'}
      </button>
    </form>
  );
}