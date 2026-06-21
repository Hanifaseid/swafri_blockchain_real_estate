import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Map Property Search",
  description:
    "Search sale and rental properties on an interactive map with viewport, radius, polygon, geocoding, neighborhood, price, amenity, and verification filters.",
  path: "/discovery",
  keywords: ["map property search", "real estate discovery", "geospatial property listings"],
});

export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
