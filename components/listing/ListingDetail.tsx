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
import { Modal } from "@/components/ui/Modal";
import { useSubmitOffer } from "@/features/offers/queries/offer.queries";
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

  const { mutate: submitOffer, isPending: creatingOffer } =
    useSubmitOffer();

  const [showOfferModal, setShowOfferModal] = React.useState(false);
  const [offerAmount, setOfferAmount] = React.useState<number>(
    listing.price ?? listing.monthlyRent ?? 0
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-4">

          <PhotoGallery
            photos={photos}
            title={listing.title ?? "Property"}
          />

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
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                normalizedAddress || listing.title || ""
              )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            />

          </div>

        </div>


        <aside className="space-y-4">

          <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between">

            <div>
              <p className="text-xs text-gray-500">
                Owner
              </p>

              <p className="font-semibold">
                {listing.ownerName ?? "Platform"}
              </p>
            </div>


            <div className="flex flex-col items-end gap-2">

              <VerificationBadge
                blockchainHash={listing.blockchainHash}
                certificateId={listing.certificateId}
              />

              <FavoriteButton listingId={listing.id}/>

            </div>

          </div>


          <InquiryCard
            listingId={listing.id}
            title={listing.title}
          />


          <div className="bg-white p-4 rounded-2xl border shadow-sm">

            <div className="flex items-center justify-between mb-3">

              <div>
                <p className="text-xs text-gray-500">
                  Make an offer
                </p>

                <p className="font-semibold">
                  Instant offer request
                </p>
              </div>


              <button
                type="button"
                onClick={() => setShowOfferModal(true)}
                className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-sm"
              >
                Offer Now
              </button>


            </div>


            <p className="text-sm text-gray-600">
              Submit an offer to the owner directly from this page.
            </p>

          </div>


          <div className="bg-white p-4 rounded-2xl border shadow-sm text-sm text-gray-600">

            <h4 className="font-bold mb-2 flex items-center gap-2">
              <FileCheck2 /> Blockchain Proof
            </h4>


            <p className="text-xs break-words">

              {listing.blockchainHash ??
                "No on-chain proof available for this listing."}

            </p>


            {listing.certificateId && (

              <p className="mt-2 text-xs text-emerald-600">
                Certificate: {listing.certificateId}
              </p>

            )}

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
          onSubmit={(e)=>{
            e.preventDefault();

            submitOffer({
              listingId: listing.id,
              offerPrice: offerAmount,
              currency:"USD",
              message: offerMessage.trim() || undefined,
            });

            setShowOfferModal(false);
          }}

          className="space-y-4"
        >

          <input
            type="number"
            value={offerAmount}
            onChange={(e)=>setOfferAmount(Number(e.target.value))}
            className="w-full border rounded-xl p-3"
          />


          <textarea
            value={offerMessage}
            onChange={(e)=>setOfferMessage(e.target.value)}
            className="w-full border rounded-xl p-3"
          />


          <button
            disabled={creatingOffer}
            className="w-full bg-emerald-600 text-white rounded-xl py-3"
          >

            {creatingOffer
              ? "Submitting offer..."
              : "Send Offer"}

          </button>


        </form>

      </Modal>


    </div>
  );
}



function VerificationBadge({
  blockchainHash,
}:{
  blockchainHash?:string;
}){

  return blockchainHash ? (

    <span className="text-xs text-emerald-600">
      Verified
    </span>

  ):(

    <span className="text-xs text-gray-500">
      Unverified
    </span>

  );

}




function FavoriteButton({
 listingId
}:{
 listingId:string
}){

 const [fav,setFav]=React.useState(false);


 return (

  <button
   onClick={()=>setFav(!fav)}
   className="px-3 py-2 rounded-full border"
  >

   <Heart
    className={fav?"text-rose-500":"text-gray-400"}
   />

  </button>

 );

}




function InquiryCard({
 listingId,
 title
}:{
 listingId:string;
 title?:string;
}){

 const [open,setOpen]=React.useState(false);
 const [msg,setMsg]=React.useState("");


 return (

<div className="bg-white p-4 rounded-2xl border shadow-sm">


<div className="flex items-center justify-between">

<div>

<p className="text-xs text-gray-500">
Interested?
</p>


<p className="font-semibold">
Contact the lister
</p>

</div>


<button
onClick={()=>setOpen(true)}
className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm flex items-center gap-2"
>

<MessageSquare className="w-4 h-4"/>

Enquire

</button>


</div>



{open && (

<div className="mt-3">


{!getCurrentUser() ? (

<div className="space-y-3">

<p className="text-sm">
Please sign in to contact the lister.
</p>


<div className="flex gap-2">

<Link
href="/portal/login"
className="px-3 py-2 rounded-xl border"
>
Sign in
</Link>


<WalletConnectButton/>


</div>


</div>

):(


<form className="space-y-2">


<textarea
value={msg}
onChange={(e)=>setMsg(e.target.value)}
rows={4}
className="w-full border rounded-md p-2"
/>


<button
className="bg-slate-900 text-white px-3 py-2 rounded-xl"
>
Send Inquiry
</button>


</form>


)}


</div>

)}


</div>

 );


}