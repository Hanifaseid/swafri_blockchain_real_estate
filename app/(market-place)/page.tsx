import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Find Property With Proof Built In",
  description:
    "Search a map-first Web3 real estate marketplace with reviewed property listings, digital title records, KYC review, lease escrow, and transparent transaction workflows.",
  path: "/",
  keywords: ["web3 real estate", "blockchain property listings", "map real estate marketplace"],
});

export default function Home() {
  return <LandingPage />;
}
