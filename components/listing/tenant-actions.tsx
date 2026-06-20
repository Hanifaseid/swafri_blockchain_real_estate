"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

import { SESSION_KEYS } from "@/lib/auth/session";
import { apiClient } from "@/lib/api/axios-client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Modal } from "@/components/ui/Modal";
import { WalletConnectButton } from "@/components/ui/WalletConnectButton";
import { useSubmitOffer } from "@/features/offers/queries/offer.queries";
import { useSendInquiry } from "@/features/inquiries/queries/inquiry.queries";
import { useAuthStore } from "@/stores/auth.store";
import type { Listing } from "@/features/listings/types/listing.types";

// Shared tenant action surfaces used on both detail routes (/discovery/[id] and
// /listings/[id]) so the buyer/tenant can act from either entry point.

// ─── FavoriteSaveButton ──────────────────────────────────────────────────────
// Full-width "Save listing" button. Persists to the favorites API and mirrors to
// localStorage so the saved state survives offline / guest sessions.

export function FavoriteSaveButton({ listingId }: { listingId: string }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const favoriteKey = currentUser
    ? SESSION_KEYS.FAVORITES(currentUser.id)
    : "vex_favorites_guest";

  const [fav, setFav] = React.useState(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(favoriteKey) : null;
      return raw ? (JSON.parse(raw) as string[]).includes(listingId) : false;
    } catch {
      return false;
    }
  });

  const toggle = async () => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    const key = SESSION_KEYS.FAVORITES(currentUser.id);
    const arr: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const next = fav ? arr.filter((id) => id !== listingId) : [...arr, listingId];
    localStorage.setItem(key, JSON.stringify(next));
    setFav(!fav);
    try {
      fav
        ? await apiClient.delete(ENDPOINTS.FAVORITES.REMOVE(listingId))
        : await apiClient.post(ENDPOINTS.FAVORITES.SAVE, { listingId });
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
      <Heart className={`w-4 h-4 ${fav ? "fill-text-danger text-text-danger" : "text-text-muted"}`} />
      {fav ? "Saved" : "Save listing"}
    </button>
  );
}

// ─── InquiryCard ─────────────────────────────────────────────────────────────
// POST /inquiries — any authenticated user can contact the lister.

export function InquiryCard({ listing }: { listing: Listing }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { mutate: sendInquiry, isPending: submitting } = useSendInquiry();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [inquiryType, setInquiryType] = React.useState<"rent" | "buy" | "general">(
    listing.listingType === "rent" ? "rent" : listing.listingType === "sale" ? "buy" : "general",
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (!message.trim()) {
      toast.error("Please write a message.");
      return;
    }
    sendInquiry(
      {
        listingId: listing.id,
        inquiryType,
        message: message.trim(),
        contactInfo: currentUser.email ? { email: currentUser.email } : undefined,
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
    <div className="bg-surface-card rounded-2xl border border-border-primary p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-0.5">
            Interested?
          </p>
          <p className="text-sm font-semibold text-white">Contact the lister</p>
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
              <p className="text-sm text-text-muted">Please sign in to contact the lister.</p>
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
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value as "rent" | "buy" | "general")}
                className="w-full p-3 text-sm bg-surface-input border border-border-primary text-white rounded-xl focus:outline-none focus:border-accent-400 transition-colors"
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
                className="w-full p-3 text-sm text-white placeholder:text-text-placeholder bg-surface-input border border-border-primary rounded-xl resize-none focus:outline-none focus:border-accent-400 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send Inquiry"}
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

// ─── OfferCard ───────────────────────────────────────────────────────────────
// POST /offers — buyers make a purchase offer on a sale listing. The service
// maps offerPrice → amount for the backend.

export function OfferCard({ listing }: { listing: Listing }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { mutate: submitOffer, isPending: creatingOffer } = useSubmitOffer();
  const [showOfferModal, setShowOfferModal] = React.useState(false);
  const [offerAmount, setOfferAmount] = React.useState<number>(listing.price ?? 0);
  const [offerMessage, setOfferMessage] = React.useState("");

  return (
    <div className="bg-surface-card rounded-2xl border border-border-primary p-5">
      <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-0.5">
        Ready to buy?
      </p>
      <p className="text-sm font-semibold text-white mb-1">Make an offer</p>
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
            disabled={creatingOffer || offerAmount <= 0 || Number.isNaN(offerAmount)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-semibold text-sm disabled:bg-gray-800 disabled:text-text-muted transition-colors"
          >
            {creatingOffer ? "Submitting offer..." : "Send Offer"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
