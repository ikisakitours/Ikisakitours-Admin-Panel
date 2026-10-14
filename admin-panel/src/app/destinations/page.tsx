'tsx'
import DestinationForm from './components/DestinationForm';

export default function DestinationsAdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Destination Management</h1>
        <p className="text-gray-600 mt-1">Add new travel destinations for the public readers.</p>
      </div>

      <DestinationForm />
    </main>
  );
}