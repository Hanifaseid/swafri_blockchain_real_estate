import type { Metadata } from 'next';
import { NewListingClient } from './_components/NewListingClient';

export const metadata: Metadata = { title: 'New Listing' };

export default function NewListingPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Create New Listing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete all five steps to publish your property.
        </p>
      </div>
      <NewListingClient />
    </div>
  );
}
