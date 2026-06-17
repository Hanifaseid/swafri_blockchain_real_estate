"use client";

import * as React from "react";
import Image from "next/image";
import { PhotoGallery } from "./PhotoGallery";
import { PropertyMetadata } from "./PropertyMetadata";
import { Heart, MapPin, FileCheck2, MessageSquare } from "lucide-react";
import { SESSION_KEYS, getCurrentUser } from "@/lib/auth/session";
import { apiClient } from "@/lib/api/axios-client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import { WalletConnectButton } from "@/components/ui/WalletConnectButton";
import { RentalApplicationCard } from "./RentalApplicationCard";
import type { PropertyPhoto } from "./types";

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <PhotoGallery photos={photos} title={listing.title ?? "Property"} />

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
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

          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <MapPin /> Location
            </h3>
            <iframe
              width="100%"
              height="360"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(normalizedAddress || (listing.title ?? ""))}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>

        <aside className="space-y-4">
          {/* Owner card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">
                  Listed by
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {listing.ownerName ?? "Platform"}
                </p>
              </div>
              <VerificationBadge
                blockchainHash={listing.blockchainHash}
                certificateId={listing.certificateId}
              />
            </div>
            <FavoriteButton listingId={listing.id} />
          </div>

          <RentalApplicationCard 
            listingId={listing.id} 
            title={listing.title} 
            monthlyRent={listing.monthlyRent} 
            currency={listing.currency} 
          />

          <InquiryCard listingId={listing.id} title={listing.title} />

          {/* Blockchain proof card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Blockchain Proof
            </h4>
            <p className="text-xs text-gray-500 break-all leading-relaxed">
              {listing.blockchainHash ??
                "No on-chain proof available for this listing."}
            </p>
            {listing.certificateId && (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                Certificate: {listing.certificateId}
              </p>
            )}
          </div>
        </aside>
      </div>
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
  if (!blockchainHash) {
    return (
      <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 border text-slate-600">
        Unverified
      </span>
    );
  }
  return (
    <div className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-2">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 12l2 2 4-4"
          stroke="#065f46"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified
    </div>
  );
}

function FavoriteButton({ listingId }: { listingId: string }) {
  const [fav, setFav] = React.useState<boolean>(() => {
    try {
      const user = getCurrentUser();
      const key = user
        ? SESSION_KEYS.FAVORITES(user.id)
        : "vex_favorites_user_guest";
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      const favs = raw ? (JSON.parse(raw) as string[]) : [];
      return favs.includes(listingId);
    } catch {
      return false;
    }
  });

  const toggle = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        window.location.href = "/portal/login";
        return;
      }
      const key = SESSION_KEYS.FAVORITES(user.id);
      const raw = localStorage.getItem(key);
      const favs = raw ? (JSON.parse(raw) as string[]) : [];
      const isSaved = favs.includes(listingId);
      const next = isSaved
        ? favs.filter((f) => f !== listingId)
        : [...favs, listingId];
      if (process.env.NEXT_PUBLIC_API_URL) {
        if (isSaved)
          await apiClient.delete(ENDPOINTS.FAVORITES.REMOVE(listingId));
        else await apiClient.post(ENDPOINTS.FAVORITES.SAVE, { listingId });
      }
      localStorage.setItem(key, JSON.stringify(next));
      setFav(!isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={fav}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        fav
          ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
      }`}
    >
      <Heart
        className={`w-4 h-4 ${fav ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}
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
  const [open, setOpen] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "/portal/login";
      return;
    }
    if (!msg.trim()) return alert("Please write an inquiry message");
    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        await apiClient.post(ENDPOINTS.INQUIRIES.SEND, {
          propertyId: listingId,
          message: msg,
          tenantName: user.name,
          tenantEmail: user.email,
        });
      } else {
        const raw = localStorage.getItem("vex_inquiries");
        const arr = raw ? JSON.parse(raw) : [];
        arr.push({
          id: Math.random().toString(36).slice(2),
          propertyId: listingId,
          message: msg,
          tenantName: user.name,
          tenantEmail: user.email,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("vex_inquiries", JSON.stringify(arr));
      }
      setMsg("");
      setOpen(false);
      alert("Inquiry submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit inquiry");
    }
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
            <MessageSquare className="w-3.5 h-3.5" />
            Enquire
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4">
          {!getCurrentUser() ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Please sign in to contact the lister.
              </p>
              <div className="flex gap-2">
                <Link
                  href="/portal/login"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign in
                </Link>
                <WalletConnectButton />
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                className="w-full p-3 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                rows={4}
                placeholder={`Message about ${title ?? "this property"}…`}
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
