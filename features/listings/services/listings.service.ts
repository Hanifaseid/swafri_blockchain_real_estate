import { apiClient } from '@/lib/api/axios-client';
import { endpoints } from '@/lib/api/endpoints';
import { sleep } from '@/lib/utils';
import type { PropertySummary, PropertyFilters } from '../types';
import type { PropertyDetail } from '@/components/listing/types';
import type { Paginated } from '@/types';

/**
 * listings.service.ts — all listing API calls.
 *
 * Mock responses are returned when NEXT_PUBLIC_API_URL is localhost and
 * the real backend isn't running. Same interface — swapped in Phase 18.
 */

const IS_MOCK = process.env.NODE_ENV === 'development';

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_LISTINGS: PropertySummary[] = Array.from({ length: 12 }, (_, i) => ({
  id: `listing-${i + 1}`,
  title: ['Luxury Villa in Bole', 'Modern Apartment in Kazanchis', 'Commercial Space in Piassa',
    'Studio in CMC', 'Townhouse in Ayat', 'Office in Sarbet', 'Penthouse in Megenagna',
    'Family Home in Lafto', 'Shop in Merkato', 'Condo in Gerji', 'Land in Saris', 'Guesthouse in Lebu'][i],
  address: `House ${i + 1}, Main Street`,
  city: 'Addis Ababa',
  country: 'Ethiopia',
  price: (i + 1) * 85000 + 50000,
  currency: 'USD',
  image: `https://images.unsplash.com/photo-${['1580587771525-f5e8f3a9d6a4', '1564013799919-ab600027ffc6', '1512917774080-9991f1c4c750', '1600596542815-ffad4c1539a9', '1600585154340-be6161a56a0c', '1600047509807-ba8f99d2cdde', '1568605117036-5fe5e7bab0b7', '1583608205776-bfd35f0d9f83', '1560448204-e02f11c3d0e2', '1484154218962-a197022b5858', '1416331741576-38dc0e5374d1', '1600210492493-0946911123ea'][i]}?w=800&q=80`,
  listingType: i % 2 === 0 ? 'sale' : 'rent',
  type: i % 3 === 0 ? 'commercial' : 'residential',
  status: i === 2 ? 'pending' : 'active',
  tier: i === 0 ? 'featured' : i === 1 ? 'premium' : 'basic',
  beds: i % 3 === 0 ? undefined : (i % 4) + 1,
  baths: i % 3 === 0 ? undefined : (i % 3) + 1,
  sqft: 800 + i * 150,
  lat: 9.0258 + (i * 0.01 - 0.05),
  lng: 38.7578 + (i * 0.01 - 0.05),
  ownerId: 'owner-1',
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

// ── Service ───────────────────────────────────────────────────────────────────

export const listingsService = {
  async getListings(filters?: PropertyFilters): Promise<Paginated<PropertySummary>> {
    if (IS_MOCK) {
      await sleep(400);
      let items = [...MOCK_LISTINGS];
      if (filters?.listingType) items = items.filter(l => l.listingType === filters.listingType);
      if (filters?.type) items = items.filter(l => l.type === filters.type);
      if (filters?.query) items = items.filter(l =>
        l.title.toLowerCase().includes(filters.query!.toLowerCase()) ||
        l.city.toLowerCase().includes(filters.query!.toLowerCase())
      );
      if (filters?.minPrice) items = items.filter(l => l.price >= filters.minPrice!);
      if (filters?.maxPrice) items = items.filter(l => l.price <= filters.maxPrice!);
      if (filters?.beds) items = items.filter(l => (l.beds ?? 0) >= filters.beds!);
      const page = filters?.page ?? 1;
      const pageSize = filters?.pageSize ?? 9;
      const start = (page - 1) * pageSize;
      return {
        items: items.slice(start, start + pageSize),
        total: items.length,
        page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize),
      };
    }

    const { data } = await apiClient.get<{ data: Paginated<PropertySummary> }>(
      endpoints.listings.list,
      { params: filters }
    );
    return data.data;
  },

  async getFeatured(): Promise<PropertySummary[]> {
    if (IS_MOCK) {
      await sleep(300);
      return MOCK_LISTINGS.filter(l => l.tier === 'featured' || l.tier === 'premium').slice(0, 6);
    }
    const { data } = await apiClient.get<{ data: PropertySummary[] }>(endpoints.listings.featured);
    return data.data;
  },

  async getListing(id: string): Promise<PropertyDetail> {
    if (IS_MOCK) {
      await sleep(300);
      const base = MOCK_LISTINGS.find(l => l.id === id) ?? MOCK_LISTINGS[0];
      return {
        ...base,
        description: 'This stunning property offers modern amenities in a prime location. Featuring spacious rooms, high-quality finishes, and breathtaking views, it represents the pinnacle of luxury living in Addis Ababa.',
        photos: [
          { id: '1', url: base.image, alt: base.title, isPrimary: true },
          { id: '2', url: `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80`, alt: 'Living room', isPrimary: false },
          { id: '3', url: `https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80`, alt: 'Kitchen', isPrimary: false },
        ],
        amenities: [
          { id: 'wifi', label: 'Wi-Fi' },
          { id: 'ac', label: 'Air Conditioning' },
          { id: 'parking', label: 'Parking' },
          { id: 'security', label: 'Security / CCTV' },
          { id: 'elevator', label: 'Elevator' },
        ],
        yearBuilt: 2019,
        parkingSpaces: 2,
        titleVerified: true,
        owner: { id: 'owner-1', name: 'Abebe Girma', verified: true },
        viewCount: 142,
        favoriteCount: 18,
        updatedAt: new Date().toISOString(),
      };
    }

    const { data } = await apiClient.get<{ data: PropertyDetail }>(
      endpoints.listings.detail(id)
    );
    return data.data;
  },

  async getAllListingIds(): Promise<string[]> {
    if (IS_MOCK) return MOCK_LISTINGS.map(l => l.id);
    const { data } = await apiClient.get<{ data: Paginated<PropertySummary> }>(
      endpoints.listings.list, { params: { pageSize: 500, status: 'active' } }
    );
    return data.data.items.map(l => l.id);
  },

  async createListing(payload: FormData): Promise<PropertySummary> {
    const { data } = await apiClient.post<{ data: PropertySummary }>(
      endpoints.listings.create, payload,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data.data;
  },

  async updateListing(id: string, payload: Partial<PropertySummary>): Promise<PropertySummary> {
    const { data } = await apiClient.put<{ data: PropertySummary }>(
      endpoints.listings.update(id), payload
    );
    return data.data;
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(endpoints.listings.delete(id));
  },
};
