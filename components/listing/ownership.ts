import type { Listing } from '@/features/listings/types/listing.types';
import type { UserAccount } from '@/features/users/types/user.types';

type OwnerLike = string | { id?: string; _id?: string } | null | undefined;

function ownerIdOf(value: OwnerLike) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.id ?? value._id ?? null;
}

export function isListingOwner(listing: Listing, currentUser: UserAccount | null | undefined) {
  if (!currentUser?.id) return false;

  const listingRecord = listing as Listing & {
    owner?: OwnerLike;
    createdBy?: OwnerLike;
    ownerId?: string;
  };

  const ownerIds = [
    ownerIdOf(listingRecord.owner),
    ownerIdOf(listingRecord.createdBy),
    listingRecord.ownerId,
  ].filter(Boolean);

  return ownerIds.some((ownerId) => ownerId === currentUser.id);
}
