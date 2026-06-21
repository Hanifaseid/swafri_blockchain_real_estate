import type { Metadata } from "next";
import { MarketplaceShell } from "@/components/layout/MarketplaceShell";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "VEX Property Register | Map-Based Web3 Real Estate Marketplace",
  description:
    "Explore blockchain-enabled property listings with map discovery, reviewed ownership evidence, digital title records, KYC review, and lease escrow workflows.",
  path: "/",
});

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketplaceShell>{children}</MarketplaceShell>;
}
