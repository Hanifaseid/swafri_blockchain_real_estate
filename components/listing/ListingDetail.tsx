"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileCheck2,
  Heart,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { PhotoGallery } from "./PhotoGallery";
import { PropertyMetadata } from "./PropertyMetadata";
import type { PropertyPhoto } from "./types";
import type { Listing } from "@/features/listings/types/listing.types";
import { getCurrentUser } from "@/lib/auth/session";
import { Modal } from "@/components/ui/Modal";
import { WalletConnectButton } from "@/components/ui/WalletConnectButton";
import { useSubmitOffer } from "@/features/offers/queries/offer.queries";
import { useSendInquiry } from "@/features/inquiries/queries/inquiry.queries";
import {
  useFavorites,
  useRemoveFavorite,
  useSaveFavorite,
} from "@/features/favorites/queries/favorite.queries";
import toast from "react-hot-toast";

function formatAreaSqft(listing: Listing): number | undefined {
  if (!listing.area) return undefined;
  if (listing.area.unit === "sqft") return listing.area.value;
  return Math.round(listing.area.value * 10.764);
}

function ownerLabel(createdBy: string): string {
  return createdBy ? `Owner #${createdBy.slice(0, 8)}` : "Property Owner";
}

function proofText(listing: Listing): string {
  if (listing.tokenId) {
    return `This listing has a minted title token (${listing.tokenId}).`;
  }

  if (listing.verificationStatus === "verified") {
    return "Ownership documents have been verified, but the on-chain title has not been minted yet.";
  }

  return `Verification status: ${listing.verificationStatus.replace(/_/g, " ")}.`;
}

export default function ListingDetail({ listing }: { listing: Listing }) {
  const placeholderImage = "/placeholder-property.jpg";
  const currentUser = getCurrentUser();
  const { mutate: submitOffer, isPending: creatingOffer } = useSubmitOffer();

  const [showOfferModal, setShowOfferModal] = React.useState(false);
  const [offerAmount, setOfferAmount] = React.useState<number>(listing.price ?? 0);
  const [offerMessage, setOfferMessage] = React.useState("");

  const photos: PropertyPhoto[] =
    listing.photos && listing.photos.length > 0
      ? listing.photos.map((photo, index) => ({
          id: String(photo.publicId ?? index),
          url: photo.url ?? placeholderImage,
          alt: listing.title,
          isPrimary: Boolean(photo.isCover) || index === 0,
        }))
      : [
          {
            id: "cover",
            url: placeholderImage,
            alt: listing.title,
            isPrimary: true,
          },
        ];

  const normalizedAddress = [
    listing.address.street,
    listing.address.city,
    listing.address.region,
    listing.address.country,
  ]
    .filter(Boolean)
    .join(", ");

  const metadataListing = {
    title: listing.title,
    description: listing.description ?? "",
    price: listing.price ?? listing.monthlyRent ?? 0,
    currency: listing.currency ?? "USD",
    listingType: listing.listingType,
    status: "active",
    tier: "basic",
    address: normalizedAddress,
    city: listing.address.city,
    country: listing.address.country,
    beds: listing.bedrooms,
    baths: listing.bathrooms,
    sqft: formatAreaSqft(listing),
    parkingSpaces: listing.parkingSpaces,
    yearBuilt: listing.yearBuilt,
    floorNumber: listing.floorNumber,
    totalFloors: listing.totalFloors,
    type: listing.category,
    amenities: listing.amenities.map((amenity, index) => ({
      id: `${index}-${amenity}`,
      label: amenity,
    })),
  } as const;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-4">
        <Link
          href="/properties"
          aria-label="Browse properties"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse properties</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <PhotoGallery photos={photos} title={listing.title} />

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <PropertyMetadata listing={metadataListing as any} />
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" /> Location
            </h3>

            <iframe
              width="100%"
              height="360"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                normalizedAddress || listing.title,
              )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">
              Listed by
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-3">
              {ownerLabel(listing.createdBy)}
            </p>
            <div className="flex items-center justify-between mb-3">
              <VerificationBadge
                verificationStatus={listing.verificationStatus}
                tokenId={listing.tokenId}
              />
            </div>
            <FavoriteActionButton listingId={listing.id} />
          </div>

          <InquiryCard listing={listing} />

          {listing.listingType === "sale" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">
                Ready to buy?
              </p>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Make an offer
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Submit a direct offer to the owner from this page.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    toast.error("Please sign in to submit an offer.");
                    return;
                  }
                  setShowOfferModal(true);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Offer Now
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Verification Status
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {proofText(listing)}
            </p>
          </div>
        </aside>
      </div>

      <Modal
        open={showOfferModal}
        onOpenChange={setShowOfferModal}
        title="Make an Offer"
        description={`Submit an offer for ${listing.title}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!currentUser) {
              toast.error("Please sign in to submit an offer.");
              return;
            }

            if (offerAmount <= 0 || Number.isNaN(offerAmount)) {
              toast.error("Enter a valid offer amount.");
              return;
            }

            submitOffer(
              {
                listingId: listing.id,
                offerPrice: offerAmount,
                currency: listing.currency ?? "USD",
                message: offerMessage.trim() || undefined,
              },
              {
                onSuccess: () => {
                  setShowOfferModal(false);
                  setOfferMessage("");
                  setOfferAmount(listing.price ?? 0);
                },
              },
            );
          }}
          className="space-y-4"
        >
          <input
            type="number"
            min={1}
            value={offerAmount}
            onChange={(e) => setOfferAmount(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
          />

          <textarea
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
            placeholder="Add a message to the owner (optional)"
          />

          <button
            type="submit"
            disabled={creatingOffer || offerAmount <= 0 || Number.isNaN(offerAmount)}
            className="w-full bg-emerald-600 text-white rounded-xl py-3 disabled:bg-gray-200 disabled:text-gray-400"
          >
            {creatingOffer ? "Submitting offer..." : "Send Offer"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function VerificationBadge({
  verificationStatus,
  tokenId,
}: {
  verificationStatus: Listing["verificationStatus"];
  tokenId?: string;
}) {
  if (tokenId) {
    return <span className="text-xs text-emerald-600">Verified on-chain</span>;
  }

  if (verificationStatus === "verified") {
    return <span className="text-xs text-emerald-600">Documents verified</span>;
  }

  return (
    <span className="text-xs text-gray-500 capitalize">
      {verificationStatus.replace(/_/g, " ")}
    </span>
  );
}

function FavoriteActionButton({ listingId }: { listingId: string }) {
  const currentUser = getCurrentUser();
  const { data: favorites = [] } = useFavorites(Boolean(currentUser));
  const { mutate: save, isPending: saving } = useSaveFavorite();
  const { mutate: remove, isPending: removing } = useRemoveFavorite();

  const isSaved = favorites.some((favorite) => favorite.id === listingId);
  const isPending = saving || removing;

  const handleToggle = () => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    if (isPending) return;
    if (isSaved) remove(listingId);
    else save(listingId);
  };

  return (
    <button
      onClick={handleToggle}
      aria-pressed={isSaved}
      disabled={isPending}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
        isSaved
          ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
      }`}
    >
      <Heart
        className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}
      />
      {isSaved ? "Saved" : "Save listing"}
    </button>
  );
}

function InquiryCard({ listing }: { listing: Listing }) {
  const currentUser = getCurrentUser();
  const { mutate: sendInquiry, isPending } = useSendInquiry();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [inquiryType, setInquiryType] = React.useState<"rent" | "buy" | "general">(
    listing.listingType === "rent"
      ? "rent"
      : listing.listingType === "sale"
        ? "buy"
        : "general",
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      window.location.href = "/login";
      return;
    }

    if (!message.trim()) {
      toast.error("Please write a message.");
      return;
    }

    sendInquiry(
      {
        listingId: listing.id,
        message: message.trim(),
        inquiryType,
        contactInfo:
          currentUser.email || currentUser.phone
            ? {
                email: currentUser.email,
                phone: currentUser.phone,
              }
            : undefined,
      },
      {
        onSuccess: () => {
          setMessage("");
          setOpen(false);
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">
            Interested?
          </p>
          <p className="text-sm font-semibold text-gray-900">
            Contact the lister
          </p>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Enquire
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4">
          {!currentUser ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Please sign in to contact the lister.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign in
                </Link>
                <WalletConnectButton />
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <select
                value={inquiryType}
                onChange={(e) =>
                  setInquiryType(e.target.value as "rent" | "buy" | "general")
                }
                className="w-full p-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
              >
                <option value="general">General inquiry</option>
                {listing.listingType === "rent" && (
                  <option value="rent">Interested in renting</option>
                )}
                {listing.listingType === "sale" && (
                  <option value="buy">Interested in buying</option>
                )}
              </select>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder={`Message about ${listing.title}…`}
                className="w-full p-3 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {isPending ? "Sending..." : "Send Inquiry"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
