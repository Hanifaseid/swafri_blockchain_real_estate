import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Property Listings",
  description:
    "Browse blockchain-enabled property listings for sale and rent with structured metadata, photo galleries, location context, and ownership review status.",
  path: "/listings",
  keywords: ["property listings", "homes for sale", "homes for rent", "verified property listings"],
});

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
