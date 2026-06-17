import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ListingsManagerClient } from './_components/ListingsManagerClient';

export const metadata: Metadata = { title: 'My Listings' };

export default function ListingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your property listings.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/listings/new"><Plus size={15} />New Listing</Link>
        </Button>
      </div>
      <ListingsManagerClient />
    </div>
  );
}
