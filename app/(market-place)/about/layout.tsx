import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "About VEX Property Register",
  description:
    "Learn how VEX connects map-based property discovery, ownership review, digital title records, KYC, and escrow-ready real estate workflows.",
  path: "/about",
  keywords: ["about VEX", "blockchain property marketplace", "digital title records"],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
