"use client";

import * as React from "react";
import Image from "next/image";
import { PhotoGallery } from "./PhotoGallery";
import { PropertyMetadata } from "./PropertyMetadata";
import {
  Heart,
  MapPin,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { SESSION_KEYS } from "@/lib/auth/session";
import { apiClient } from "@/lib/api/axios-client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import toast from "react-hot-toast";
import { WalletConnectButton } from "@/components/ui/WalletConnectButton";
import { Modal } from "@/components/ui/Modal";
import { useSubmitOffer } from "@/features/offers/queries/offer.queries";
import type { PropertyPhoto } from "./types";
import { TitleCertificatePanel } from "./TitleCertificatePanel";
import { useAuthStore } from "@/stores/auth.store";

type ListingAddress = {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
};

interface ListingProp {
  id: string;
  title?: string;
  description?: string;
  listingType?: "sale" | "rent";
  price?: number;
  monthlyRent?: number;
  currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  address?: string | ListingAddress;
  city?: string;
  country?: string;
  photos?: { url: string }[];
  blockchainHash?: string;
  certificateId?: string;
  ownerName?: string;
}

export default function ListingDetail({ listing }: { listing: ListingProp }) {
  const placeholderImage = "/placeholder-property.jpg";

  const { mutate: submitOffer, isPending: creatingOffer } = useSubmitOffer();
  const currentUser = useAuthStore((s) => s.currentUser);

  const [showOfferModal, setShowOfferModal] = React.useState(false);
  const [offerAmount, setOfferAmount] = React.useState<number>(
    listing.price ?? listing.monthlyRent ?? 0,
  );
  const [offerMessage, setOfferMessage] = React.useState("");

  const photos: PropertyPhoto[] =
    listing.photos && listing.photos.length > 0
      ? listing.photos.map((p: any, i: number) => ({
          id: String(p.publicId ?? i),
          url: p.url ?? placeholderImage,
          alt: listing.title ?? undefined,
          isPrimary: !!p.isCover || i === 0,
        }))
      : [
          {
            id: "cover",
            url: placeholderImage,
            alt: listing.title ?? undefined,
            isPrimary: true,
          },
        ];

  const normalizedAddress =
    typeof listing.address === "string"
      ? listing.address
      : listing.address
        ? [
            listing.address.street,
            listing.address.city,
            listing.address.region,
            listing.address.country,
          ]
            .filter(Boolean)
            .join(", ")
        : "";

  const city =
    listing.city ??
    (typeof listing.address === "object" && listing.address?.city) ??
    "";

  const country =
    listing.country ??
    (typeof listing.address === "object" && listing.address?.country) ??
    "";

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-4">
        <Link
          href="/discovery"
          aria-label="Browse properties"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-card border border-border-primary text-sm font-medium text-text-secondary hover:bg-surface-highlight hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse properties</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <PhotoGallery photos={photos} title={listing.title ?? "Property"} />

          <div className="bg-surface-card p-6 rounded-2xl border border-border-primary">
            <PropertyMetadata
              listing={
                {
                  title: listing.title ?? "",
                  description: listing.description ?? "",
                  price: listing.price ?? listing.monthlyRent ?? 0,
                  currency: listing.currency ?? "USD",
                  listingType: listing.monthlyRent ? "rent" : "sale",
                  status: "active",
                  tier: "basic",
                  address: normalizedAddress,
                  city,
                  country,
                  beds: listing.bedrooms,
                  baths: listing.bathrooms,
                  sqft: listing.sqft,
                  parkingSpaces: undefined,
                  yearBuilt: undefined,
                  floorNumber: undefined,
                  totalFloors: undefined,
                  type: "apartment",
                  amenities: [],
                } as any
              }
            />
          </div>

          <div className="bg-surface-card p-6 rounded-2xl border border-border-primary">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-text-muted" /> Location
            </h3>

            <iframe
              width="100%"
              height="360"
              style={{ border: 0, borderRadius: '12px' }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                normalizedAddress || listing.title || "",
              )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>

        <aside className="space-y-4">
          {/* ── Owner card ─────────────────────────────────────────────── */}
          <div className="bg-surface-card rounded-2xl border border-border-primary p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-0.5">
              Listed by
            </p>
            <p className="text-sm font-semibold text-white mb-3">
              {listing.ownerName ?? "Platform"}
            </p>
            <div className="flex items-center justify-between mb-3">
              <VerificationBadge
                blockchainHash={listing.blockchainHash}
                certificateId={listing.certificateId}
              />
            </div>
            <FavoriteButton listingId={listing.id} />
          </div>

          {/* ── Inquiry card ───────────────────────────────────────────── */}
          <InquiryCard listingId={listing.id} title={listing.title} />

          {/* ── Make an offer ──────────────────────────────────────────── */}
          {listing.listingType === "sale" && (
            <div className="bg-surface-card rounded-2xl border border-border-primary p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-0.5">
                Ready to buy?
              </p>
              <p className="text-sm font-semibold text-white mb-1">
                Make an offer
              </p>
              <p className="text-xs text-text-muted mb-3">
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

          {/* ── On-chain Certificate of Title ──────────────────────────── */}
          <TitleCertificatePanel listingId={listing.id} />
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
                  setOfferAmount(listing.price ?? listing.monthlyRent ?? 0);
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
            className="w-full border border-border-primary rounded-xl p-3 text-sm text-white placeholder:text-text-placeholder bg-surface-input focus:outline-none focus:border-accent-400 transition-colors"
          />

          <textarea
            value={offerMessage}
            onChange={(e) => setOfferMessage(e.target.value)}
            className="w-full border border-border-primary rounded-xl p-3 text-sm text-white placeholder:text-text-placeholder bg-surface-input focus:outline-none focus:border-accent-400 transition-colors"
            placeholder="Add a message to the owner (optional)"
          />

          <button
            type="submit"
            disabled={
              creatingOffer || offerAmount <= 0 || Number.isNaN(offerAmount)
            }
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-semibold text-sm disabled:bg-gray-800 disabled:text-text-muted transition-colors"
          >
            {creatingOffer ? "Submitting offer..." : "Send Offer"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function VerificationBadge({
  blockchainHash,
  certificateId,
}: {
  blockchainHash?: string;
  certificateId?: string;
}) {
  return blockchainHash ? (
    <span className="text-xs text-emerald-400 font-medium">Verified</span>
  ) : (
    <span className="text-xs text-text-muted">Unverified</span>
  );
}

function FavoriteButton({ listingId }: { listingId: string }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const favoriteKey = currentUser ? SESSION_KEYS.FAVORITES(currentUser.id) : "vex_favorites_guest";
  const optimisticKey = `${favoriteKey}:${listingId}`;
  const [optimisticFavs, setOptimisticFavs] = React.useState<Record<string, boolean>>({});

  const storedFav = React.useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(favoriteKey) : null;
      return raw ? (JSON.parse(raw) as string[]).includes(listingId) : false;
    } catch {
      return false;
    }
  }, [favoriteKey, listingId]);

  const fav = optimisticFavs[optimisticKey] ?? storedFav;

  const toggle = async () => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    const key = SESSION_KEYS.FAVORITES(currentUser.id);
    const arr: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const next = fav
      ? arr.filter((id) => id !== listingId)
      : [...arr, listingId];
    localStorage.setItem(key, JSON.stringify(next));
    setOptimisticFavs((existing) => ({ ...existing, [optimisticKey]: !fav }));
    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        fav
          ? await apiClient.delete(ENDPOINTS.FAVORITES.REMOVE(listingId))
          : await apiClient.post(ENDPOINTS.FAVORITES.SAVE, { listingId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={fav}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
        fav
          ? "bg-surface-danger text-text-danger border-text-danger/20 hover:bg-surface-danger/80"
          : "bg-surface-highlight text-text-secondary border-border-primary hover:bg-surface-card hover:text-white"
      }`}
    >
      <Heart
        className={`w-4 h-4 ${fav ? "fill-text-danger text-text-danger" : "text-text-muted"}`}
      />
      {fav ? "Saved" : "Save listing"}
    </button>
  );
}
function InquiryCard({
  listingId,
  title,
}: {
  listingId: string;
  title?: string;
}) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [open, setOpen] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (!msg.trim()) {
      alert("Please write a message");
      return;
    }
    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        await apiClient.post(ENDPOINTS.INQUIRIES.SEND, {
          propertyId: listingId,
          message: msg,
          tenantName: currentUser.name,
          tenantEmail: currentUser.email,
        });
      } else {
        const arr = JSON.parse(localStorage.getItem("vex_inquiries") ?? "[]");
        arr.push({
          id: Math.random().toString(36).slice(2),
          propertyId: listingId,
          message: msg,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("vex_inquiries", JSON.stringify(arr));
      }
      setMsg("");
      setOpen(false);
      alert("Inquiry submitted!");
    } catch {
      alert("Failed to submit inquiry");
    }
  };

  return (
    <div className="bg-surface-card rounded-2xl border border-border-primary p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-0.5">
            Interested?
          </p>
          <p className="text-sm font-semibold text-white">
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
              <p className="text-sm text-text-muted">
                Please sign in to contact the lister.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link
                  href="/auth/login"
                  className="px-3 py-2 rounded-xl border border-border-primary text-xs font-medium text-text-secondary hover:bg-surface-highlight transition-colors"
                >
                  Sign in
                </Link>
                <WalletConnectButton />
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-xl border border-border-primary text-xs font-medium text-text-muted hover:bg-surface-highlight transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={4}
                placeholder={`Message about ${title ?? "this property"}…`}
                className="w-full p-3 text-sm text-white placeholder:text-text-placeholder bg-surface-input border border-border-primary rounded-xl resize-none focus:outline-none focus:border-accent-400 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Send Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border-primary text-xs font-medium text-text-muted hover:bg-surface-highlight transition-colors"
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
