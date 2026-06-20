import { notFound } from "next/navigation";
import { getListing } from "@/features/listings/services/listing.service";
import ListingDetail from "@/components/listing/ListingDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="py-6">
      <ListingDetail listing={listing} />
    </div>
  );
}
